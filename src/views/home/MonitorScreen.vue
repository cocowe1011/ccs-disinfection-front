<template>
  <div class="smart-workshop">
    <!-- 添加标题区域 -->
    <div class="header" v-show="false">
      <img src="@/assets/header.png" alt="header" class="header-bg">
      <div class="header-content">
        <div class="title">智慧灭菌大屏监控</div>
        <div class="current-time">{{ currentTime }}</div>
      </div>
    </div>
    <!-- 内容区包装器 -->
    <div class="content-wrapper">
      <!-- 左侧面板 -->
      <div class="side-info-panel">
        <!-- PLC状态与订单信息区域 -->
        <div class="plc-info-section">
          <div class="section-header">
            订单信息与PLC状态
          </div>
          <div class="scrollable-content" style="margin-top: 5px;">
            <div class="status-overview">
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop granient-text">当前批次id</div>
                  <div class="data-card-border-borderDown" style="font-size: 1.3vw;">123456678</div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">产品名称</div>
                  <div class="data-card-border-borderDown">一次性口罩</div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">指定预热房</div>
                  <div class="data-card-border-borderDown">A1</div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">指定灭菌柜</div>
                  <div class="data-card-border-borderDown">1#</div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">进货口</div>
                  <div class="data-card-border-borderDown">一楼</div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">出货口</div>
                  <div class="data-card-border-borderDown">立体库</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 订单信息列表区域 -->
        <div class="order-list-section">
          <div class="section-header">
            订单信息列表
            <div class="order-tabs">
              <div 
                class="order-tab" 
                :class="{ active: activeOrderTab === 'current' }"
                @click="activeOrderTab = 'current'"
              >
                当前订单
              </div>
              <div 
                class="order-tab" 
                :class="{ active: activeOrderTab === 'history' }"
                @click="activeOrderTab = 'history'"
              >
                历史订单
              </div>
            </div>
          </div>
          <div class="scrollable-content">
            <div class="order-list">
              <div 
                v-for="order in ordersList" 
                :key="order.id"
                class="order-item"
                :class="order.status"
              >
                <div class="order-main">
                  <div class="order-header">
                    <span class="order-id">{{ order.id }}</span>
                    <span class="order-status">{{ getStatusText(order.status) }}</span>
                  </div>
                  <div class="order-info">
                    <div class="info-row">
                      <div class="info-item">
                        <span class="info-label">产品名称</span>
                        <span class="info-value">{{ order.productName }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <div class="info-item">
                        <span class="info-label">订单时间</span>
                        <span class="info-value">{{ formatDateTime(order.startTime) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  v-if="order.status === 'pending'"
                  class="switch-order-btn" 
                  :class="{ 'loading': order.isLoading }"
                  @click="switchOrder(order)"
                  :disabled="order.isLoading"
                >
                  <i v-if="order.isLoading" class="el-icon-loading"></i>
                  <span>{{ order.isLoading ? '切换中' : '切换订单' }}</span>
                </button>
                <button 
                  v-if="order.status === 'running'"
                  class="switch-order-btn complete-btn" 
                  :class="{ 'loading': order.isLoading }"
                  @click="switchOrder(order)"
                  :disabled="order.isLoading"
                >
                  <i v-if="order.isLoading" class="el-icon-loading"></i>
                  <span>{{ order.isLoading ? '切换中' : '完成订单' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作区 -->
        <div class="operation-panel">
          <div class="section-header">
            操作区
          </div>
          <div class="operation-buttons">
            <button @click="toggleButtonState('start')" :class="{'pressed': buttonStates.start}">
              <i class="el-icon-switch-button"></i><span>全线启动</span>
            </button>
            <button @click="toggleButtonState('stop')" :class="{'pressed': buttonStates.stop}">
              <i class="el-icon-error"></i><span>全线停止</span>
            </button>
            <button @click="toggleButtonState('reset')" :class="{'pressed': buttonStates.reset}">
              <i class="el-icon-video-pause"></i><span>全线暂停</span>
            </button>
            <button @click="toggleButtonState('fault_reset')" :class="{'pressed': buttonStates.fault_reset}">
              <i class="el-icon-refresh"></i><span>故障复位</span>
            </button>
            <button @click="toggleButtonState('clear')" :class="{'pressed': buttonStates.clear}">
              <i class="el-icon-delete"></i><span>全线清空</span>
            </button>
          </div>
        </div>

        <!-- 日志区域 -->
        <div class="log-section">
          <div class="section-header">
            日志区
            <div class="log-tabs">
              <div 
                class="log-tab" 
                :class="{ active: activeLogType === 'running' }"
                @click="activeLogType = 'running'"
              >
                运行日志
              </div>
              <div 
                class="log-tab" 
                :class="{ active: activeLogType === 'alarm' }"
                @click="activeLogType = 'alarm'"
              >
                报警日志
                <div v-if="unreadAlarms > 0" class="alarm-badge">{{ unreadAlarms }}</div>
              </div>
            </div>
          </div>
          <div class="scrollable-content">
            <div class="log-list">
              <div 
                v-for="log in currentLogs" 
                :key="log.id"
                :class="['log-item', { 'alarm': log.type === 'alarm', 'unread': log.unread }]"
                @click="markAsRead(log)"
              >
                <div class="log-time">{{ formatTime(log.timestamp) }}</div>
                <div class="log-item-content">{{ log.message }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧内容区域 -->
      <div class="main-content">
        <div class="floor-container">
          <!-- 左侧区域 -->
          <div class="floor-left">
            <div class="floor-title">
              <i class="el-icon-office-building"></i> 一楼区域
            </div>
            <div class="floor-image-container">
              <div class="image-wrapper">
                <img src="@/assets/floor1.png" alt="一楼平面图" class="floor-image" @load="updateMarkerPositions">
                <!-- 修改小车元素 -->
                <div 
                  v-for="cart in carts" 
                  :key="cart.id"
                  class="cart-container" 
                  :data-x="cart.x" 
                  :data-y="cart.y" 
                  :data-width="cart.width"
                >
                  <img :src="cart.image" :alt="cart.name" class="cart-image">
                </div>
                <div class="marker" data-x="200" data-y="150">
                  <div class="pulse"></div>
                  <div class="marker-label">电机101#</div>
                </div>
                <div class="marker marker-show-label" data-x="350" data-y="250">
                  <div class="pulse"></div>
                  <div class="marker-label">光电A</div>
                </div>
                <!-- 上货扫码区域提示 -->
                <div class="marker-with-panel" data-x="1365" data-y="1120">
                  <div class="pulse"></div>
                  <div class="data-panel" :class="['position-left', { 'always-show': true }]">
                    <div class="data-panel-header">上货扫码信息</div>
                    <div class="data-panel-content">
                      <div class="data-panel-row">
                        <span class="data-panel-label">当前批次：</span>
                        <span>20240315001</span>
                      </div>
                      <div class="data-panel-row">
                        <span class="data-panel-label">当前上货扫码信息：</span>
                        <span>20240315001</span>
                      </div>
                      <div class="data-panel-row">
                        <span>
                          <i class="el-icon-success" style="color: #67c23a;"></i>
                          <span class="data-panel-label" style="color: #67c23a; font-weight: bold;">当前批次上货完成，允许执行下一订单</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 上货点信息 -->
                <div class="marker-with-panel" data-x="1490" data-y="900">
                  <div class="pulse"></div>
                  <div class="data-panel" style="width: 90px;" :class="['position-right', { 'always-show': true, 'vertical-layout': true }]">
                    <div class="data-panel-header">上货点信息</div>
                    <div class="data-panel-content">
                      <div class="data-panel-row">
                        <span>
                          <i class="el-icon-success" style="color: #67c23a;"></i>
                          <span style="color: #67c23a;font-weight: bold;">允许一楼送货</span>
                        </span>
                      </div>
                      <div class="data-panel-row">
                        <span class="data-panel-label">扫码信息：</span>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                          <span>20240315001</span>
                          <span>
                            <i class="el-icon-success" style="color: #67c23a;"></i>
                            <span style="color: #67c23a;font-weight: bold;">运行订单包含</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 下货点信息 -->
                <div class="marker-with-panel" data-x="1230" data-y="62">
                  <div class="pulse"></div>
                  <div class="data-panel" style="padding: 4px 12px;" :class="['position-left', { 'always-show': true }]">
                    <div class="data-panel-content">
                      <div class="data-panel-row">
                        <span class="data-panel-label">扫码信息：</span>
                        <span>20240315001</span>
                      </div>
                      <div class="data-panel-row">
                        <span class="data-panel-label">运行订单信息：</span>
                        <span>20240315001A</span>
                      </div>
                      <div class="data-panel-row">
                        <span class="data-panel-label">指定出口：</span>
                        <span>立体库</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 右侧区域 -->
          <div class="floor-right" style="width:415px;">
            <!-- 右上区域 -->
            <div class="floor-right-top">
              <div class="floor-title">
                <i class="el-icon-office-building"></i> 二楼区域
              </div>
              <div class="floor-image-container">
                <div class="image-wrapper">
                  <img src="@/assets/floor2.png" alt="二楼平面图" class="floor-image" @load="updateMarkerPositions">
                  <!-- 二楼区域上货点信息-上部分 -->
                  <div class="marker-with-panel" data-x="500" data-y="610">
                    <div class="pulse"></div>
                    <div class="data-panel" style="padding: 4px 12px;width: 140px;" :class="['position-left', { 'always-show': true }]">
                      <div class="data-panel-content">
                        <div class="data-panel-row">
                          <span class="data-panel-label">扫码信息：</span>
                          <span>20240315001</span>
                        </div>
                        <div class="data-panel-row">
                          <span>
                            <i class="el-icon-success" style="color: #67c23a;"></i>
                            <span class="data-panel-label" style="color: #67c23a; font-weight: bold;">运行订单信息包含</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 二楼区域上货点信息-下部分 -->
                  <div class="marker-with-panel" data-x="500" data-y="752">
                    <div class="pulse"></div>
                    <div class="data-panel" style="padding: 4px 12px;width: 140px;" :class="['position-left', { 'always-show': true }]">
                      <div class="data-panel-content">
                        <div class="data-panel-row">
                          <span class="data-panel-label">扫码信息：</span>
                          <span>20240315001</span>
                        </div>
                        <div class="data-panel-row">
                          <span>
                            <i class="el-icon-success" style="color: #67c23a;"></i>
                            <span class="data-panel-label" style="color: #67c23a; font-weight: bold;">运行订单信息包含</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 二楼区域上货点信息-中间部分-允许2楼A/B上货 -->
                  <div class="marker-with-panel" data-x="620" data-y="502">
                    <div class="pulse"></div>
                    <div class="data-panel" style="padding: 4px 12px;width: 140px;" :class="['position-left', { 'always-show': true }]">
                      <div class="data-panel-content">
                        <div class="data-panel-row" style="margin-bottom: 0px;">
                          <span>
                            <i class="el-icon-success" style="color: #67c23a;"></i>
                            <span class="data-panel-label" style="color: #67c23a; font-weight: bold;">允许2楼A/B上货</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 右下区域 -->
            <div class="floor-right-bottom">
              <div class="floor-title">
                <i class="el-icon-office-building"></i> 三楼区域
              </div>
              <div class="floor-image-container">
                <div class="image-wrapper">
                  <img src="@/assets/floor3.png" alt="三楼平面图" class="floor-image" @load="updateMarkerPositions">
                  <!-- 三楼区域上货点信息-上部分 -->
                  <div class="marker-with-panel" data-x="580" data-y="270">
                    <div class="pulse"></div>
                    <div class="data-panel" style="padding: 4px 12px;width: 140px;" :class="['position-left', { 'always-show': true }]">
                      <div class="data-panel-content">
                        <div class="data-panel-row">
                          <span class="data-panel-label">扫码信息：</span>
                          <span>20240315001</span>
                        </div>
                        <div class="data-panel-row">
                          <span>
                            <i class="el-icon-success" style="color: #67c23a;"></i>
                            <span class="data-panel-label" style="color: #67c23a; font-weight: bold;">运行订单信息包含</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 三楼区域上货点信息-下部分 -->
                  <div class="marker-with-panel" data-x="580" data-y="560">
                    <div class="pulse"></div>
                    <div class="data-panel" style="padding: 4px 12px;width: 140px;" :class="['position-left', { 'always-show': true }]">
                      <div class="data-panel-content">
                        <div class="data-panel-row">
                          <span class="data-panel-label">扫码信息：</span>
                          <span>20240315001</span>
                        </div>
                        <div class="data-panel-row">
                          <span>
                            <i class="el-icon-success" style="color: #67c23a;"></i>
                            <span class="data-panel-label" style="color: #67c23a; font-weight: bold;">运行订单信息包含</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 三楼区域上货点信息-中间部分-允许3楼A/B上货 -->
                  <div class="marker-with-panel" data-x="650" data-y="402">
                    <div class="pulse"></div>
                    <div class="data-panel" style="padding: 4px 12px;width: 140px;" :class="['position-left', { 'always-show': true }]">
                      <div class="data-panel-content">
                        <div class="data-panel-row" style="margin-bottom: 0px;">
                          <span>
                            <i class="el-icon-success" style="color: #67c23a;"></i>
                            <span class="data-panel-label" style="color: #67c23a; font-weight: bold;">允许2楼A/B上货</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧队列信息区 -->
    <div class="side-info-panel-queue" :style="{'width' : isQueueExpanded? '800px': 'auto'}">
      <!-- 队列信息区域 -->
      <div class="queue-section" :class="{ 'expanded': isQueueExpanded }">
        <div class="section-header" @click="isQueueExpanded = !isQueueExpanded">
          <template v-if="isQueueExpanded">
            <span><i class="el-icon-s-data"></i> 队列信息</span>
            <span class="arrow-icon" :class="{'expanded-arrow': isQueueExpanded}">▼</span>
          </template>
          <template v-else>
            <i class="el-icon-s-data"></i>
          </template>
        </div>
        <div v-if="isQueueExpanded" class="expandable-content-queue">
          <div class="queue-container">
            <!-- 左侧队列列表 -->
            <div class="queue-container-left">
              <div
                v-for="(queue, index) in queues"
                :key="queue.id"
                class="queue"
                :class="{ active: selectedQueueIndex === index }"
                @click="showTrays(index)"
                @dragover.prevent
                @drop="handleDrop(index)"
              >
                <span class="queue-name">{{ queue.name }}</span>
                <span class="tray-count">{{ queue.trays.length }}</span>
              </div>
            </div>
            
            <!-- 右侧托盘列表 -->
            <div class="queue-container-right">
              <div class="selected-queue-header" v-if="selectedQueue">
                <h3>{{ selectedQueue.name }}</h3>
                <span class="tray-total">托盘数量: {{ nowTrays.length }}</span>
              </div>
              <div class="tray-list">
                <div
                  v-for="(tray, trayIndex) in nowTrays"
                  :key="tray.id"
                  class="tray-item"
                  :class="{ 'dragging': isDragging && draggedTray?.id === tray.id }"
                  draggable="true"
                  @dragstart="handleDragStart($event, tray, selectedQueueIndex, trayIndex)"
                  @dragend="handleDragEnd"
                >
                  <span class="tray-name">{{ tray.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 测试面板 -->
    <div class="test-panel-container">
      <!-- 测试按钮 -->
      <div class="test-toggle-btn" @click="showTestPanel = !showTestPanel">
        <i class="el-icon-setting"></i>
      </div>
      <!-- 测试面板 -->
      <div class="test-panel" :class="{ 'collapsed': !showTestPanel }">
        <div class="test-panel-header">
          <span>测试面板</span>
          <i class="el-icon-close" @click.stop="showTestPanel = false"></i>
        </div>
        <div class="test-panel-content">
          <div class="test-section">
            <span class="test-label">小车1测试:</span>
            <div class="position-buttons">
              <button 
                v-for="pos in ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']" 
                :key="pos"
                @click="updateCartPosition(1, pos)"
                class="position-btn"
              >
                {{pos}}
              </button>
            </div>
          </div>
          <div class="test-section">
            <span class="test-label">小车2测试:</span>
            <div class="position-buttons">
              <button 
                v-for="pos in ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']" 
                :key="pos"
                @click="updateCartPosition(2, pos)"
                class="position-btn"
              >
                {{pos}}
              </button>
            </div>
          </div>
          <div class="test-section">
            <span class="test-label">小车3测试:</span>
            <div class="position-buttons">
              <button 
                v-for="pos in ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']" 
                :key="pos"
                @click="updateCartPosition(3, pos)"
                class="position-btn"
              >
                {{pos}}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MonitorScreen',
  data() {
    return {
      showTestPanel: false,
      buttonStates: {
        start: false,
        stop: false,
        reset: false,
        fault_reset: false,
        clear: false
      },
      activeLogType: 'running',
      activeOrderTab: 'current',
      ordersList: [],
      runningLogs: [
        {
          id: 1,
          type: 'running',
          message: '托盘A-01 从上货区移动到缓冲1区，等待预热处理',
          timestamp: new Date().getTime() - 30000,
          unread: false
        },
        {
          id: 2,
          type: 'running',
          message: '托盘B-02 完成预热，从预热区A1移动到缓冲2区',
          timestamp: new Date().getTime() - 25000,
          unread: false
        },
        {
          id: 3,
          type: 'running',
          message: '托盘C-03 开始消毒处理，预计持续时间30分钟',
          timestamp: new Date().getTime() - 20000,
          unread: false
        },
        {
          id: 4,
          type: 'running',
          message: '系统自动调度：将托盘D-01从缓冲3区转移至下货区',
          timestamp: new Date().getTime() - 15000,
          unread: false
        },
        {
          id: 5,
          type: 'running',
          message: '批次#12345生产任务开始执行，计划生产数量: 500个',
          timestamp: new Date().getTime() - 10000,
          unread: false
        },
        {
          id: 6,
          type: 'running',
          message: '预热区A2温度已达标，开始执行预热程序',
          timestamp: new Date().getTime() - 5000,
          unread: false
        }
      ],
      alarmLogs: [
        {
          id: 101,
          type: 'alarm',
          message: '【严重警告】预热区A1温度超出正常范围（当前: 85℃，正常: 60-80℃），请立即检查！',
          timestamp: new Date().getTime() - 28000,
          unread: true
        },
        {
          id: 102,
          type: 'alarm',
          message: '【设备警告】消毒柜2#压力异常，当前压力值: 2.8MPa，超出正常范围',
          timestamp: new Date().getTime() - 23000,
          unread: true
        },
        {
          id: 103,
          type: 'alarm',
          message: '【系统警告】缓冲1区托盘堆积，当前数量超过预警值（8/6），请及时处理',
          timestamp: new Date().getTime() - 18000,
          unread: true
        },
        {
          id: 104,
          type: 'alarm',
          message: '【网络警告】与PLC通信延迟超过500ms，请检查网络连接状态',
          timestamp: new Date().getTime() - 13000,
          unread: true
        },
        {
          id: 105,
          type: 'alarm',
          message: '【维护提醒】消毒柜1#已运行超过1000小时，请按计划进行维护保养',
          timestamp: new Date().getTime() - 8000,
          unread: true
        }
      ],
      currentTime: '',
      positions: {
        cart1: {
          A1: { x: 1220, y: 1740 },  // 最下面
          A2: { x: 1085, y: 1740 },
          A3: { x: 905, y: 1740 },  // 扫码位
          A4: { x: 775, y: 1740 },   // 中间
          A5: { x: 608, y: 1740 },
          A6: { x: 478, y: 1740 },   // 最上面
          A7: { x: 318, y: 1740 }     // 左边
        },
        cart2: {
          A1: { x: 1210, y: 795 },
          A2: { x: 1080, y: 795 },
          A3: { x: 905, y: 795 },
          A4: { x: 775, y: 795 },
          A5: { x: 610, y: 795 },
          A6: { x: 480, y: 795 },
          A7: { x: 330, y: 795 }
        },
        cart3: {
          A1: { x: 1210, y: 230 },
          A2: { x: 1080, y: 230 },
          A3: { x: 905, y: 230 },
          A4: { x: 778, y: 230 },
          A5: { x: 613, y: 230 },
          A6: { x: 485, y: 230 },
          A7: { x: 335, y: 230 }
        }
      },
      carts: [
        {
          id: 1,
          name: '小车1',
          cartKey: 'cart1',  // 添加cartKey用于关联positions
          currentPosition: 'A1',
          x: 1220,
          y: 1740,
          width: 150,
          image: require('@/assets/cart.png')
        },
        {
          id: 2,
          name: '小车2',
          cartKey: 'cart2',
          currentPosition: 'A1',
          x: 1210,
          y: 795,
          width: 150,
          image: require('@/assets/cart.png')
        },
        {
          id: 3,
          name: '小车3',
          cartKey: 'cart3',
          currentPosition: 'A1',
          x: 1210,
          y: 226,
          width: 145,
          image: require('@/assets/cart.png')
        }
      ],
      queues: [
        { 
          id: 1, 
          name: '上货区', 
          type: 'loading', 
          trays: [
            { id: 1, name: '托盘A-01', status: 'idle' },
            { id: 2, name: '托盘A-02', status: 'idle' },
            { id: 3, name: '托盘A-03', status: 'idle' },
            { id: 4, name: '托盘A-04', status: 'idle' },
            { id: 5, name: '托盘A-05', status: 'idle' }
          ]
        },
        { 
          id: 2, 
          name: '缓冲1区', 
          type: 'buffer', 
          trays: [
            { id: 6, name: '托盘B-01', status: 'waiting' },
            { id: 7, name: '托盘B-02', status: 'waiting' },
            { id: 8, name: '托盘B-03', status: 'waiting' }
          ] 
        },
        // 预热区 A1-G2
        ...Array.from({ length: 14 }, (_, i) => {
          const row = String.fromCharCode(65 + (i % 7)); // A-G
          const col = Math.floor(i / 7) + 1; // 1-2
          return {
            id: i + 3,
            name: `${row}${col}`,
            type: 'preheat',
            trays: i % 3 === 0 ? [ // 每隔三个区域添加一些托盘
              { id: 20 + i * 2, name: `托盘P-${row}${col}-01`, status: 'heating' },
              { id: 21 + i * 2, name: `托盘P-${row}${col}-02`, status: 'heating' }
            ] : []
          };
        }),
        { 
          id: 17, 
          name: '缓冲2区', 
          type: 'buffer', 
          trays: [
            { id: 50, name: '托盘C-01', status: 'waiting' },
            { id: 51, name: '托盘C-02', status: 'waiting' },
            { id: 52, name: '托盘C-03', status: 'waiting' },
            { id: 53, name: '托盘C-04', status: 'waiting' }
          ] 
        },
        // 消毒区 1#-7#
        ...Array.from({ length: 7 }, (_, i) => ({
          id: i + 18,
          name: `${i + 1}#`,
          type: 'sterilize',
          trays: i % 2 === 0 ? [ // 偶数消毒添加托盘
            { id: 60 + i * 3, name: `托盘S-${i + 1}-01`, status: 'sterilizing' },
            { id: 61 + i * 3, name: `托盘S-${i + 1}-02`, status: 'sterilizing' },
            { id: 62 + i * 3, name: `托盘S-${i + 1}-03`, status: 'sterilizing' }
          ] : []
        })),
        { 
          id: 25, 
          name: '缓冲3区', 
          type: 'buffer', 
          trays: [
            { id: 90, name: '托盘D-01', status: 'waiting' },
            { id: 91, name: '托盘D-02', status: 'waiting' }
          ] 
        },
        { 
          id: 26, 
          name: '下货区', 
          type: 'unloading', 
          trays: [
            { id: 95, name: '托盘E-01', status: 'completed' },
            { id: 96, name: '托盘E-02', status: 'completed' },
            { id: 97, name: '托盘E-03', status: 'completed' }
          ] 
        }
      ],
      nowTrays: [],
      draggedTray: null,
      dragSourceQueue: null,
      isQueueExpanded: false,
      selectedQueueIndex: 0,
      isDragging: false
    };
  },
  computed: {
    currentLogs() {
      return this.activeLogType === 'running' ? this.runningLogs : this.alarmLogs;
    },
    unreadAlarms() {
      return this.alarmLogs.filter(log => log.unread).length;
    },
    selectedQueue() {
      return this.queues[this.selectedQueueIndex];
    }
  },
  mounted() {
    this.updateTime();
    setInterval(this.updateTime, 1000);
    this.initializeMarkers();
  },
  methods: {
    toggleButtonState(button) {
      this.buttonStates = {
        start: false,
        stop: false,
        reset: false,
        fault_reset: false,
        clear: false
      };
      this.buttonStates[button] = !this.buttonStates[button];
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    markAsRead(log) {
      if (log.type === 'alarm') {
        log.unread = false;
      }
    },
    getStatusText(status) {
      const statusMap = {
        pending: '待执行',
        running: '正在执行',
        completed: '已执行'
      };
      return statusMap[status] || status;
    },
    formatDateTime(date) {
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    updateTime() {
      this.currentTime = new Date().toLocaleString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    initializeMarkers() {
      this.$nextTick(() => {
        this.updateMarkerPositions();
        window.addEventListener('resize', this.updateMarkerPositions);
      });
    },
    updateMarkerPositions() {
      const images = document.querySelectorAll('.floor-image');
      images.forEach(image => {
        const imageWrapper = image.parentElement;
        if (!imageWrapper) return;

        const markers = imageWrapper.querySelectorAll('.marker, .marker-with-panel');
        const carts = imageWrapper.querySelectorAll('.cart-container');
        const imageRect = image.getBoundingClientRect();
        const wrapperRect = imageWrapper.getBoundingClientRect();
        
        // 计算图片的实际显示区域
        const displayedWidth = image.width;
        const displayedHeight = image.height;
        const scaleX = displayedWidth / image.naturalWidth;
        const scaleY = displayedHeight / image.naturalHeight;
        
        // 计算图片在容器中的偏移量
        const imageOffsetX = (wrapperRect.width - displayedWidth) / 2;
        const imageOffsetY = (wrapperRect.height - displayedHeight) / 2;
        
        markers.forEach(marker => {
          const x = parseFloat(marker.dataset.x);
          const y = parseFloat(marker.dataset.y);
          if (!isNaN(x) && !isNaN(y)) {
            marker.style.left = `${imageOffsetX + (x * scaleX)}px`;
            marker.style.top = `${imageOffsetY + (y * scaleY)}px`;
          }
        });

        // 更新小车位置和大小
        carts.forEach(cart => {
          const x = parseFloat(cart.dataset.x);
          const y = parseFloat(cart.dataset.y);
          const width = parseFloat(cart.dataset.width);
          if (!isNaN(x) && !isNaN(y)) {
            cart.style.left = `${imageOffsetX + (x * scaleX)}px`;
            cart.style.top = `${imageOffsetY + (y * scaleY)}px`;
            // 设置小车宽度，使其适应导轨
            if (!isNaN(width)) {
              cart.style.width = `${width * scaleX}px`;
            }
          }
        });
      });
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.updateMarkerPositions);
    },
    updateCartPosition(cartId, position) {
      const cart = this.carts.find(c => c.id === cartId);
      if (cart && this.positions[cart.cartKey] && this.positions[cart.cartKey][position]) {
        cart.currentPosition = position;
        const newPos = this.positions[cart.cartKey][position];
        cart.x = newPos.x;
        cart.y = newPos.y;
        this.$nextTick(() => {
          this.updateMarkerPositions();
        });
      }
    },
    getCartPosition(cartId) {
      const cart = this.carts.find(c => c.id === cartId);
      return cart ? cart.currentPosition : null;
    },
    showTrays(index) {
      this.selectedQueueIndex = index;
      this.nowTrays = this.queues[index].trays;
    },
    handleDragStart(event, tray, queueIndex, trayIndex) {
      this.isDragging = true;
      this.draggedTray = tray;
      this.dragSourceQueue = queueIndex;
      
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', tray.id);
      
      setTimeout(() => {
        event.target.classList.add('dragging');
      }, 0);
    },
    handleDragEnd(event) {
      this.isDragging = false;
      event.target.classList.remove('dragging');
    },
    handleDrop(targetQueueIndex) {
      if (!this.draggedTray || this.dragSourceQueue === null) return;
      if (this.dragSourceQueue === targetQueueIndex) return;

      const sourceQueue = this.queues[this.dragSourceQueue];
      const targetQueue = this.queues[targetQueueIndex];

      const trayIndex = sourceQueue.trays.findIndex(t => t.id === this.draggedTray.id);
      if (trayIndex > -1) {
        sourceQueue.trays.splice(trayIndex, 1);
      }

      targetQueue.trays.push(this.draggedTray);

      if (this.selectedQueueIndex === targetQueueIndex) {
        this.nowTrays = targetQueue.trays;
      }

      this.draggedTray = null;
      this.dragSourceQueue = null;
      this.isDragging = false;
    },
    async switchOrder(order) {
      // 设置加载状态
      order.isLoading = true;
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 更新订单状态
        if (order.status === 'pending') {
          order.status = 'running';
          this.$message.success(`订单 ${order.id} 已开始执行`);
        } else if (order.status === 'running') {
          order.status = 'completed';
          this.$message.success(`订单 ${order.id} 已完成`);
        }
      } catch (error) {
        this.$message.error('切换订单失败，请重试');
      } finally {
        // 清除加载状态
        order.isLoading = false;
      }
    }
  }
};
</script>
<style scoped>
.smart-workshop {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle, #1a2035, #0f1620);
  padding: 0;
  font-family: 'Roboto', sans-serif;
  overflow: hidden;
  box-sizing: border-box;
}

.header {
  position: relative;
  width: 100%;
  height: 80px;
  overflow: hidden;
  flex-shrink: 0;
}

.header-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-content {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  z-index: 1;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
}

.current-time {
  font-size: 24px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.side-info-panel {
  width: 420px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px;
  box-sizing: border-box;
  flex-shrink: 0;
  overflow: hidden;
}

.plc-info-section,
.log-section,
.operation-panel {
  background: rgba(30, 42, 56, 0.8);
  padding: 10px;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  color: #f5f5f5;
  box-sizing: border-box;
}

.scrollable-content {
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: color 0.3s ease;
  font-size: 22px;
  color: #0ac5a8;
  font-weight: 900;
}

.status-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.data-card {
  box-sizing: border-box;
  height: 65px;
  width: 185px;
}

.data-card-border {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: linear-gradient(135deg, #2b3d51, #3c4c63);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.data-card-border-borderTop {
  font-weight: 400;
  letter-spacing: 0px;
  color: rgba(189, 189, 189, 1);
  text-align: left;
  vertical-align: top;
  font-size: 13px;
  line-height: 34px;
  padding-left: 12px;
}

.granient-text {
  background-image: linear-gradient(to right, rgba(72, 146, 254, 1), rgba(71, 207, 245, 1));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.granient-text-order {
  background-image: linear-gradient(to right, rgba(112, 225, 245, 1), rgba(255, 209, 148, 1));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.data-card-border-borderDown {
  font-weight: 700;
  letter-spacing: 0px;
  color: rgba(255, 255, 255, 1);
  text-align: left;
  vertical-align: top;
  font-size: 24px;
  line-height: 21px;
  padding-left: 12px;
}

.operation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 5px;
  padding: 5px;
}

.operation-buttons button {
  width: 70px;
  height: 70px;
  font-size: 0.8em;
  color: #fff;
  background: linear-gradient(135deg, #0ac5a8, #0f6b58);
  border: none;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 8px;
  gap: 5px;
}

.operation-buttons button i {
  font-size: 1.8em;
}

.operation-buttons button span {
  font-size: 12px;
  margin-top: 4px;
}

.operation-buttons button:hover {
  background: linear-gradient(135deg, #4caf50, #0f6b58);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.operation-buttons button.pressed {
  background: linear-gradient(135deg, #4caf50, #2e8b57);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  transform: scale(0.95);
}

.log-section {
  background: rgba(30, 42, 56, 0.8);
  padding: 10px;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  height: 257px;
  display: flex;
  flex-direction: column;
}

.log-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 0px 8px 0px;
  color: #0ac5a8;
  font-size: 22px;
  font-weight: 900;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.log-section .section-header .log-tabs {
  display: flex;
  gap: 5px;
}

.log-section .section-header .log-tab {
  position: relative;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 5px 15px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.log-section .section-header .log-tab.active {
  color: #fff;
  background: rgba(10, 197, 168, 0.2);
}

.log-section .section-header .log-tab:hover:not(.active) {
  color: #0ac5a8;
}

.log-section .section-header .log-tab .alarm-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f56c6c;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.log-section .scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.log-section .scrollable-content::-webkit-scrollbar {
  width: 4px;
}

.log-section .scrollable-content::-webkit-scrollbar-track {
  background: transparent;
}

.log-section .scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(10, 197, 168, 0.2);
  border-radius: 2px;
}

.log-section .scrollable-content::-webkit-scrollbar-thumb:hover {
  background: rgba(10, 197, 168, 0.4);
}

.log-section .log-list {
  padding: 0 10px;
  width: 100%;
  box-sizing: border-box;
}

.log-section .log-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}

.log-section .log-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.log-section .log-item.alarm {
  background: rgba(245, 108, 108, 0.05);
}

.log-section .log-item.alarm.unread {
  background: rgba(245, 108, 108, 0.1);
  border-left: 2px solid #f56c6c;
}

.log-section .log-item .log-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 6px;
}

.log-section .log-item .log-item-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: normal;
  hyphens: auto;
  display: block;
  width: 100%;
  padding-right: 10px;
}

.main-content {
  flex: 1;
  display: flex;
  padding: 8px 8px 8px 0px;
  box-sizing: border-box;
  overflow: hidden;
  height: 100%;
}

.order-list-section {
  background: rgba(30, 42, 56, 0.8);
  padding: 10px;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  height: 300px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.order-list-section .scrollable-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
  margin-right: -10px;
}

.order-list-section .scrollable-content::-webkit-scrollbar {
  width: 4px;
}

.order-list-section .scrollable-content::-webkit-scrollbar-track {
  background: transparent;
}

.order-list-section .scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(10, 197, 168, 0.2);
  border-radius: 2px;
}

.order-list-section .scrollable-content::-webkit-scrollbar-thumb:hover {
  background: rgba(10, 197, 168, 0.4);
}

.order-tabs {
  display: flex;
  gap: 5px;
}

.order-tab {
  position: relative;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 5px 15px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.order-tab.active {
  color: #fff;
  background: rgba(10, 197, 168, 0.2);
}

.order-tab:hover:not(.active) {
  color: #0ac5a8;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
  width: 100%;
  box-sizing: border-box;
}

.order-item {
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(90deg, 
    rgba(30, 42, 56, 0.95) 0%, 
    rgba(48, 65, 86, 0.85) 50%,
    rgba(48, 65, 86, 0.75) 100%
  );
  border-radius: 6px;
  padding: 12px 15px;
  transition: all 0.3s ease;
  position: relative;
  height: 80px;  /* 增加高度 */
  display: flex;
  align-items: center;
  gap: 15px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.order-item:hover {
  background: linear-gradient(90deg, 
    rgba(30, 42, 56, 0.98) 0%, 
    rgba(48, 65, 86, 0.9) 50%,
    rgba(48, 65, 86, 0.85) 100%
  );
  transform: translateX(4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.order-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: transparent;
  transition: all 0.3s ease;
}

.order-item.pending::before {
  background: #e6a23c;
}

.order-item.running::before {
  background: #409eff;
}

.order-item.completed::before {
  background: #67c23a;
}

.order-item:hover {
  background: linear-gradient(90deg, rgba(30, 42, 56, 0.9) 0%, rgba(48, 65, 86, 0.5) 100%);
  transform: translateX(4px);
}

.order-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding-right: 100px;
}

.order-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 0;
  border: none;
}

.order-id {
  font-weight: 600;
  color: #fff;
  font-size: 14px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.order-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  white-space: nowrap;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.info-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  white-space: nowrap;
  width: 60px;  /* 固定标签宽度 */
  flex-shrink: 0;
}

.info-value {
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

/* 基础按钮样式 */
.switch-order-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  padding: 0 15px;
  border-radius: 4px;
  font-size: 12px;
  height: 28px;
  min-width: 85px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
}

/* 普通按钮hover效果 */
.switch-order-btn:not(.complete-btn):hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 完成订单按钮样式 */
.switch-order-btn.complete-btn {
  background: linear-gradient(45deg, #67c23a 0%, #85ce61 100%);
  border: 1px solid rgba(103, 194, 58, 0.2);
  color: #fff;
  font-weight: 500;
}

/* 完成订单按钮hover效果，提高优先级 */
.order-item .switch-order-btn.complete-btn:hover {
  border-color: rgba(103, 194, 58, 0.4);
}

/* 禁用和加载状态 */
.switch-order-btn:disabled,
.switch-order-btn.loading {
  cursor: not-allowed;
  opacity: 0.8;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
}

.floor-container {
  display: flex;
  gap: 10px;
  height: 100%;
  width: 100%;
  min-height: 0;
}

.floor-left {
  flex: 1;
  background: rgba(30, 42, 56, 0.8);
  padding: 10px;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  color: #f5f5f5;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.floor-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  height: 100%;
}

.floor-right-top,
.floor-right-bottom {
  flex: 1;
  background: rgba(30, 42, 56, 0.8);
  padding: 10px;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  color: #f5f5f5;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: calc(50% - 5px);
  overflow: hidden;
}

.floor-title {
  font-size: 22px;
  color: #0ac5a8;
  font-weight: 900;
  padding-bottom: 10px;
  flex-shrink: 0;
}

.floor-image-container {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 0;
  height: calc(100% - 50px);
  position: relative;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floor-image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.content-wrapper {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.marker {
  position: absolute;
  width: 16px;
  height: 16px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 2;
  pointer-events: auto;
}

.marker::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(10, 197, 168, 0.8);
  border-radius: 50%;
  animation: glow 2s infinite;
}

.pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(10, 197, 168, 0.4);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.marker-label {
  position: absolute;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  bottom: 150%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
}

/* 默认隐藏标签，hover时显示 */
.marker:hover .marker-label {
  opacity: 1;
}

/* 始终显示标签的点位 */
.marker-show-label .marker-label {
  opacity: 1;
}

@keyframes glow {
  0% {
    box-shadow: 0 0 0 0 rgba(10, 197, 168, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(10, 197, 168, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(10, 197, 168, 0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}

/* 带数据面板的标识点样式 */
.marker-with-panel {
  position: absolute;
  width: 16px;
  height: 16px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 2;
}

.marker-with-panel::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(64, 158, 255, 0.8);
  border-radius: 50%;
  animation: glow-blue 2s infinite;
}

.marker-with-panel .pulse {
  background: rgba(64, 158, 255, 0.4);
}

.marker-line {
  position: absolute;
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.8), rgba(64, 158, 255, 0.2));
  transform-origin: left center;
  transition: all 0.3s ease;
}

.data-panel {
  position: absolute;
  background: rgba(30, 42, 56, 0.95);
  border: 1px solid rgba(64, 158, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

/* 面板位置样式 */
.data-panel.position-right {
  left: calc(100% + 15px);
  top: 50%;
  transform: translateY(-50%);
}

.data-panel.position-left {
  right: calc(100% + 15px);
  top: 50%;
  transform: translateY(-50%);
}

.data-panel.position-top {
  bottom: calc(100% + 15px);
  left: 50%;
  transform: translateX(-50%);
}

.data-panel.position-bottom {
  top: calc(100% + 15px);
  left: 50%;
  transform: translateX(-50%);
}

/* 悬停时显示面板 */
.marker-with-panel:hover .data-panel:not(.always-show) {
  opacity: 1;
}

/* 始终显示的面板 */
.data-panel.always-show {
  opacity: 1;
}

.data-panel-header {
  font-size: 14px;
  color: #409eff;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.2);
}

.data-panel-content {
  font-size: 12px;
}

.data-panel-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.9);
}

.data-panel-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

/* 竖向布局样式 */
.data-panel.vertical-layout {
  width: 110px;
  padding: 8px;
}

.data-panel.vertical-layout .data-panel-row {
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.data-panel.vertical-layout .data-panel-label {
  margin-bottom: 2px;
}

@keyframes glow-blue {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(64, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}

/* 添加小车样式 */
.cart-container {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-image {
  width: 100%;
  height: auto;
  object-fit: contain;
}

/* 添加测试按钮样式 */
.test-buttons {
  margin-top: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.test-section {
  margin-bottom: 10px;
}

.test-label {
  display: block;
  color: #0ac5a8;
  margin-bottom: 5px;
  font-size: 14px;
}

.position-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.position-btn {
  padding: 4px 8px;
  background: rgba(10, 197, 168, 0.2);
  border: 1px solid rgba(10, 197, 168, 0.5);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.position-btn:hover {
  background: rgba(10, 197, 168, 0.4);
}

.position-btn:active {
  transform: scale(0.95);
}

/* 添加新的测试面板样式 */
.test-panel {
  position: absolute;
  right: 50px;
  top: 0;
  width: 300px;
  background: rgba(30, 42, 56, 0.98);
  border: 1px solid rgba(10, 197, 168, 0.3);
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  transform-origin: top right;
  opacity: 1;
  transform: scale(1);
}

.test-panel.collapsed {
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
}

.test-panel-header {
  padding: 15px;
  background: rgba(10, 197, 168, 0.3);
  border-radius: 15px 15px 0 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #0ac5a8;
  font-weight: bold;
  pointer-events: auto;
}

.test-panel-header i {
  transition: transform 0.3s ease;
  margin-left: 10px;
}

.test-panel-header i.rotated {
  transform: rotate(180deg);
}

.test-panel-content {
  padding: 15px;
  max-height: 100%;
  overflow-y: auto;
  pointer-events: auto;
}

.test-section {
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.4);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(10, 197, 168, 0.1);
}

.test-label {
  display: block;
  color: #0ac5a8;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
}

.position-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  pointer-events: auto;
}

.position-btn {
  padding: 6px 12px;
  background: rgba(10, 197, 168, 0.3);
  border: 1px solid rgba(10, 197, 168, 0.5);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.position-btn:hover {
  background: rgba(10, 197, 168, 0.5);
}

.position-btn:active {
  transform: scale(0.95);
}

/* 移除旧的测试面板样式，添加新的样式 */
.test-panel-container {
  position: absolute; /* 修改位置，为测试按钮留出空间 */
  right: 80px;  /* 修改位置，为队列按钮留出空间 */
  top: 20px;
  z-index: 1000;
}

.test-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0ac5a8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.test-toggle-btn:hover {
  transform: scale(1.1);
  background: #0db196;
}

.test-toggle-btn i {
  color: #fff;
  font-size: 20px;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.test-panel {
  position: absolute;
  right: 50px;
  top: 0;
  width: 300px;
  background: rgba(30, 42, 56, 0.98);
  border: 1px solid rgba(10, 197, 168, 0.3);
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  transform-origin: top right;
  opacity: 1;
  transform: scale(1);
}

.test-panel.collapsed {
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
}

.test-panel-header {
  padding: 15px;
  background: rgba(10, 197, 168, 0.3);
  border-radius: 15px 15px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #0ac5a8;
  font-weight: bold;
  pointer-events: auto;
}

.test-panel-header i {
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-panel-header i:hover {
  color: #ff4d4f;
}

.test-panel-content {
  padding: 15px;
  max-height: 100%;
  overflow-y: auto;
  pointer-events: auto;
}

.test-section {
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.4);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(10, 197, 168, 0.1);
}

.test-label {
  display: block;
  color: #0ac5a8;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
}

.position-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  pointer-events: auto;
}

.position-btn {
  padding: 6px 12px;
  background: rgba(10, 197, 168, 0.3);
  border: 1px solid rgba(10, 197, 168, 0.5);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.position-btn:hover {
  background: rgba(10, 197, 168, 0.5);
}

.position-btn:active {
  transform: scale(0.95);
}
/* 测试添加结束 */

.side-info-panel-queue {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-sizing: border-box;
  transition: all 0.3s ease;
  pointer-events: auto;
  height: calc(100% - 40px);
}

/* 展开状态的样式 */
.queue-section.expanded {
  padding: 15px;
  width: 800px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.queue-section.expanded .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: color 0.3s ease;
  font-size: 20px;
  color: #0ac5a8;
  font-weight: 900;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.expandable-content-queue {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  height: calc(100% - 50px);
}

.queue-container {
  flex: 1;
  display: flex;
  background: rgba(30, 42, 56, 0.9);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  padding: 15px;
  gap: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.queue-container-left {
  width: 280px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 15px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
  min-height: 0;
}

.queue-container-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 15px;
  height: 100%;
  min-height: 0;
}

.queue-container-right .selected-queue-header {
  flex-shrink: 0;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.queue-container-right .tray-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 5px;
}

/* 队列项样式 */
.queue {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(48, 65, 85, 0.9);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.queue:last-child {
  margin-bottom: 0;
}

.queue:hover {
  background: rgba(48, 65, 85, 1);
  border-color: rgba(10, 197, 168, 0.5);
  transform: translateX(2px);
}

.queue.active {
  background: rgba(10, 197, 168, 0.15);
  border-color: rgba(10, 197, 168, 0.5);
  transform: none;
}

.queue-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.tray-count {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 24px;
  text-align: center;
}

.tray-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(48, 65, 85, 0.9);
  margin: 8px 0;
  padding: 12px 15px;
  border-radius: 8px;
  cursor: move;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.tray-item:hover {
  background: rgba(48, 65, 85, 1);
  border-color: rgba(10, 197, 168, 0.5);
}

.tray-item .tray-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.tray-item.dragging {
  opacity: 0.6;
  transform: scale(0.98);
  border: 1px dashed rgba(255, 255, 255, 0.3);
}

/* 滚动条样式 */
.queue-container-left::-webkit-scrollbar,
.tray-list::-webkit-scrollbar {
  width: 4px;
}

.queue-container-left::-webkit-scrollbar-track,
.tray-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.queue-container-left::-webkit-scrollbar-thumb,
.tray-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.queue-container-left::-webkit-scrollbar-thumb:hover,
.tray-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 标题样式 */
.selected-queue-header h3 {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

.tray-total {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 15px;
}

/* 托盘项样式 */
.tray-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(48, 65, 85, 0.9);
  margin: 0 0 8px 0;
  padding: 12px 15px;
  border-radius: 8px;
  cursor: move;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.tray-item:last-child {
  margin-bottom: 0;
}

.tray-item:hover {
  background: rgba(48, 65, 85, 1);
  border-color: rgba(10, 197, 168, 0.5);
}

.tray-item .tray-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.tray-item.dragging {
  opacity: 0.6;
  transform: scale(0.98);
  border: 1px dashed rgba(255, 255, 255, 0.3);
}

/* 收起状态的样式 */
.queue-section:not(.expanded) {
  width: 40px;
  height: 40px;
  padding: 0;
  background: none;
  box-shadow: none;
  border: none;
}

.queue-section:not(.expanded) .section-header {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0ac5a8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  padding: 0;
}

.queue-section:not(.expanded) .section-header:hover {
  transform: scale(1.1);
  background: #0db196;
}

.queue-section:not(.expanded) .section-header span {
  display: none;
}

.queue-section:not(.expanded) .section-header i {
  color: #fff;
  font-size: 20px;
  animation: rotate 10s linear infinite;
}

/* 基础样式 */
.queue-section {
  background: rgba(30, 42, 56, 0.95);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  color: #f5f5f5;
  box-sizing: border-box;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 添加切换订单按钮样式 */
.switch-order-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  padding: 0 15px;
  border-radius: 4px;
  font-size: 12px;
  height: 28px;
  min-width: 85px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
}

/* 普通按钮hover效果 */
.switch-order-btn:not(.complete-btn):hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 完成订单按钮样式 */
.switch-order-btn.complete-btn {
  background: linear-gradient(45deg, #67c23a 0%, #85ce61 100%);
  border: 1px solid rgba(103, 194, 58, 0.2);
  color: #fff;
  font-weight: 500;
}

/* 完成订单按钮hover效果，提高优先级 */
.order-item .switch-order-btn.complete-btn:hover {
  border-color: rgba(103, 194, 58, 0.4);
}

/* 禁用和加载状态 */
.switch-order-btn:disabled,
.switch-order-btn.loading {
  cursor: not-allowed;
  opacity: 0.8;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
}
</style>