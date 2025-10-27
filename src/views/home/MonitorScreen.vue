<template>
  <div class="smart-workshop">
    <!-- 内容区包装器 -->
    <div class="content-wrapper">
      <!-- 左侧面板 -->
      <div class="side-info-panel">
        <!-- PLC状态与订单信息区域 -->
        <div class="plc-info-section">
          <div class="section-header">
            当前执行订单信息
            <el-button
              style="margin-top: -8px"
              type="success"
              size="mini"
              @click="showMobileConnectionStatus"
              icon="el-icon-connection"
              :disabled="!wsServerStatus.isRunning"
            >
              PDA互联
            </el-button>
          </div>
          <div class="scrollable-content" style="margin-top: 5px">
            <div class="status-overview">
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop granient-text">
                    当前批次id
                  </div>
                  <div
                    class="data-card-border-borderDown"
                    style="font-size: 1.3vw"
                  >
                    {{ currentOrder ? currentOrder.orderId : '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">产品名称</div>
                  <div class="data-card-border-borderDown">
                    {{ currentOrder ? currentOrder.productName : '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">指定预热房</div>
                  <div class="data-card-border-borderDown">
                    {{ currentOrder ? currentOrder.isPrint1 : '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">指定灭菌柜</div>
                  <div class="data-card-border-borderDown">
                    {{ currentOrder ? currentOrder.isPrint2 : '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">进货口</div>
                  <div class="data-card-border-borderDown">
                    {{ currentOrder ? getInputText(currentOrder.inPut) : '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">出货口</div>
                  <div class="data-card-border-borderDown">
                    {{
                      currentOrder ? getOutputText(currentOrder.isPrint3) : '--'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单信息列表区域 -->
        <div class="order-list-section">
          <div class="section-header">
            <div class="section-title">
              订单信息列表
              <div class="title-actions">
                <div
                  class="refresh-btn"
                  @click="refreshOrders"
                  :class="{ 'is-loading': isRefreshing }"
                >
                  <i class="el-icon-refresh"></i>
                </div>
                <div
                  class="add-order-btn"
                  @click="showAddOrderDialog"
                  title="新建订单"
                >
                  <i class="el-icon-plus"></i>
                </div>
              </div>
            </div>
            <div class="order-actions">
              <el-button
                type="primary"
                size="small"
                @click="showHistoryOrders"
                icon="el-icon-time"
              >
                历史订单
              </el-button>
            </div>
          </div>
          <div class="scrollable-content">
            <div class="order-list" v-if="ordersList.length > 0">
              <div
                v-for="order in ordersList"
                :key="order.orderId"
                class="order-item"
                :class="
                  order.orderStatus === '0'
                    ? 'pending'
                    : order.orderStatus === '1'
                    ? 'running'
                    : order.orderStatus === '2'
                    ? 'paused'
                    : 'complete'
                "
              >
                <!-- 订单类型标识 -->
                <div
                  class="order-type-badge"
                  :class="order.isManual === '1' ? 'manual' : 'mse'"
                >
                  {{ order.isManual === '1' ? '手动' : 'MSE' }}
                </div>
                <el-button
                  v-if="order.orderStatus === '0'"
                  type="danger"
                  size="mini"
                  @click="deleteOrder(order)"
                  :loading="order.isDeleting"
                  icon="el-icon-delete"
                  class="delete-btn"
                  circle
                ></el-button>
                <div class="order-main">
                  <div class="order-header">
                    <span class="order-id">{{ order.orderId }}</span>
                    <span
                      class="order-status"
                      :class="{ running: order.orderStatus === '1' }"
                    >
                      <i
                        v-if="order.orderStatus === '1'"
                        class="el-icon-loading"
                      ></i>
                      {{ getStatusText(order.orderStatus) }}
                    </span>
                    <el-button
                      v-if="order.orderStatus === '1'"
                      type="text"
                      size="small"
                      @click="cancelOrder(order)"
                      :loading="order.isLoading"
                      style="padding: 0px"
                    >
                      取消
                    </el-button>
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
                        <span class="info-value">{{ order.insertTime }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <div class="info-item">
                        <span class="info-label">进货口</span>
                        <span class="info-value">{{
                          order.inPut === '1'
                            ? '一楼进货'
                            : order.inPut === '2'
                            ? '二楼进货'
                            : '三楼进货'
                        }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">出货口</span>
                        <span class="info-value">{{
                          order.isPrint3 === '0'
                            ? '不解析'
                            : order.isPrint3 === '1'
                            ? '解析库'
                            : '立体库'
                        }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <div class="info-item">
                        <span class="info-label">灭菌柜</span>
                        <span class="info-value">{{ order.isPrint2 }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">预热房</span>
                        <span class="info-value">{{ order.isPrint1 }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  v-if="order.orderStatus === '0'"
                  class="switch-order-btn"
                  :class="{ loading: order.isLoading }"
                  @click="switchOrder(order)"
                  :disabled="order.isLoading"
                >
                  <i v-if="order.isLoading" class="el-icon-loading"></i>
                  <span>执行订单</span>
                </button>
                <button
                  v-if="order.orderStatus === '1' && isLastQrCodeMatch"
                  class="switch-order-btn complete-btn"
                  :class="{ loading: order.isLoading }"
                  @click="finishOrder(order)"
                  :disabled="order.isLoading"
                >
                  <i v-if="order.isLoading" class="el-icon-loading"></i>
                  <span>上货完成</span>
                </button>
              </div>
            </div>
            <!-- 添加空状态显示 -->
            <div v-else class="empty-state">
              <i class="el-icon-document"></i>
              <p>暂无订单信息</p>
              <el-button type="text" @click="refreshOrders">
                <i class="el-icon-refresh"></i>
                点击刷新
              </el-button>
            </div>
          </div>
        </div>

        <!-- 操作区 -->
        <div class="operation-panel">
          <div class="section-header">操作区</div>
          <div class="operation-buttons">
            <button
              @click="toggleButtonState('start')"
              :class="{ pressed: buttonStates.start }"
            >
              <i class="el-icon-switch-button"></i><span>全线启动</span>
            </button>
            <button
              @click="toggleButtonState('stop')"
              :class="{ pressed: buttonStates.stop }"
            >
              <i class="el-icon-error"></i><span>全线停止</span>
            </button>
            <button
              @click="toggleButtonState('reset')"
              :class="{ pressed: buttonStates.reset }"
            >
              <i class="el-icon-video-pause"></i><span>全线暂停</span>
            </button>
            <button
              @click="toggleButtonState('fault_reset')"
              :class="{ pressed: buttonStates.fault_reset }"
            >
              <i class="el-icon-refresh"></i><span>故障复位</span>
            </button>
            <button
              @click="toggleButtonState('clear')"
              :class="{ pressed: buttonStates.clear }"
            >
              <i class="el-icon-delete"></i><span>全线清空</span>
            </button>
          </div>
        </div>

        <!-- 日志区域 -->
        <div class="log-section">
          <div class="section-header">
            运行日志
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
                @click="switchToAlarmLog"
              >
                报警日志
                <div v-if="unreadAlarms > 0" class="alarm-badge">
                  {{ unreadAlarms }}
                </div>
              </div>
            </div>
          </div>
          <div class="scrollable-content">
            <div class="log-list">
              <template v-if="currentLogs.length > 0">
                <div
                  v-for="log in currentLogs"
                  :key="log.id"
                  :class="[
                    'log-item',
                    { alarm: log.type === 'alarm', unread: log.unread }
                  ]"
                >
                  <div class="log-time">{{ log.timestamp }}</div>
                  <div class="log-item-content">{{ log.message }}</div>
                </div>
              </template>
              <div v-else class="empty-state">
                <i class="el-icon-chat-line-square"></i>
                <p>
                  {{
                    activeLogType === 'running'
                      ? '暂无运行日志'
                      : '暂无报警日志'
                  }}
                </p>
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
                <img
                  src="@/assets/floor1.webp"
                  alt="一楼平面图"
                  class="floor-image"
                  @load="updateMarkerPositions"
                  loading="eager"
                  decoding="async"
                />
                <!-- 模式选择卡片 -->
                <div class="mode-control-card" data-x="-35" data-y="5">
                  <div class="mode-card-content">
                    <div class="mode-card-header">
                      <i class="el-icon-setting"></i>
                      控制模式
                    </div>
                    <div class="mode-card-body">
                      <div class="mode-select-row">
                        <el-select
                          v-model="controlMode"
                          size="mini"
                          :disabled="isModeExecuting"
                          placeholder="请选择模式"
                          style="width: 100%"
                        >
                          <el-option
                            label="MSE控制模式"
                            value="mse"
                          ></el-option>
                          <el-option
                            label="WCS控制-无码模式"
                            value="nocode"
                          ></el-option>
                        </el-select>
                      </div>
                      <!-- 无码模式配置 -->
                      <div
                        v-if="controlMode === 'nocode'"
                        class="nocode-config-row"
                      >
                        <div class="config-item">
                          <span class="config-label">目标数：</span>
                          <el-input
                            v-model="nocodeTargetCount"
                            size="mini"
                            :disabled="isModeExecuting"
                            style="width: 100px"
                          ></el-input>
                        </div>
                        <div class="config-item">
                          <span class="config-label">预热房：</span>
                          <el-select
                            v-model="nocodeDestination"
                            size="mini"
                            :disabled="isModeExecuting"
                            style="width: 100px"
                          >
                            <el-option label="A1" value="A1"></el-option>
                            <el-option label="B1" value="B1"></el-option>
                            <el-option label="C1" value="C1"></el-option>
                            <el-option label="D1" value="D1"></el-option>
                            <el-option label="E1" value="E1"></el-option>
                            <el-option label="F1" value="F1"></el-option>
                            <el-option label="G1" value="G1"></el-option>
                          </el-select>
                        </div>
                        <div v-if="isModeExecuting" class="nocode-progress">
                          <span
                            >进度：{{
                              getQueueCountFromPLC(nocodeDestination)
                            }}/{{ nocodeTargetCount }}</span
                          >
                        </div>
                      </div>
                      <div class="mode-actions-row">
                        <el-button
                          v-if="!isModeExecuting"
                          type="primary"
                          size="mini"
                          @click="handleModeSet"
                          style="flex: 1"
                        >
                          <i class="el-icon-check"></i>
                          设定
                        </el-button>
                        <div v-else class="executing-state">
                          <div class="executing-info">
                            <i class="el-icon-loading"></i>
                            <span>执行中</span>
                          </div>
                          <el-button
                            type="danger"
                            size="mini"
                            @click="handleModeCancel"
                            style="width: 60px"
                          >
                            取消
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 修改队列标识 -->
                <div
                  v-for="marker in queueMarkers"
                  :key="marker.id"
                  class="queue-marker"
                  :data-x="marker.x"
                  :data-y="marker.y"
                  @click="handleQueueMarkerClick(marker.id)"
                >
                  <div class="queue-marker-content">
                    <span class="queue-marker-count">{{
                      getQueueCountFromPLC(marker.name)
                    }}</span>
                    <span class="queue-marker-name">{{ marker.name }}</span>
                  </div>
                </div>
                <!-- 预热房状态卡片(A2-G2) - 只在预热完成时显示 -->
                <div
                  v-for="marker in queueMarkers.filter((m) =>
                    isPreheatingQueue(m.name)
                  )"
                  :key="'preheat-status-' + marker.id"
                  v-show="checkPreheatingCompleted(marker.name)"
                  class="status-card completed"
                  :data-x="marker.x"
                  :data-y="marker.y + 180"
                >
                  <div class="status-card-title">预热完成</div>
                  <div class="status-card-destination">
                    目的地: {{ getPreheatingDestination(marker.name) }}
                  </div>
                </div>
                <!-- 灭菌柜状态卡片(A3-G3) - 只在灭菌完成时显示 -->
                <div
                  v-for="marker in queueMarkers.filter((m) =>
                    isSterilizationQueue(m.name)
                  )"
                  :key="'sterilize-status-' + marker.id"
                  v-show="checkSterilizationCompleted(marker.name)"
                  class="status-card completed"
                  :data-x="marker.x"
                  :data-y="marker.y - 150"
                >
                  <div class="status-card-title">灭菌完成</div>
                  <div class="status-card-destination">
                    目的地: {{ getSterilizationDestination(marker.name) }}
                  </div>
                </div>
                <!-- 修改小车元素 -->
                <div
                  v-for="cart in carts"
                  :key="cart.name"
                  class="cart-container"
                  :data-cart-id="cart.id"
                  :data-x="cart.x"
                  :data-y="cart.y"
                  :data-width="cart.width"
                >
                  <img :src="cart.image" :alt="cart.name" class="cart-image" />
                </div>
                <!-- 上货扫码区域提示 -->
                <div class="marker-with-panel" data-x="1400" data-y="1420">
                  <div
                    class="data-panel"
                    :class="['position-right', { 'always-show': true }]"
                    style="width: 150px"
                  >
                    <div class="data-panel-header">缓存区扫码信息</div>
                    <div class="data-panel-content">
                      <div class="data-panel-row">
                        <span class="data-panel-label">批次：</span>
                        <span>{{ nocodeBatchId }}</span>
                      </div>
                      <div class="data-panel-row">
                        <span class="data-panel-label">扫码：</span>
                        <span>{{ floor1UpLineTrayInfo || '--' }}</span>
                      </div>
                      <div class="data-panel-row">
                        <span class="data-panel-label">名称：</span>
                        <span>{{
                          currentOrder ? currentOrder.productName : '--'
                        }}</span>
                      </div>
                      <div class="data-panel-row">
                        <span class="data-panel-label">规格：</span>
                        <span>{{
                          currentOrder ? currentOrder.spec : '--'
                        }}</span>
                      </div>
                      <div class="data-panel-row">
                        <span class="data-panel-label">托盘数：</span>
                        <span>{{ nocodeTrayCount }}</span>
                      </div>
                      <div
                        class="data-panel-row"
                        v-if="
                          currentOrder &&
                          currentOrder.qrCode &&
                          isLastQrCodeMatch
                        "
                      >
                        <span>
                          <i class="el-icon-success" style="color: #67c23a"></i>
                          <span
                            class="data-panel-label"
                            style="color: #67c23a; font-weight: bold"
                            >当前批次上货完成，允许执行下一订单</span
                          >
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 上货点信息 -->
                <div class="marker-with-panel" data-x="1490" data-y="900">
                  <div
                    class="data-panel"
                    style="width: 90px"
                    :class="[
                      'position-right',
                      { 'always-show': true, 'vertical-layout': true }
                    ]"
                  >
                    <div class="data-panel-header">一楼上货扫码</div>
                    <div class="data-panel-content">
                      <div
                        class="data-panel-row"
                        v-if="currentOrder && currentOrder.inPut === '1'"
                      >
                        <span>
                          <i class="el-icon-success" style="color: #67c23a"></i>
                          <span style="color: #67c23a; font-weight: bold"
                            >允许一楼送货</span
                          >
                        </span>
                      </div>
                      <div class="data-panel-row">
                        <span class="data-panel-label">扫码信息：</span>
                        <div
                          style="
                            display: flex;
                            flex-direction: column;
                            gap: 4px;
                          "
                        >
                          <span>{{ floor1InLineTrayInfo || '--' }}</span>
                          <span
                            v-if="
                              currentOrder &&
                              currentOrder.qrCode &&
                              floor1InLineTrayInfo &&
                              currentOrder.qrCode.includes(floor1InLineTrayInfo)
                            "
                          >
                            <i
                              class="el-icon-success"
                              style="color: #67c23a"
                            ></i>
                            <span style="color: #67c23a; font-weight: bold"
                              >运行订单包含</span
                            >
                          </span>
                        </div>
                      </div>
                      <!-- 无码模式下显示复选框 -->
                      <div
                        v-if="controlMode === 'nocode' && isModeExecuting"
                        class="data-panel-row nocode-checkbox-row"
                      >
                        <span class="data-panel-label">允许上货：</span>
                        <el-checkbox
                          v-model="nocodeFloor1Enabled"
                          @change="handleNocodeFloor1Change"
                          size="mini"
                        >
                        </el-checkbox>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 下货点信息 -->
                <div class="marker-with-panel" data-x="1380" data-y="25">
                  <div
                    class="data-panel"
                    style="padding: 4px 12px; width: 140px"
                    :class="['position-left', { 'always-show': true }]"
                  >
                    <div class="data-panel-header">下货扫码信息</div>
                    <div class="data-panel-content">
                      <div class="data-panel-row">
                        <span class="data-panel-label">扫码信息：</span>
                        <span>{{ floor1OutLineTrayInfo || '--' }}</span>
                      </div>
                      <div class="data-panel-row">
                        <span class="data-panel-label">订单号：</span>
                        <span>--</span>
                      </div>
                      <div class="data-panel-row">
                        <span class="data-panel-label">指定出口：</span>
                        <span>--</span>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 上货区电机运行信号 -->
                <div
                  class="motor-marker label-left"
                  :class="{ running: upLoadMotorRunning.bit0 === '1' }"
                  data-x="1365"
                  data-y="1265"
                  @click="toggleBitValue(upLoadMotorRunning, 'bit0')"
                >
                  <div class="marker-label">S-1#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: upLoadMotorRunning.bit1 === '1' }"
                  data-x="1365"
                  data-y="1323"
                  @click="toggleBitValue(upLoadMotorRunning, 'bit1')"
                >
                  <div class="marker-label">S-2#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: upLoadMotorRunning.bit2 === '1' }"
                  data-x="1365"
                  data-y="1380"
                  @click="toggleBitValue(upLoadMotorRunning, 'bit2')"
                >
                  <div class="marker-label">S-3#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: upLoadMotorRunning.bit3 === '1' }"
                  data-x="1368"
                  data-y="1442"
                  @click="toggleBitValue(upLoadMotorRunning, 'bit3')"
                >
                  <div class="marker-label">S-4#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: upLoadMotorRunning.bit4 === '1' }"
                  data-x="1368"
                  data-y="1502"
                  @click="toggleBitValue(upLoadMotorRunning, 'bit4')"
                >
                  <div class="marker-label">S-5#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: upLoadMotorRunning.bit5 === '1' }"
                  data-x="1368"
                  data-y="1562"
                  @click="toggleBitValue(upLoadMotorRunning, 'bit5')"
                >
                  <div class="marker-label">S-6#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: upLoadMotorRunning.bit6 === '1' }"
                  data-x="1368"
                  data-y="1620"
                  @click="toggleBitValue(upLoadMotorRunning, 'bit6')"
                >
                  <div class="marker-label">S-7#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: upLoadMotorRunning.bit7 === '1' }"
                  data-x="1368"
                  data-y="1670"
                  @click="toggleBitValue(upLoadMotorRunning, 'bit7')"
                >
                  <div class="marker-label">S-8#</div>
                </div>
                <!-- 上货区输送线光电信号 -->
                <div
                  class="marker label-right"
                  :class="{ scanning: upLoadPhotoelectricSignal.bit0 === '1' }"
                  data-x="1335"
                  data-y="1293"
                  @click="toggleBitValue(upLoadPhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">S-1#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: upLoadPhotoelectricSignal.bit1 === '1' }"
                  data-x="1335"
                  data-y="1353"
                  @click="toggleBitValue(upLoadPhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">S-2#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: upLoadPhotoelectricSignal.bit2 === '1' }"
                  data-x="1335"
                  data-y="1413"
                  @click="toggleBitValue(upLoadPhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">S-3#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: upLoadPhotoelectricSignal.bit3 === '1' }"
                  data-x="1335"
                  data-y="1473"
                  @click="toggleBitValue(upLoadPhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">S-4#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: upLoadPhotoelectricSignal.bit4 === '1' }"
                  data-x="1335"
                  data-y="1533"
                  @click="toggleBitValue(upLoadPhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">S-5#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: upLoadPhotoelectricSignal.bit5 === '1' }"
                  data-x="1335"
                  data-y="1593"
                  @click="toggleBitValue(upLoadPhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">S-6#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: upLoadPhotoelectricSignal.bit6 === '1' }"
                  data-x="1335"
                  data-y="1648"
                  @click="toggleBitValue(upLoadPhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">S-7#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: upLoadPhotoelectricSignal.bit7 === '1' }"
                  data-x="1335"
                  data-y="1695"
                  @click="toggleBitValue(upLoadPhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">S-8#</div>
                </div>

                <!-- A线电机运行信号 -->
                <div
                  class="motor-marker label-top"
                  :class="{ running: aLineMotorRunning.bit0 === '1' }"
                  data-x="1190"
                  data-y="1450"
                  @click="toggleBitValue(aLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label">A1-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: aLineMotorRunning.bit1 === '1' }"
                  data-x="1240"
                  data-y="1450"
                  @click="toggleBitValue(aLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label">A1-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: aLineMotorRunning.bit2 === '1' }"
                  data-x="1190"
                  data-y="1085"
                  @click="toggleBitValue(aLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label">A2-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: aLineMotorRunning.bit3 === '1' }"
                  data-x="1240"
                  data-y="1085"
                  @click="toggleBitValue(aLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label">A2-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: aLineMotorRunning.bit4 === '1' }"
                  data-x="1187"
                  data-y="360"
                  @click="toggleBitValue(aLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label">A3-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: aLineMotorRunning.bit5 === '1' }"
                  data-x="1237"
                  data-y="360"
                  @click="toggleBitValue(aLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label">A3-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: aLineMotorRunning.bit6 === '1' }"
                  data-x="1190"
                  data-y="290"
                  @click="toggleBitValue(aLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label">A4-1#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: aLineMotorRunning.bit7 === '1' }"
                  data-x="1233"
                  data-y="290"
                  @click="toggleBitValue(aLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label">A4-2#</div>
                </div>
                <!-- A线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit0 === '1' }"
                  data-x="1190"
                  data-y="1680"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">A-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit1 === '1' }"
                  data-x="1245"
                  data-y="1680"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">A-2#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: aLinePhotoelectricSignal.bit2 === '1' }"
                  data-x="1190"
                  data-y="1280"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">A-3#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: aLinePhotoelectricSignal.bit3 === '1' }"
                  data-x="1240"
                  data-y="1280"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">A-4#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: aLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="1190"
                  data-y="850"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">A-5#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: aLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="1240"
                  data-y="850"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">A-6#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: aLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="1165"
                  data-y="320"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">A-7#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: aLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="1163"
                  data-y="270"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">A-8#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: aLinePhotoelectricSignal.bit8 === '1' }"
                  data-x="1260"
                  data-y="320"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">A-9#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: aLinePhotoelectricSignal.bit9 === '1' }"
                  data-x="1263"
                  data-y="270"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">A-10#</div>
                </div>
                <!-- B线电机运行信号 -->
                <div
                  class="motor-marker label-top"
                  :class="{ running: bLineMotorRunning.bit0 === '1' }"
                  data-x="1058"
                  data-y="1450"
                  @click="toggleBitValue(bLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label">B1-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: bLineMotorRunning.bit1 === '1' }"
                  data-x="1108"
                  data-y="1450"
                  @click="toggleBitValue(bLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label">B1-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: bLineMotorRunning.bit2 === '1' }"
                  data-x="1058"
                  data-y="1085"
                  @click="toggleBitValue(bLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label">B2-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: bLineMotorRunning.bit3 === '1' }"
                  data-x="1108"
                  data-y="1085"
                  @click="toggleBitValue(bLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label">B2-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: bLineMotorRunning.bit4 === '1' }"
                  data-x="1055"
                  data-y="360"
                  @click="toggleBitValue(bLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label">B3-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: bLineMotorRunning.bit5 === '1' }"
                  data-x="1105"
                  data-y="360"
                  @click="toggleBitValue(bLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label">B3-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: bLineMotorRunning.bit6 === '1' }"
                  data-x="1058"
                  data-y="290"
                  @click="toggleBitValue(bLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label">B4-1#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: bLineMotorRunning.bit7 === '1' }"
                  data-x="1101"
                  data-y="290"
                  @click="toggleBitValue(bLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label">B4-2#</div>
                </div>
                <!-- B线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit0 === '1' }"
                  data-x="1058"
                  data-y="1680"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">B-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit1 === '1' }"
                  data-x="1113"
                  data-y="1680"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">B-2#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: bLinePhotoelectricSignal.bit2 === '1' }"
                  data-x="1058"
                  data-y="1280"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">B-3#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: bLinePhotoelectricSignal.bit3 === '1' }"
                  data-x="1108"
                  data-y="1280"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">B-4#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: bLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="1058"
                  data-y="850"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">B-5#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: bLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="1108"
                  data-y="850"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">B-6#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: bLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="1033"
                  data-y="320"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">B-7#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: bLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="1031"
                  data-y="270"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">B-8#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: bLinePhotoelectricSignal.bit8 === '1' }"
                  data-x="1128"
                  data-y="320"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">B-9#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: bLinePhotoelectricSignal.bit9 === '1' }"
                  data-x="1131"
                  data-y="270"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">B-10#</div>
                </div>
                <!-- C线电机运行信号 -->
                <div
                  class="motor-marker label-top"
                  :class="{ running: cLineMotorRunning.bit0 === '1' }"
                  data-x="880"
                  data-y="1450"
                  @click="toggleBitValue(cLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label">C1-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: cLineMotorRunning.bit1 === '1' }"
                  data-x="930"
                  data-y="1450"
                  @click="toggleBitValue(cLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label">C1-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: cLineMotorRunning.bit2 === '1' }"
                  data-x="880"
                  data-y="1085"
                  @click="toggleBitValue(cLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label">C2-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: cLineMotorRunning.bit3 === '1' }"
                  data-x="930"
                  data-y="1085"
                  @click="toggleBitValue(cLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label">C2-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: cLineMotorRunning.bit4 === '1' }"
                  data-x="882"
                  data-y="360"
                  @click="toggleBitValue(cLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label">C3-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: cLineMotorRunning.bit5 === '1' }"
                  data-x="927"
                  data-y="360"
                  @click="toggleBitValue(cLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label">C3-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: cLineMotorRunning.bit6 === '1' }"
                  data-x="883"
                  data-y="290"
                  @click="toggleBitValue(cLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label">C4-1#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: cLineMotorRunning.bit7 === '1' }"
                  data-x="923"
                  data-y="290"
                  @click="toggleBitValue(cLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label">C4-2#</div>
                </div>
                <!-- C线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit0 === '1' }"
                  data-x="880"
                  data-y="1680"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">C-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit1 === '1' }"
                  data-x="935"
                  data-y="1680"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">C-2#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: cLinePhotoelectricSignal.bit2 === '1' }"
                  data-x="880"
                  data-y="1280"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">C-3#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: cLinePhotoelectricSignal.bit3 === '1' }"
                  data-x="930"
                  data-y="1280"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">C-4#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: cLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="880"
                  data-y="850"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">C-5#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: cLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="930"
                  data-y="850"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">C-6#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: cLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="855"
                  data-y="320"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">C-7#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: cLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="853"
                  data-y="270"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">C-8#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: cLinePhotoelectricSignal.bit8 === '1' }"
                  data-x="950"
                  data-y="320"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">C-9#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: cLinePhotoelectricSignal.bit9 === '1' }"
                  data-x="953"
                  data-y="270"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">C-10#</div>
                </div>
                <!-- D线电机运行信号 -->
                <div
                  class="motor-marker label-top"
                  :class="{ running: dLineMotorRunning.bit0 === '1' }"
                  data-x="752"
                  data-y="1450"
                  @click="toggleBitValue(dLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label">D1-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: dLineMotorRunning.bit1 === '1' }"
                  data-x="802"
                  data-y="1450"
                  @click="toggleBitValue(dLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label">D1-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: dLineMotorRunning.bit2 === '1' }"
                  data-x="752"
                  data-y="1085"
                  @click="toggleBitValue(dLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label">D2-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: dLineMotorRunning.bit3 === '1' }"
                  data-x="802"
                  data-y="1085"
                  @click="toggleBitValue(dLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label">D2-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: dLineMotorRunning.bit4 === '1' }"
                  data-x="755"
                  data-y="360"
                  @click="toggleBitValue(dLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label">D3-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: dLineMotorRunning.bit5 === '1' }"
                  data-x="799"
                  data-y="360"
                  @click="toggleBitValue(dLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label">D3-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: dLineMotorRunning.bit6 === '1' }"
                  data-x="755"
                  data-y="290"
                  @click="toggleBitValue(dLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label">D4-1#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: dLineMotorRunning.bit7 === '1' }"
                  data-x="795"
                  data-y="290"
                  @click="toggleBitValue(dLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label">D4-2#</div>
                </div>
                <!-- D线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit0 === '1' }"
                  data-x="752"
                  data-y="1680"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">D-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit1 === '1' }"
                  data-x="807"
                  data-y="1680"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">D-2#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: dLinePhotoelectricSignal.bit2 === '1' }"
                  data-x="752"
                  data-y="1280"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">D-3#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: dLinePhotoelectricSignal.bit3 === '1' }"
                  data-x="802"
                  data-y="1280"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">D-4#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: dLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="752"
                  data-y="850"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">D-5#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: dLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="802"
                  data-y="850"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">D-6#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: dLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="727"
                  data-y="320"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">D-7#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: dLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="725"
                  data-y="270"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">D-8#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: dLinePhotoelectricSignal.bit8 === '1' }"
                  data-x="822"
                  data-y="320"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">D-9#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: dLinePhotoelectricSignal.bit9 === '1' }"
                  data-x="825"
                  data-y="270"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">D-10#</div>
                </div>
                <!-- E线电机运行信号 -->
                <div
                  class="motor-marker label-top"
                  :class="{ running: eLineMotorRunning.bit0 === '1' }"
                  data-x="584"
                  data-y="1450"
                  @click="toggleBitValue(eLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label">E1-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: eLineMotorRunning.bit1 === '1' }"
                  data-x="634"
                  data-y="1450"
                  @click="toggleBitValue(eLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label">E1-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: eLineMotorRunning.bit2 === '1' }"
                  data-x="584"
                  data-y="1085"
                  @click="toggleBitValue(eLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label">E2-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: eLineMotorRunning.bit3 === '1' }"
                  data-x="634"
                  data-y="1085"
                  @click="toggleBitValue(eLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label">E2-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: eLineMotorRunning.bit4 === '1' }"
                  data-x="588"
                  data-y="360"
                  @click="toggleBitValue(eLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label">E3-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: eLineMotorRunning.bit5 === '1' }"
                  data-x="638"
                  data-y="360"
                  @click="toggleBitValue(eLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label">E3-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: eLineMotorRunning.bit6 === '1' }"
                  data-x="588"
                  data-y="290"
                  @click="toggleBitValue(eLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label">E4-1#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: eLineMotorRunning.bit7 === '1' }"
                  data-x="634"
                  data-y="290"
                  @click="toggleBitValue(eLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label">E4-2#</div>
                </div>
                <!-- E线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit0 === '1' }"
                  data-x="584"
                  data-y="1680"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">E-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit1 === '1' }"
                  data-x="639"
                  data-y="1680"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">E-2#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: eLinePhotoelectricSignal.bit2 === '1' }"
                  data-x="584"
                  data-y="1280"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">E-3#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: eLinePhotoelectricSignal.bit3 === '1' }"
                  data-x="634"
                  data-y="1280"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">E-4#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: eLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="584"
                  data-y="850"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">E-5#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: eLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="634"
                  data-y="850"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">E-6#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: eLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="559"
                  data-y="320"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">E-7#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: eLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="557"
                  data-y="270"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">E-8#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: eLinePhotoelectricSignal.bit8 === '1' }"
                  data-x="654"
                  data-y="320"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">E-9#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: eLinePhotoelectricSignal.bit9 === '1' }"
                  data-x="657"
                  data-y="270"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">E-10#</div>
                </div>
                <!-- F线电机运行信号 -->
                <div
                  class="motor-marker label-top"
                  :class="{ running: fLineMotorRunning.bit0 === '1' }"
                  data-x="456"
                  data-y="1450"
                  @click="toggleBitValue(fLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label">F1-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: fLineMotorRunning.bit1 === '1' }"
                  data-x="506"
                  data-y="1450"
                  @click="toggleBitValue(fLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label">F1-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: fLineMotorRunning.bit2 === '1' }"
                  data-x="459"
                  data-y="1085"
                  @click="toggleBitValue(fLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label">F2-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: fLineMotorRunning.bit3 === '1' }"
                  data-x="509"
                  data-y="1085"
                  @click="toggleBitValue(fLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label">F2-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: fLineMotorRunning.bit4 === '1' }"
                  data-x="462"
                  data-y="360"
                  @click="toggleBitValue(fLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label">F3-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: fLineMotorRunning.bit5 === '1' }"
                  data-x="512"
                  data-y="360"
                  @click="toggleBitValue(fLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label">F3-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: fLineMotorRunning.bit6 === '1' }"
                  data-x="462"
                  data-y="290"
                  @click="toggleBitValue(fLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label">F4-1#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: fLineMotorRunning.bit7 === '1' }"
                  data-x="502"
                  data-y="290"
                  @click="toggleBitValue(fLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label">F4-2#</div>
                </div>
                <!-- F线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: fLinePhotoelectricSignal.bit0 === '1' }"
                  data-x="456"
                  data-y="1680"
                  @click="toggleBitValue(fLinePhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">F-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: fLinePhotoelectricSignal.bit1 === '1' }"
                  data-x="511"
                  data-y="1680"
                  @click="toggleBitValue(fLinePhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">F-2#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: fLinePhotoelectricSignal.bit2 === '1' }"
                  data-x="456"
                  data-y="1280"
                  @click="toggleBitValue(fLinePhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">F-3#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: fLinePhotoelectricSignal.bit3 === '1' }"
                  data-x="506"
                  data-y="1280"
                  @click="toggleBitValue(fLinePhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">F-4#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: fLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="456"
                  data-y="850"
                  @click="toggleBitValue(fLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">F-5#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: fLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="506"
                  data-y="850"
                  @click="toggleBitValue(fLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">F-6#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: fLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="431"
                  data-y="320"
                  @click="toggleBitValue(fLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">F-7#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: fLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="429"
                  data-y="270"
                  @click="toggleBitValue(fLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">F-8#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: fLinePhotoelectricSignal.bit8 === '1' }"
                  data-x="526"
                  data-y="320"
                  @click="toggleBitValue(fLinePhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">F-9#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: fLinePhotoelectricSignal.bit9 === '1' }"
                  data-x="529"
                  data-y="270"
                  @click="toggleBitValue(fLinePhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">F-10#</div>
                </div>
                <!-- G线电机运行信号 -->
                <div
                  class="motor-marker label-top"
                  :class="{ running: gLineMotorRunning.bit0 === '1' }"
                  data-x="297"
                  data-y="1450"
                  @click="toggleBitValue(gLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label">G1-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: gLineMotorRunning.bit1 === '1' }"
                  data-x="347"
                  data-y="1450"
                  @click="toggleBitValue(gLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label">G1-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: gLineMotorRunning.bit2 === '1' }"
                  data-x="300"
                  data-y="1085"
                  @click="toggleBitValue(gLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label">G2-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: gLineMotorRunning.bit3 === '1' }"
                  data-x="350"
                  data-y="1085"
                  @click="toggleBitValue(gLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label">G2-2#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: gLineMotorRunning.bit4 === '1' }"
                  data-x="313"
                  data-y="360"
                  @click="toggleBitValue(gLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label">G3-1#</div>
                </div>
                <div
                  class="motor-marker label-bottom"
                  :class="{ running: gLineMotorRunning.bit5 === '1' }"
                  data-x="360"
                  data-y="360"
                  @click="toggleBitValue(gLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label">G3-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: gLineMotorRunning.bit6 === '1' }"
                  data-x="313"
                  data-y="290"
                  @click="toggleBitValue(gLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label">G4-1#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: gLineMotorRunning.bit7 === '1' }"
                  data-x="360"
                  data-y="290"
                  @click="toggleBitValue(gLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label">G4-2#</div>
                </div>
                <!-- G线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: gLinePhotoelectricSignal.bit0 === '1' }"
                  data-x="297"
                  data-y="1680"
                  @click="toggleBitValue(gLinePhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">G-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: gLinePhotoelectricSignal.bit1 === '1' }"
                  data-x="352"
                  data-y="1680"
                  @click="toggleBitValue(gLinePhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">G-2#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: gLinePhotoelectricSignal.bit2 === '1' }"
                  data-x="300"
                  data-y="1280"
                  @click="toggleBitValue(gLinePhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">G-3#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: gLinePhotoelectricSignal.bit3 === '1' }"
                  data-x="350"
                  data-y="1280"
                  @click="toggleBitValue(gLinePhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">G-4#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: gLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="300"
                  data-y="850"
                  @click="toggleBitValue(gLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">G-5#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: gLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="350"
                  data-y="850"
                  @click="toggleBitValue(gLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">G-6#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: gLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="278"
                  data-y="320"
                  @click="toggleBitValue(gLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">G-7#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: gLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="278"
                  data-y="270"
                  @click="toggleBitValue(gLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">G-8#</div>
                </div>
                <div
                  class="marker label-bottom"
                  :class="{ scanning: gLinePhotoelectricSignal.bit8 === '1' }"
                  data-x="385"
                  data-y="320"
                  @click="toggleBitValue(gLinePhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">G-9#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: gLinePhotoelectricSignal.bit9 === '1' }"
                  data-x="385"
                  data-y="270"
                  @click="toggleBitValue(gLinePhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">G-10#</div>
                </div>
                <!-- 入库区光电点位显示 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: inLoadPhotoelectricSignal.bit0 === '1' }"
                  data-x="1490"
                  data-y="1200"
                  @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">上货光电</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: inLoadPhotoelectricSignal.bit1 === '1' }"
                  data-x="1400"
                  data-y="1200"
                  @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">称重到位</div>
                </div>
                <div
                  class="marker label-left"
                  :class="{ scanning: inLoadPhotoelectricSignal.bit2 === '1' }"
                  data-x="1335"
                  data-y="1182"
                  @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">上货到位</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: inLoadPhotoelectricSignal.bit3 === '1' }"
                  data-x="1335"
                  data-y="1130"
                  @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">A-4#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: inLoadPhotoelectricSignal.bit4 === '1' }"
                  data-x="1335"
                  data-y="1065"
                  @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">A-5#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: inLoadPhotoelectricSignal.bit5 === '1' }"
                  data-x="1335"
                  data-y="1020"
                  @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">A-6#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: inLoadPhotoelectricSignal.bit6 === '1' }"
                  data-x="1335"
                  data-y="970"
                  @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">A-7#</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: inLoadPhotoelectricSignal.bit7 === '1' }"
                  data-x="1335"
                  data-y="888"
                  @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">货物到位</div>
                </div>
                <!-- 入库电机运行信号 -->
                <div
                  class="motor-marker label-top"
                  :class="{ running: inLoadMotorRunning.bit0 === '1' }"
                  data-x="1430"
                  data-y="1182"
                  @click="toggleBitValue(inLoadMotorRunning, 'bit0')"
                >
                  <div class="marker-label">S-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: inLoadMotorRunning.bit1 === '1' }"
                  data-x="1365"
                  data-y="1182"
                  @click="toggleBitValue(inLoadMotorRunning, 'bit1')"
                >
                  <div class="marker-label">S-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: inLoadMotorRunning.bit2 === '1' }"
                  data-x="1365"
                  data-y="1128"
                  @click="toggleBitValue(inLoadMotorRunning, 'bit2')"
                >
                  <div class="marker-label">S-3#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: inLoadMotorRunning.bit3 === '1' }"
                  data-x="1365"
                  data-y="1065"
                  @click="toggleBitValue(inLoadMotorRunning, 'bit3')"
                >
                  <div class="marker-label">S-4#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: inLoadMotorRunning.bit4 === '1' }"
                  data-x="1365"
                  data-y="1018"
                  @click="toggleBitValue(inLoadMotorRunning, 'bit4')"
                >
                  <div class="marker-label">S-5#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: inLoadMotorRunning.bit5 === '1' }"
                  data-x="1365"
                  data-y="960"
                  @click="toggleBitValue(inLoadMotorRunning, 'bit5')"
                >
                  <div class="marker-label">S-6#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: inLoadMotorRunning.bit6 === '1' }"
                  data-x="1365"
                  data-y="890"
                  @click="toggleBitValue(inLoadMotorRunning, 'bit6')"
                >
                  <div class="marker-label">S-7#</div>
                </div>
                <!-- 出库区光电点位显示 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: outLoadPhotoelectricSignal.bit0 === '1' }"
                  data-x="920"
                  data-y="150"
                  @click="toggleBitValue(outLoadPhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">3002</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: outLoadPhotoelectricSignal.bit1 === '1' }"
                  data-x="980"
                  data-y="150"
                  @click="toggleBitValue(outLoadPhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">3003</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: outLoadPhotoelectricSignal.bit2 === '1' }"
                  data-x="1080"
                  data-y="150"
                  @click="toggleBitValue(outLoadPhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">3006</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: outLoadPhotoelectricSignal.bit3 === '1' }"
                  data-x="1180"
                  data-y="150"
                  @click="toggleBitValue(outLoadPhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">3007</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: outLoadPhotoelectricSignal.bit4 === '1' }"
                  data-x="1280"
                  data-y="150"
                  @click="toggleBitValue(outLoadPhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">3008</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: outLoadPhotoelectricSignal.bit5 === '1' }"
                  data-x="1370"
                  data-y="150"
                  @click="toggleBitValue(outLoadPhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">3010-1</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: outLoadPhotoelectricSignal.bit6 === '1' }"
                  data-x="1370"
                  data-y="190"
                  @click="toggleBitValue(outLoadPhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">3010-2</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: outLoadPhotoelectricSignal.bit7 === '1' }"
                  data-x="1320"
                  data-y="210"
                  @click="toggleBitValue(outLoadPhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">3013-1</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: outLoadPhotoelectricSignal.bit8 === '1' }"
                  data-x="1320"
                  data-y="300"
                  @click="toggleBitValue(outLoadPhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">3013-2</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{ scanning: outLoadPhotoelectricSignal.bit9 === '1' }"
                  data-x="1320"
                  data-y="330"
                  @click="toggleBitValue(outLoadPhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">3016</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{
                    scanning: outLoadPhotoelectricSignal.bit10 === '1'
                  }"
                  data-x="1320"
                  data-y="450"
                  @click="toggleBitValue(outLoadPhotoelectricSignal, 'bit10')"
                >
                  <div class="marker-label">3017</div>
                </div>
                <div
                  class="marker label-right"
                  :class="{
                    scanning: outLoadPhotoelectricSignal.bit11 === '1'
                  }"
                  data-x="1475"
                  data-y="300"
                  @click="toggleBitValue(outLoadPhotoelectricSignal, 'bit11')"
                >
                  <div class="marker-label">3014</div>
                </div>
                <!-- 出库电机运行信号 -->
                <div
                  class="motor-marker label-top"
                  :class="{ running: outLoadMotorRunning.bit0 === '1' }"
                  data-x="880"
                  data-y="175"
                  @click="toggleBitValue(outLoadMotorRunning, 'bit0')"
                >
                  <div class="marker-label">3002</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: outLoadMotorRunning.bit1 === '1' }"
                  data-x="950"
                  data-y="175"
                  @click="toggleBitValue(outLoadMotorRunning, 'bit1')"
                >
                  <div class="marker-label">3003</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: outLoadMotorRunning.bit2 === '1' }"
                  data-x="1010"
                  data-y="175"
                  @click="toggleBitValue(outLoadMotorRunning, 'bit2')"
                >
                  <div class="marker-label">3001</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: outLoadMotorRunning.bit3 === '1' }"
                  data-x="1040"
                  data-y="175"
                  @click="toggleBitValue(outLoadMotorRunning, 'bit3')"
                >
                  <div class="marker-label">3006</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: outLoadMotorRunning.bit4 === '1' }"
                  data-x="1100"
                  data-y="175"
                  @click="toggleBitValue(outLoadMotorRunning, 'bit4')"
                >
                  <div class="marker-label">3007</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: outLoadMotorRunning.bit5 === '1' }"
                  data-x="1205"
                  data-y="175"
                  @click="toggleBitValue(outLoadMotorRunning, 'bit5')"
                >
                  <div class="marker-label">3008</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: outLoadMotorRunning.bit6 === '1' }"
                  data-x="1340"
                  data-y="175"
                  @click="toggleBitValue(outLoadMotorRunning, 'bit6')"
                >
                  <div class="marker-label">3010</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: outLoadMotorRunning.bit7 === '1' }"
                  data-x="1355"
                  data-y="250"
                  @click="toggleBitValue(outLoadMotorRunning, 'bit7')"
                >
                  <div class="marker-label">3012</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: outLoadMotorRunning.bit8 === '1' }"
                  data-x="1355"
                  data-y="328"
                  @click="toggleBitValue(outLoadMotorRunning, 'bit8')"
                >
                  <div class="marker-label">3016</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: outLoadMotorRunning.bit9 === '1' }"
                  data-x="1355"
                  data-y="410"
                  @click="toggleBitValue(outLoadMotorRunning, 'bit9')"
                >
                  <div class="marker-label">3013</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: outLoadMotorRunning.bit10 === '1' }"
                  data-x="1435"
                  data-y="330"
                  @click="toggleBitValue(outLoadMotorRunning, 'bit10')"
                >
                  <div class="marker-label">3014</div>
                </div>
                <!-- 预热房门状态显示 -->
                <!-- 预热房A门状态 -->
                <div class="door-status-marker" data-x="1215" data-y="1675">
                  <div class="door-status-label">预热房A前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit0 === '1',
                      'door-closed': preheatingDoorStatus.bit0 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="1212" data-y="810">
                  <div class="door-status-label">预热房A后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit1 === '1',
                      'door-closed': preheatingDoorStatus.bit1 === '0'
                    }"
                  ></div>
                </div>

                <!-- 预热房B门状态 -->
                <div class="door-status-marker" data-x="1085" data-y="1675">
                  <div class="door-status-label">预热房B前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit2 === '1',
                      'door-closed': preheatingDoorStatus.bit2 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="1082" data-y="810">
                  <div class="door-status-label">预热房B后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit3 === '1',
                      'door-closed': preheatingDoorStatus.bit3 === '0'
                    }"
                  ></div>
                </div>

                <!-- 预热房C门状态 -->
                <div class="door-status-marker" data-x="905" data-y="1675">
                  <div class="door-status-label">预热房C前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit4 === '1',
                      'door-closed': preheatingDoorStatus.bit4 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="905" data-y="810">
                  <div class="door-status-label">预热房C后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit5 === '1',
                      'door-closed': preheatingDoorStatus.bit5 === '0'
                    }"
                  ></div>
                </div>

                <!-- 预热房D门状态 -->
                <div class="door-status-marker" data-x="778" data-y="1675">
                  <div class="door-status-label">预热房D前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit6 === '1',
                      'door-closed': preheatingDoorStatus.bit6 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="778" data-y="810">
                  <div class="door-status-label">预热房D后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit7 === '1',
                      'door-closed': preheatingDoorStatus.bit7 === '0'
                    }"
                  ></div>
                </div>

                <!-- 预热房E门状态 -->
                <div class="door-status-marker" data-x="610" data-y="1675">
                  <div class="door-status-label">预热房E前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit8 === '1',
                      'door-closed': preheatingDoorStatus.bit8 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="613" data-y="810">
                  <div class="door-status-label">预热房E后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit9 === '1',
                      'door-closed': preheatingDoorStatus.bit9 === '0'
                    }"
                  ></div>
                </div>

                <!-- 预热房F门状态 -->
                <div class="door-status-marker" data-x="478" data-y="1675">
                  <div class="door-status-label">预热房F前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit10 === '1',
                      'door-closed': preheatingDoorStatus.bit10 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="483" data-y="810">
                  <div class="door-status-label">预热房F后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit11 === '1',
                      'door-closed': preheatingDoorStatus.bit11 === '0'
                    }"
                  ></div>
                </div>

                <!-- 预热房G门状态 -->
                <div class="door-status-marker" data-x="323" data-y="1675">
                  <div class="door-status-label">预热房G前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit12 === '1',
                      'door-closed': preheatingDoorStatus.bit12 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="328" data-y="810">
                  <div class="door-status-label">预热房G后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': preheatingDoorStatus.bit13 === '1',
                      'door-closed': preheatingDoorStatus.bit13 === '0'
                    }"
                  ></div>
                </div>

                <!-- 灭菌房门状态显示 -->
                <!-- 灭菌房A门状态 -->
                <div class="door-status-marker" data-x="1215" data-y="730">
                  <div class="door-status-label">灭菌房A前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit0 === '1',
                      'door-closed': sterilizationDoorStatus.bit0 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="1212" data-y="310">
                  <div class="door-status-label">灭菌房A后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit1 === '1',
                      'door-closed': sterilizationDoorStatus.bit1 === '0'
                    }"
                  ></div>
                </div>

                <!-- 灭菌房B门状态 -->
                <div class="door-status-marker" data-x="1085" data-y="730">
                  <div class="door-status-label">灭菌房B前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit2 === '1',
                      'door-closed': sterilizationDoorStatus.bit2 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="1082" data-y="310">
                  <div class="door-status-label">灭菌房B后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit3 === '1',
                      'door-closed': sterilizationDoorStatus.bit3 === '0'
                    }"
                  ></div>
                </div>

                <!-- 灭菌房C门状态 -->
                <div class="door-status-marker" data-x="905" data-y="730">
                  <div class="door-status-label">灭菌房C前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit4 === '1',
                      'door-closed': sterilizationDoorStatus.bit4 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="905" data-y="310">
                  <div class="door-status-label">灭菌房C后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit5 === '1',
                      'door-closed': sterilizationDoorStatus.bit5 === '0'
                    }"
                  ></div>
                </div>

                <!-- 灭菌房D门状态 -->
                <div class="door-status-marker" data-x="778" data-y="730">
                  <div class="door-status-label">灭菌房D前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit6 === '1',
                      'door-closed': sterilizationDoorStatus.bit6 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="778" data-y="310">
                  <div class="door-status-label">灭菌房D后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit7 === '1',
                      'door-closed': sterilizationDoorStatus.bit7 === '0'
                    }"
                  ></div>
                </div>

                <!-- 灭菌房E门状态 -->
                <div class="door-status-marker" data-x="610" data-y="730">
                  <div class="door-status-label">灭菌房E前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit8 === '1',
                      'door-closed': sterilizationDoorStatus.bit8 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="610" data-y="310">
                  <div class="door-status-label">灭菌房E后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit9 === '1',
                      'door-closed': sterilizationDoorStatus.bit9 === '0'
                    }"
                  ></div>
                </div>

                <!-- 灭菌房F门状态 -->
                <div class="door-status-marker" data-x="480" data-y="730">
                  <div class="door-status-label">灭菌房F前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit10 === '1',
                      'door-closed': sterilizationDoorStatus.bit10 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="483" data-y="310">
                  <div class="door-status-label">灭菌房F后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit11 === '1',
                      'door-closed': sterilizationDoorStatus.bit11 === '0'
                    }"
                  ></div>
                </div>

                <!-- 灭菌房G门状态 -->
                <div class="door-status-marker" data-x="328" data-y="730">
                  <div class="door-status-label">灭菌房G前门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit12 === '1',
                      'door-closed': sterilizationDoorStatus.bit12 === '0'
                    }"
                  ></div>
                </div>
                <div class="door-status-marker" data-x="330" data-y="310">
                  <div class="door-status-label">灭菌房G后门</div>
                  <div
                    class="door-status-indicator"
                    :class="{
                      'door-open': sterilizationDoorStatus.bit13 === '1',
                      'door-closed': sterilizationDoorStatus.bit13 === '0'
                    }"
                  ></div>
                </div>

                <!-- 测试-手动发送PLC命令 -->
                <div
                  class="preheating-room-marker"
                  data-x="120"
                  data-y="1200"
                  style="width: 140px"
                >
                  <div class="preheating-room-content">
                    <div class="preheating-room-header">预热房到灭菌柜选择</div>
                    <div class="preheating-room-body">
                      <div style="display: flex; align-items: center">
                        <el-select
                          v-model="disinfectionRoomSelectedFrom"
                          placeholder="预"
                          size="mini"
                          :disabled="
                            isDisinfectionExecuting ||
                            (controlMode === 'mse' && isModeExecuting)
                          "
                        >
                          <el-option label="A" value="A"></el-option>
                          <el-option label="B" value="B"></el-option>
                          <el-option label="C" value="C"></el-option>
                          <el-option label="D" value="D"></el-option>
                          <el-option label="E" value="E"></el-option>
                          <el-option label="F" value="F"></el-option>
                          <el-option label="G" value="G"></el-option>
                        </el-select>
                        <span
                          style="font-size: 12px; color: #fff; margin-left: 5px"
                          >到：</span
                        >
                        <el-select
                          v-model="disinfectionRoomSelectedTo"
                          placeholder="灭"
                          size="mini"
                          :disabled="
                            isDisinfectionExecuting ||
                            (controlMode === 'mse' && isModeExecuting)
                          "
                        >
                          <el-option label="A" value="A"></el-option>
                          <el-option label="B" value="B"></el-option>
                          <el-option label="C" value="C"></el-option>
                          <el-option label="D" value="D"></el-option>
                          <el-option label="E" value="E"></el-option>
                          <el-option label="F" value="F"></el-option>
                          <el-option label="G" value="G"></el-option>
                        </el-select>
                      </div>
                      <el-button
                        type="primary"
                        size="mini"
                        style="width: 100%"
                        @click="handleDisinfectionRoomExecute"
                        :disabled="
                          isDisinfectionExecuting ||
                          (controlMode === 'mse' && isModeExecuting)
                        "
                        >执行</el-button
                      >
                      <span
                        v-if="isDisinfectionExecuting"
                        style="
                          color: orange;
                          margin-left: 10px;
                          font-size: 12px;
                        "
                        >执行中...</span
                      >
                      <el-button
                        v-if="isDisinfectionExecuting"
                        type="danger"
                        size="mini"
                        @click="cancelDisinfectionExecute"
                        :disabled="controlMode === 'mse' && isModeExecuting"
                      >
                        取消
                      </el-button>
                    </div>
                  </div>
                </div>
                <div class="preheating-room-marker" data-x="1400" data-y="590">
                  <div class="preheating-room-content">
                    <div class="preheating-room-header">出库选择</div>
                    <div class="preheating-room-body">
                      <el-select
                        v-model="outboundSelectedQueue"
                        placeholder="选择"
                        size="mini"
                        :disabled="
                          isOutboundExecuting ||
                          (controlMode === 'mse' && isModeExecuting)
                        "
                      >
                        <el-option label="A" value="A"></el-option>
                        <el-option label="B" value="B"></el-option>
                        <el-option label="C" value="C"></el-option>
                        <el-option label="D" value="D"></el-option>
                        <el-option label="E" value="E"></el-option>
                        <el-option label="F" value="F"></el-option>
                        <el-option label="G" value="G"></el-option>
                      </el-select>
                      <el-button
                        type="primary"
                        size="mini"
                        @click="handleOutboundExecute"
                        :disabled="controlMode === 'mse' && isModeExecuting"
                        >执行</el-button
                      >
                      <span
                        v-if="isOutboundExecuting"
                        style="
                          color: orange;
                          margin-left: 10px;
                          font-size: 12px;
                        "
                        >执行中...</span
                      >
                      <el-button
                        v-if="isOutboundExecuting"
                        type="danger"
                        size="mini"
                        @click="cancelOutboundExecute"
                        :disabled="controlMode === 'mse' && isModeExecuting"
                      >
                        取消
                      </el-button>
                    </div>
                  </div>
                </div>
                <div
                  class="preheating-room-marker"
                  data-x="1700"
                  data-y="70"
                  style="width: 100px"
                >
                  <div class="preheating-room-content">
                    <div class="preheating-room-header">目的地选择</div>
                    <div class="preheating-room-body">
                      <el-select
                        v-model="destinationSelected"
                        placeholder="选择"
                        size="mini"
                        :disabled="controlMode === 'mse' && isModeExecuting"
                      >
                        <el-option label="一楼" value="1"></el-option>
                        <el-option label="解析" value="2"></el-option>
                        <el-option label="立库" value="3"></el-option>
                      </el-select>
                      <div class="nocode-outbound-checkbox">
                        <el-checkbox
                          v-model="nocodeOutboundEnabled"
                          size="mini"
                          @change="handleNocodeOutboundChange"
                        >
                          无码下货模式
                        </el-checkbox>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 右侧区域 -->
          <div class="floor-right" style="width: 415px">
            <!-- 右上区域 -->
            <div class="floor-right-top">
              <div class="floor-title">
                <i class="el-icon-office-building"></i> 二楼区域
              </div>
              <div class="floor-image-container">
                <div class="image-wrapper">
                  <img
                    src="@/assets/floor2.webp"
                    alt="二楼平面图"
                    class="floor-image"
                    loading="eager"
                    decoding="async"
                    @load="updateMarkerPositions"
                  />
                  <!-- 二楼区域上货点信息-上部分 -->
                  <div class="marker-with-panel" data-x="500" data-y="752">
                    <div class="pulse"></div>
                    <div
                      class="data-panel"
                      style="padding: 4px 12px; width: 140px"
                      :class="['position-left', { 'always-show': true }]"
                    >
                      <div class="data-panel-content">
                        <div class="data-panel-row">
                          <span class="data-panel-label">2A 扫码信息：</span>
                          <span>{{ floor2ALineTrayInfo || '--' }}</span>
                        </div>
                        <div
                          class="data-panel-row"
                          v-if="
                            currentOrder &&
                            currentOrder.qrCode &&
                            floor2ALineTrayInfo &&
                            currentOrder.qrCode.includes(floor2ALineTrayInfo)
                          "
                        >
                          <span>
                            <i
                              class="el-icon-success"
                              style="color: #67c23a"
                            ></i>
                            <span
                              class="data-panel-label"
                              style="color: #67c23a; font-weight: bold"
                              >运行订单信息包含</span
                            >
                          </span>
                        </div>
                        <!-- 无码模式下显示复选框 -->
                        <div
                          v-if="controlMode === 'nocode' && isModeExecuting"
                          class="data-panel-row nocode-checkbox-row"
                        >
                          <span class="data-panel-label">允许上货：</span>
                          <el-checkbox
                            v-model="nocodeFloor2AEnabled"
                            @change="handleNocodeFloor2AChange"
                            size="mini"
                          >
                          </el-checkbox>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 二楼区域上货点信息-下部分 -->
                  <div class="marker-with-panel" data-x="500" data-y="610">
                    <div class="pulse"></div>
                    <div
                      class="data-panel"
                      style="padding: 4px 12px; width: 140px"
                      :class="['position-left', { 'always-show': true }]"
                    >
                      <div class="data-panel-content">
                        <div class="data-panel-row">
                          <span class="data-panel-label">2B 扫码信息：</span>
                          <span>{{ floor2BLineTrayInfo || '--' }}</span>
                        </div>
                        <div
                          class="data-panel-row"
                          v-if="
                            currentOrder &&
                            currentOrder.qrCode &&
                            floor2BLineTrayInfo &&
                            currentOrder.qrCode.includes(floor2BLineTrayInfo)
                          "
                        >
                          <span>
                            <i
                              class="el-icon-success"
                              style="color: #67c23a"
                            ></i>
                            <span
                              class="data-panel-label"
                              style="color: #67c23a; font-weight: bold"
                              >运行订单信息包含</span
                            >
                          </span>
                        </div>
                        <!-- 无码模式下显示复选框 -->
                        <div
                          v-if="controlMode === 'nocode' && isModeExecuting"
                          class="data-panel-row nocode-checkbox-row"
                        >
                          <span class="data-panel-label">允许上货：</span>
                          <el-checkbox
                            v-model="nocodeFloor2BEnabled"
                            @change="handleNocodeFloor2BChange"
                            size="mini"
                          >
                          </el-checkbox>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 二楼区域上货点信息-中间部分-允许2楼A/B上货 -->
                  <div
                    class="marker-with-panel"
                    data-x="620"
                    data-y="502"
                    v-show="currentOrder && currentOrder.inPut === '2'"
                  >
                    <div class="pulse"></div>
                    <div
                      class="data-panel"
                      style="padding: 4px 12px; width: 140px"
                      :class="['position-left', { 'always-show': true }]"
                    >
                      <div class="data-panel-content">
                        <div class="data-panel-row" style="margin-bottom: 0px">
                          <span>
                            <i
                              class="el-icon-success"
                              style="color: #67c23a"
                            ></i>
                            <span
                              class="data-panel-label"
                              style="color: #67c23a; font-weight: bold"
                              >允许2楼A/B上货</span
                            >
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 入库区光电点位显示 -->
                  <div
                    class="marker label-top"
                    :class="{
                      scanning: inLoadPhotoelectricSignal.bit8 === '1'
                    }"
                    data-x="530"
                    data-y="780"
                    @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit8')"
                  >
                    <div class="marker-label">提升机1二层检测B</div>
                  </div>
                  <div
                    class="marker label-top"
                    :class="{
                      scanning: inLoadPhotoelectricSignal.bit9 === '1'
                    }"
                    data-x="580"
                    data-y="780"
                    @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit9')"
                  >
                    <div class="marker-label">提升机1二层检测A</div>
                  </div>
                  <div
                    class="marker label-top"
                    :class="{
                      scanning: inLoadPhotoelectricSignal.bit12 === '1'
                    }"
                    data-x="530"
                    data-y="640"
                    @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit12')"
                  >
                    <div class="marker-label">提升机2二层检测B</div>
                  </div>
                  <div
                    class="marker label-top"
                    :class="{
                      scanning: inLoadPhotoelectricSignal.bit13 === '1'
                    }"
                    data-x="580"
                    data-y="640"
                    @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit13')"
                  >
                    <div class="marker-label">提升机2二层检测A</div>
                  </div>
                  <!-- 入库电机运行信号 -->
                  <div
                    class="motor-marker label-top"
                    :class="{ running: inLoadMotorRunning.bit7 === '1' }"
                    data-x="553"
                    data-y="760"
                    @click="toggleBitValue(inLoadMotorRunning, 'bit7')"
                  >
                    <div class="marker-label">S-8#</div>
                  </div>
                  <div
                    class="motor-marker label-top"
                    :class="{ running: inLoadMotorRunning.bit9 === '1' }"
                    data-x="553"
                    data-y="625"
                    @click="toggleBitValue(inLoadMotorRunning, 'bit9')"
                  >
                    <div class="marker-label">S-10#</div>
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
                  <img
                    src="@/assets/floor3.webp"
                    alt="三楼平面图"
                    class="floor-image"
                    loading="eager"
                    decoding="async"
                    @load="updateMarkerPositions"
                  />
                  <!-- 三楼区域上货点信息-上部分 -->
                  <div class="marker-with-panel" data-x="580" data-y="560">
                    <div class="pulse"></div>
                    <div
                      class="data-panel"
                      style="padding: 4px 12px; width: 140px"
                      :class="['position-left', { 'always-show': true }]"
                    >
                      <div class="data-panel-content">
                        <div class="data-panel-row">
                          <span class="data-panel-label">3A 扫码信息：</span>
                          <span>{{ floor3ALineTrayInfo || '--' }}</span>
                        </div>
                        <div
                          class="data-panel-row"
                          v-if="
                            currentOrder &&
                            currentOrder.qrCode &&
                            floor3ALineTrayInfo &&
                            currentOrder.qrCode.includes(floor3ALineTrayInfo)
                          "
                        >
                          <span>
                            <i
                              class="el-icon-success"
                              style="color: #67c23a"
                            ></i>
                            <span
                              class="data-panel-label"
                              style="color: #67c23a; font-weight: bold"
                              >运行订单信息包含</span
                            >
                          </span>
                        </div>
                        <!-- 无码模式下显示复选框 -->
                        <div
                          v-if="controlMode === 'nocode' && isModeExecuting"
                          class="data-panel-row nocode-checkbox-row"
                        >
                          <span class="data-panel-label">允许上货：</span>
                          <el-checkbox
                            v-model="nocodeFloor3AEnabled"
                            @change="handleNocodeFloor3AChange"
                            size="mini"
                          >
                          </el-checkbox>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 三楼区域上货点信息-下部分 -->
                  <div class="marker-with-panel" data-x="580" data-y="270">
                    <div class="pulse"></div>
                    <div
                      class="data-panel"
                      style="padding: 4px 12px; width: 140px"
                      :class="['position-left', { 'always-show': true }]"
                    >
                      <div class="data-panel-content">
                        <div class="data-panel-row">
                          <span class="data-panel-label">3B 扫码信息：</span>
                          <span>{{ floor3BLineTrayInfo || '--' }}</span>
                        </div>
                        <div
                          class="data-panel-row"
                          v-if="
                            currentOrder &&
                            currentOrder.qrCode &&
                            floor3BLineTrayInfo &&
                            currentOrder.qrCode.includes(floor3BLineTrayInfo)
                          "
                        >
                          <span>
                            <i
                              class="el-icon-success"
                              style="color: #67c23a"
                            ></i>
                            <span
                              class="data-panel-label"
                              style="color: #67c23a; font-weight: bold"
                              >运行订单信息包含</span
                            >
                          </span>
                        </div>
                        <!-- 无码模式下显示复选框 -->
                        <div
                          v-if="controlMode === 'nocode' && isModeExecuting"
                          class="data-panel-row nocode-checkbox-row"
                        >
                          <span class="data-panel-label">允许上货：</span>
                          <el-checkbox
                            v-model="nocodeFloor3BEnabled"
                            @change="handleNocodeFloor3BChange"
                            size="mini"
                          >
                          </el-checkbox>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 三楼区域上货点信息-中间部分-允许3楼A/B上货 -->
                  <div
                    class="marker-with-panel"
                    data-x="650"
                    data-y="415"
                    v-show="currentOrder && currentOrder.inPut === '3'"
                  >
                    <div class="pulse"></div>
                    <div
                      class="data-panel"
                      style="padding: 4px 12px; width: 140px"
                      :class="['position-left', { 'always-show': true }]"
                    >
                      <div class="data-panel-content">
                        <div class="data-panel-row" style="margin-bottom: 0px">
                          <span>
                            <i
                              class="el-icon-success"
                              style="color: #67c23a"
                            ></i>
                            <span
                              class="data-panel-label"
                              style="color: #67c23a; font-weight: bold"
                              >允许3楼A/B上货</span
                            >
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 入库区光电点位显示 -->
                  <div
                    class="marker label-top"
                    :class="{
                      scanning: inLoadPhotoelectricSignal.bit10 === '1'
                    }"
                    data-x="560"
                    data-y="500"
                    @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit10')"
                  >
                    <div class="marker-label">提升机1三层检测B</div>
                  </div>
                  <div
                    class="marker label-top"
                    :class="{
                      scanning: inLoadPhotoelectricSignal.bit11 === '1'
                    }"
                    data-x="610"
                    data-y="500"
                    @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit11')"
                  >
                    <div class="marker-label">提升机1三层检测A</div>
                  </div>
                  <div
                    class="marker label-top"
                    :class="{
                      scanning: inLoadPhotoelectricSignal.bit14 === '1'
                    }"
                    data-x="560"
                    data-y="355"
                    @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit14')"
                  >
                    <div class="marker-label">提升机2三层检测B</div>
                  </div>
                  <div
                    class="marker label-top"
                    :class="{
                      scanning: inLoadPhotoelectricSignal.bit15 === '1'
                    }"
                    data-x="610"
                    data-y="355"
                    @click="toggleBitValue(inLoadPhotoelectricSignal, 'bit15')"
                  >
                    <div class="marker-label">提升机2三层检测A</div>
                  </div>
                  <!-- 入库电机运行信号 -->
                  <div
                    class="motor-marker label-top"
                    :class="{ running: inLoadMotorRunning.bit8 === '1' }"
                    data-x="583"
                    data-y="478"
                    @click="toggleBitValue(inLoadMotorRunning, 'bit8')"
                  >
                    <div class="marker-label">S-9#</div>
                  </div>
                  <div
                    class="motor-marker label-top"
                    :class="{ running: inLoadMotorRunning.bit10 === '1' }"
                    data-x="583"
                    data-y="340"
                    @click="toggleBitValue(inLoadMotorRunning, 'bit10')"
                  >
                    <div class="marker-label">S-11#</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧队列信息区 -->
    <div
      class="side-info-panel-queue"
      :style="{ width: isQueueExpanded ? '800px' : 'auto' }"
    >
      <!-- 队列信息区域 -->
      <div class="queue-section" :class="{ expanded: isQueueExpanded }">
        <div class="section-header" @click="changeQueueExpanded">
          <template v-if="isQueueExpanded">
            <span><i class="el-icon-s-data"></i> 队列信息</span>
            <span
              class="arrow-icon"
              :class="{ 'expanded-arrow': isQueueExpanded }"
              >▼</span
            >
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
                <span class="queue-name">{{ queue.queueName }}</span>
                <span class="tray-count">{{
                  queue.trayInfo?.length || 0
                }}</span>
              </div>
            </div>

            <!-- 右侧托盘列表 -->
            <div class="queue-container-right">
              <div class="selected-queue-header" v-if="selectedQueue">
                <h3>{{ selectedQueue.queueName }}</h3>
                <div class="queue-header-actions">
                  <el-button
                    type="primary"
                    size="small"
                    @click="showAddTrayDialog"
                    :disabled="!selectedQueue"
                    icon="el-icon-plus"
                  >
                    添加托盘
                  </el-button>
                  <span class="tray-total"
                    >托盘数量: {{ selectedQueue.trayInfo?.length || 0 }}</span
                  >
                </div>
              </div>
              <div class="tray-list">
                <template v-if="nowTrays && nowTrays.length > 0">
                  <div
                    v-for="tray in nowTrays"
                    :key="tray.id"
                    class="tray-item"
                    :class="{
                      dragging: isDragging && draggedTray?.id === tray.id
                    }"
                    draggable="true"
                    @dragstart="
                      handleDragStart($event, tray, selectedQueueIndex)
                    "
                    @dragend="handleDragEnd"
                  >
                    <div class="tray-info">
                      <div class="tray-info-row">
                        <span class="tray-name">{{ tray.name }}</span>
                        <span class="tray-batch"
                          >批次id：{{ tray.batchId }} / 订单id：{{
                            tray.orderId
                          }}</span
                        >
                      </div>
                      <div class="tray-info-row name-spec-row">
                        <div class="name-spec-item">
                          <span class="data-panel-label">名称：</span>
                          <span>{{ tray.productName || '--' }}</span>
                        </div>
                        <div class="name-spec-item">
                          <span class="data-panel-label">规格：</span>
                          <span>{{ tray.spec || '--' }}</span>
                        </div>
                      </div>
                      <div class="tray-info-row status-row">
                        <span>预热房：{{ tray.isPrint1 }}</span>
                        <span>灭菌房：{{ tray.isPrint2 }}</span>
                        <span>预热命令：{{ tray.hasSentPreheatCommand }}</span>
                      </div>
                      <!-- 下货区队列的时间信息 -->
                      <div
                        v-if="selectedQueueIndex === 22 && tray.entryTime"
                        class="tray-info-row status-row"
                      >
                        <span>进入：{{ tray.entryTime }}</span>
                        <span>解绑：{{ tray.autoUnbindTime }}</span>
                      </div>
                      <span class="tray-time">{{ tray.time }}</span>
                    </div>
                    <el-button
                      type="danger"
                      size="mini"
                      icon="el-icon-delete"
                      circle
                      @click.stop="deleteTray(tray)"
                    ></el-button>
                  </div>
                </template>
                <div v-else class="empty-state">
                  <i class="el-icon-box"></i>
                  <p>暂无托盘信息</p>
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
      <div class="test-panel" :class="{ collapsed: !showTestPanel }">
        <div class="test-panel-header">
          <span>测试面板</span>
          <i class="el-icon-close" @click.stop="showTestPanel = false"></i>
        </div>
        <div class="test-panel-content">
          <div class="test-section">
            <span class="test-label">小车位置测试:</span>
            <div class="cart-position-test-container">
              <div class="cart-position-group">
                <div class="cart-position-label">
                  <span>小车1 (5670-19190):</span>
                  <span class="cart-value">{{ cartPositionValues.cart1 }}</span>
                </div>
                <div class="cart-position-slider-container">
                  <el-slider
                    v-model="cartPositionValues.cart1"
                    :min="5670"
                    :max="19190"
                    :step="1"
                    class="cart-position-slider"
                  ></el-slider>
                </div>
              </div>
              <div class="cart-position-group">
                <div class="cart-position-label">
                  <span>小车2 (5820-16990):</span>
                  <span class="cart-value">{{ cartPositionValues.cart2 }}</span>
                </div>
                <div class="cart-position-slider-container">
                  <el-slider
                    v-model="cartPositionValues.cart2"
                    :min="5820"
                    :max="16990"
                    :step="1"
                    class="cart-position-slider"
                  ></el-slider>
                </div>
              </div>
              <div class="cart-position-group">
                <div class="cart-position-label">
                  <span>小车3 (5830-17020):</span>
                  <span class="cart-value">{{ cartPositionValues.cart3 }}</span>
                </div>
                <div class="cart-position-slider-container">
                  <el-slider
                    v-model="cartPositionValues.cart3"
                    :min="5830"
                    :max="17020"
                    :step="1"
                    class="cart-position-slider"
                  ></el-slider>
                </div>
              </div>
            </div>
          </div>
          <!-- 添加扫码测试部分 -->
          <div class="test-section">
            <span class="test-label">扫码信息测试:</span>
            <div class="qrcode-test-container">
              <div class="qrcode-input-group">
                <div class="qrcode-label">二楼A点位:</div>
                <el-input
                  v-model="floor2ALineTrayInfo"
                  size="small"
                  placeholder="输入扫码信息"
                  class="qrcode-input"
                ></el-input>
              </div>
              <div class="qrcode-input-group">
                <div class="qrcode-label">二楼B点位:</div>
                <el-input
                  v-model="floor2BLineTrayInfo"
                  size="small"
                  placeholder="输入扫码信息"
                  class="qrcode-input"
                ></el-input>
              </div>
              <div class="qrcode-input-group">
                <div class="qrcode-label">三楼A点位:</div>
                <el-input
                  v-model="floor3ALineTrayInfo"
                  size="small"
                  placeholder="输入扫码信息"
                  class="qrcode-input"
                ></el-input>
              </div>
              <div class="qrcode-input-group">
                <div class="qrcode-label">三楼B点位:</div>
                <el-input
                  v-model="floor3BLineTrayInfo"
                  size="small"
                  placeholder="输入扫码信息"
                  class="qrcode-input"
                ></el-input>
              </div>
              <div class="qrcode-input-group">
                <div class="qrcode-label">上货点扫码:</div>
                <el-input
                  v-model="floor1InLineTrayInfo"
                  size="small"
                  placeholder="输入扫码信息"
                  class="qrcode-input"
                ></el-input>
              </div>
              <div class="qrcode-input-group">
                <div class="qrcode-label">上货扫码信息:</div>
                <el-input
                  v-model="floor1UpLineTrayInfo"
                  size="small"
                  placeholder="输入扫码信息"
                  class="qrcode-input"
                ></el-input>
              </div>
              <div class="qrcode-input-group">
                <div class="qrcode-label">下货扫码信息:</div>
                <el-input
                  v-model="floor1OutLineTrayInfo"
                  size="small"
                  placeholder="输入下货扫码信息"
                  class="qrcode-input"
                ></el-input>
              </div>
              <div class="qrcode-actions">
                <el-button type="primary" size="small" @click="clearAllQrCodes"
                  >清空所有</el-button
                >
              </div>
            </div>
          </div>
          <!-- 添加光电信号测试部分 -->
          <div class="test-section">
            <span class="test-label">光电信号测试:</span>
            <div class="photoelectric-test-container">
              <div class="photoelectric-buttons">
                <el-button
                  type="primary"
                  size="small"
                  @click="triggerPhotoelectricSignal('bit0')"
                  :loading="photoelectricLoading.bit0"
                >
                  一楼接货站台光电
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="triggerPhotoelectricSignal('bit1')"
                  :loading="photoelectricLoading.bit1"
                >
                  一楼上货区光电
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="triggerPhotoelectricSignal('bit2')"
                  :loading="photoelectricLoading.bit2"
                >
                  二楼A接货光电
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="triggerPhotoelectricSignal('bit3')"
                  :loading="photoelectricLoading.bit3"
                >
                  二楼B接货光电
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="triggerPhotoelectricSignal('bit4')"
                  :loading="photoelectricLoading.bit4"
                >
                  三楼A接货光电
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="triggerPhotoelectricSignal('bit5')"
                  :loading="photoelectricLoading.bit5"
                >
                  三楼B接货光电
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="triggerPhotoelectricSignal('bit6')"
                  :loading="photoelectricLoading.bit6"
                >
                  下线扫码处光电
                </el-button>
              </div>
            </div>
          </div>
          <!-- 添加预热房前缓存线请求目的地测试部分 -->
          <div class="test-section">
            <span class="test-label">预热房前缓存线请求目的地测试:</span>
            <div class="request-destination-test-container">
              <div class="request-destination-buttons">
                <el-button
                  type="primary"
                  size="small"
                  @click="triggerRequestDestination"
                  :loading="isRequestDestinationLoading"
                >
                  触发预热房前缓存线请求目的地
                </el-button>
              </div>
            </div>
          </div>
          <!-- 添加预热完成信号测试 -->
          <div class="test-section">
            <span class="test-label">预热完成信号测试:</span>
            <div class="signal-test-container">
              <div class="signal-test-buttons">
                <el-button
                  v-for="room in ['A', 'B', 'C', 'D', 'E', 'F', 'G']"
                  :key="'preheat-' + room"
                  type="success"
                  size="small"
                  @click="togglePreheatingComplete(room)"
                >
                  预热房{{ room }}完成
                </el-button>
              </div>
            </div>
          </div>
          <!-- 添加灭菌完成信号测试 -->
          <div class="test-section">
            <span class="test-label">灭菌完成信号测试:</span>
            <div class="signal-test-container">
              <div class="signal-test-buttons">
                <el-button
                  v-for="room in ['A', 'B', 'C', 'D', 'E', 'F', 'G']"
                  :key="'sterilize-' + room"
                  type="warning"
                  size="small"
                  @click="toggleSterilizationComplete(room)"
                >
                  灭菌柜{{ room }}完成
                </el-button>
              </div>
            </div>
          </div>
          <!-- 添加预热→灭菌完成信号测试 -->
          <div class="test-section">
            <span class="test-label">预热→灭菌完成信号测试:</span>
            <div class="signal-test-container">
              <div class="signal-test-buttons">
                <el-button
                  type="danger"
                  size="small"
                  @click="triggerPreheatingCompletedSignal"
                  :loading="isPreheatingCompletedLoading"
                >
                  触发预热→灭菌完成信号
                </el-button>
              </div>
            </div>
          </div>
          <!-- 添加队列数量手动操作测试部分 -->
          <div class="test-section">
            <span class="test-label">队列数量手动操作测试:</span>
            <div class="queue-quantity-test-container">
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">A1队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ aLineQuantity.a1 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="aLineQuantity.a1++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      aLineQuantity.a1 = Math.max(0, aLineQuantity.a1 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">B1队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ bLineQuantity.b1 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="bLineQuantity.b1++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      bLineQuantity.b1 = Math.max(0, bLineQuantity.b1 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">C1队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ cLineQuantity.c1 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="cLineQuantity.c1++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      cLineQuantity.c1 = Math.max(0, cLineQuantity.c1 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">D1队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ dLineQuantity.d1 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="dLineQuantity.d1++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      dLineQuantity.d1 = Math.max(0, dLineQuantity.d1 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">E1队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ eLineQuantity.e1 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="eLineQuantity.e1++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      eLineQuantity.e1 = Math.max(0, eLineQuantity.e1 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">F1队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ fLineQuantity.f1 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="fLineQuantity.f1++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      fLineQuantity.f1 = Math.max(0, fLineQuantity.f1 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">G1队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ gLineQuantity.g1 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="gLineQuantity.g1++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      gLineQuantity.g1 = Math.max(0, gLineQuantity.g1 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">A2队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ aLineQuantity.a2 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="aLineQuantity.a2++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      aLineQuantity.a2 = Math.max(0, aLineQuantity.a2 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">B2队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ bLineQuantity.b2 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="bLineQuantity.b2++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      bLineQuantity.b2 = Math.max(0, bLineQuantity.b2 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">C2队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ cLineQuantity.c2 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="cLineQuantity.c2++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      cLineQuantity.c2 = Math.max(0, cLineQuantity.c2 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">D2队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ dLineQuantity.d2 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="dLineQuantity.d2++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      dLineQuantity.d2 = Math.max(0, dLineQuantity.d2 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">E2队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ eLineQuantity.e2 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="eLineQuantity.e2++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      eLineQuantity.e2 = Math.max(0, eLineQuantity.e2 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">F2队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ fLineQuantity.f2 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="fLineQuantity.f2++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      fLineQuantity.f2 = Math.max(0, fLineQuantity.f2 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">G2队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ gLineQuantity.g2 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="gLineQuantity.g2++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      gLineQuantity.g2 = Math.max(0, gLineQuantity.g2 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">A3队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ aLineQuantity.a3 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="aLineQuantity.a3++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      aLineQuantity.a3 = Math.max(0, aLineQuantity.a3 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">B3队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ bLineQuantity.b3 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="bLineQuantity.b3++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      bLineQuantity.b3 = Math.max(0, bLineQuantity.b3 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">C3队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ cLineQuantity.c3 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="cLineQuantity.c3++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      cLineQuantity.c3 = Math.max(0, cLineQuantity.c3 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">D3队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ dLineQuantity.d3 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="dLineQuantity.d3++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      dLineQuantity.d3 = Math.max(0, dLineQuantity.d3 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">E3队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ eLineQuantity.e3 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="eLineQuantity.e3++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      eLineQuantity.e3 = Math.max(0, eLineQuantity.e3 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">F3队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ fLineQuantity.f3 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="fLineQuantity.f3++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      fLineQuantity.f3 = Math.max(0, fLineQuantity.f3 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-group">
                <div class="queue-quantity-label">G3队列数量:</div>
                <div class="queue-quantity-controls">
                  <span class="quantity-display">{{ gLineQuantity.g3 }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="gLineQuantity.g3++"
                    style="margin-left: 5px"
                  >
                    +
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="
                      gLineQuantity.g3 = Math.max(0, gLineQuantity.g3 - 1)
                    "
                    style="margin-left: 5px"
                  >
                    -
                  </el-button>
                </div>
              </div>
              <div class="queue-quantity-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="resetAllQueueQuantities"
                >
                  重置所有数量
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 历史订单对话框 -->
    <el-dialog
      title="历史订单"
      :visible.sync="historyDialogVisible"
      width="70%"
      append-to-body
      :before-close="handleHistoryDialogClose"
    >
      <div>
        <el-table :data="historyOrders" style="width: 100%" border stripe>
          <el-table-column prop="orderId" label="订单编号" width="180" />
          <el-table-column prop="batchId" label="订单批号" width="180" />
          <el-table-column prop="insertTime" label="订单时间" width="180" />
          <el-table-column prop="productName" label="产品名称" width="180" />
          <el-table-column prop="isPrint1" label="指定预热房" width="100" />
          <el-table-column prop="isPrint2" label="指定灭菌柜" width="100" />
          <el-table-column prop="isPrint3" label="指定输出" width="100">
            <template slot-scope="scope">
              {{ getOutputText(scope.row.isPrint3) }}
            </template>
          </el-table-column>
          <el-table-column prop="inPut" label="进货口信息" width="100">
            <template slot-scope="scope">
              {{ getInputText(scope.row.inPut) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="qrCode"
            label="托盘信息"
            min-width="200"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div
                style="
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                {{ scope.row.qrCode }}
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div
          class="pagination-container"
          style="margin-top: 20px; text-align: right"
        >
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalHistoryOrders"
          >
          </el-pagination>
        </div>
      </div>
    </el-dialog>

    <!-- 添加托盘对话框 -->
    <el-dialog
      :title="`添加托盘 - ${selectedQueue ? selectedQueue.queueName : ''}`"
      :visible.sync="addTrayDialogVisible"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
      @close="cancelAddTray"
    >
      <div class="add-tray-form">
        <!-- 提示信息 -->
        <div
          class="form-tips"
          v-if="
            isCacheQueueAdd && !(isModeExecuting && controlMode === 'nocode')
          "
          style="margin-bottom: 10px"
        >
          <el-alert
            title="缓存区托盘添加"
            description="当前为缓存区添加托盘，系统将自动获取当前运行订单的信息，您只需填写托盘编号。"
            type="warning"
            :closable="false"
            show-icon
          />
        </div>
        <div
          class="form-tips"
          v-if="isCacheQueueAdd && isModeExecuting && controlMode === 'nocode'"
          style="margin-bottom: 10px"
        >
          <el-alert
            title="无码模式缓存区托盘添加"
            description="当前为无码模式下的缓存区托盘添加，请填写完整的托盘信息。"
            type="warning"
            :closable="false"
            show-icon
          />
        </div>
        <div
          class="form-tips"
          v-if="!isCacheQueueAdd"
          style="margin-bottom: 10px"
        >
          <el-alert
            title="非缓存区托盘添加"
            description="当前为非缓存区添加托盘，请填写完整的托盘信息。"
            type="warning"
            :closable="false"
            show-icon
          />
        </div>

        <el-form
          :model="newTrayForm"
          ref="newTrayForm"
          label-width="120px"
          :rules="trayFormRules"
        >
          <el-form-item label="托盘编号" prop="trayCode">
            <el-input
              v-model="newTrayForm.trayCode"
              placeholder="请输入托盘编号"
            ></el-input>
          </el-form-item>
          <el-form-item
            label="批次号"
            prop="batchId"
            v-if="
              !isCacheQueueAdd || (isModeExecuting && controlMode === 'nocode')
            "
          >
            <el-input
              v-model="newTrayForm.batchId"
              placeholder="请输入批次号"
            ></el-input>
          </el-form-item>
          <el-form-item label="批次号" v-else>
            <el-input
              v-model="newTrayForm.batchId"
              placeholder="自动获取当前订单批次号"
              disabled
            ></el-input>
          </el-form-item>
          <el-form-item
            label="订单号"
            prop="orderId"
            v-if="
              !isCacheQueueAdd || (isModeExecuting && controlMode === 'nocode')
            "
          >
            <el-input
              v-model="newTrayForm.orderId"
              placeholder="请输入订单号"
            ></el-input>
          </el-form-item>
          <el-form-item label="订单号" v-else>
            <el-input
              v-model="newTrayForm.orderId"
              placeholder="自动获取当前订单号"
              disabled
            ></el-input>
          </el-form-item>
          <el-form-item
            label="指定预热房"
            prop="isPrint1"
            v-if="
              !isCacheQueueAdd || (isModeExecuting && controlMode === 'nocode')
            "
          >
            <el-select
              v-model="newTrayForm.isPrint1"
              placeholder="请选择指定预热房"
              style="width: 100%"
            >
              <el-option label="A" value="A"></el-option>
              <el-option label="B" value="B"></el-option>
              <el-option label="C" value="C"></el-option>
              <el-option label="D" value="D"></el-option>
              <el-option label="E" value="E"></el-option>
              <el-option label="F" value="F"></el-option>
              <el-option label="G" value="G"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="指定预热房" v-else>
            <el-input
              v-model="newTrayForm.isPrint1"
              placeholder="自动获取当前订单预热房"
              disabled
            ></el-input>
          </el-form-item>
          <el-form-item
            label="指定灭菌柜"
            prop="isPrint2"
            v-if="
              !isCacheQueueAdd || (isModeExecuting && controlMode === 'nocode')
            "
          >
            <el-select
              v-model="newTrayForm.isPrint2"
              placeholder="请选择指定灭菌柜"
              style="width: 100%"
            >
              <el-option label="A" value="A"></el-option>
              <el-option label="B" value="B"></el-option>
              <el-option label="C" value="C"></el-option>
              <el-option label="D" value="D"></el-option>
              <el-option label="E" value="E"></el-option>
              <el-option label="F" value="F"></el-option>
              <el-option label="G" value="G"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="指定灭菌柜" v-else>
            <el-input
              v-model="newTrayForm.isPrint2"
              placeholder="自动获取当前订单灭菌柜"
              disabled
            ></el-input>
          </el-form-item>
          <el-form-item
            label="产品名称"
            prop="productName"
            v-if="
              !isCacheQueueAdd || (isModeExecuting && controlMode === 'nocode')
            "
          >
            <el-input
              v-model="newTrayForm.productName"
              placeholder="请输入产品名称"
            ></el-input>
          </el-form-item>
          <el-form-item label="产品名称" v-else>
            <el-input
              v-model="newTrayForm.productName"
              placeholder="自动获取当前订单产品名称"
              disabled
            ></el-input>
          </el-form-item>
          <el-form-item
            label="产品编码"
            prop="productCode"
            v-if="
              !isCacheQueueAdd || (isModeExecuting && controlMode === 'nocode')
            "
          >
            <el-input
              v-model="newTrayForm.productCode"
              placeholder="请输入产品编码"
            ></el-input>
          </el-form-item>
          <el-form-item label="产品编码" v-else>
            <el-input
              v-model="newTrayForm.productCode"
              placeholder="自动获取当前订单产品编码"
              disabled
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddTray">取 消</el-button>
        <el-button type="primary" @click="submitAddTray" :loading="isSubmitting"
          >确 定</el-button
        >
      </div>
    </el-dialog>

    <!-- PDA连接状态弹窗 -->
    <el-dialog
      title="PDA连接状态"
      :visible.sync="mobileConnectionDialogVisible"
      width="80%"
      append-to-body
      :close-on-click-modal="false"
      custom-class="mobile-connection-dialog"
    >
      <div class="connection-status-header">
        <div class="server-status">
          <el-tag :type="wsServerStatus.isRunning ? 'success' : 'danger'">
            WebSocket服务器状态:
            {{ wsServerStatus.isRunning ? '运行中' : '已停止' }}
          </el-tag>
          <span class="server-info">端口: {{ wsServerStatus.port }}</span>
          <span class="server-info"
            >在线客户端: {{ mobileConnections.length }}</span
          >
        </div>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-refresh"
          @click="refreshMobileConnections"
          :loading="refreshingConnections"
        >
          刷新
        </el-button>
      </div>

      <el-table
        :data="mobileConnections"
        style="width: 100%; margin-top: 16px"
        :height="400"
        empty-text="暂无移动端连接"
      >
        <el-table-column prop="id" label="客户端ID" width="200" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="userAgent" label="设备信息" />
        <el-table-column prop="connectedAt" label="连接时间" width="180">
          <template slot-scope="scope">
            {{ formatTime(scope.row.connectedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastPing" label="最后心跳" width="180">
          <template slot-scope="scope">
            {{ formatTime(scope.row.lastPing) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === '在线' ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 新建订单弹窗 -->
    <el-dialog
      title="新建订单"
      :visible.sync="addOrderDialogVisible"
      width="1200px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
      class="add-order-dialog"
    >
      <div class="form-container">
        <el-form
          ref="newOrderForm"
          :model="newOrderForm"
          :rules="orderFormRules"
          label-width="150px"
          size="small"
        >
          <div class="form-row">
            <el-form-item label="生产总订单号" prop="orderId" class="form-item">
              <el-input
                v-model="newOrderForm.orderId"
                placeholder="请输入生产总订单号"
                maxlength="50"
              />
            </el-form-item>

            <el-form-item
              label="生产单批次订单ID"
              prop="batchId"
              class="form-item"
            >
              <el-input
                type="number"
                v-model="newOrderForm.batchId"
                placeholder="请输入批次订单ID"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="产品编号" prop="productCode" class="form-item">
              <el-input
                v-model="newOrderForm.productCode"
                placeholder="请输入产品编号"
                maxlength="50"
              />
            </el-form-item>
          </div>

          <div class="form-row">
            <el-form-item label="产品名称" prop="productName" class="form-item">
              <el-input
                v-model="newOrderForm.productName"
                placeholder="请输入产品名称"
                maxlength="100"
              />
            </el-form-item>

            <el-form-item label="指定预热房" prop="isPrint1" class="form-item">
              <el-select
                v-model="newOrderForm.isPrint1"
                placeholder="请选择预热房"
                style="width: 100%"
              >
                <el-option label="A" value="A" />
                <el-option label="B" value="B" />
                <el-option label="C" value="C" />
                <el-option label="D" value="D" />
                <el-option label="E" value="E" />
                <el-option label="F" value="F" />
                <el-option label="G" value="G" />
              </el-select>
            </el-form-item>

            <el-form-item label="指定灭菌柜" prop="isPrint2" class="form-item">
              <el-select
                v-model="newOrderForm.isPrint2"
                placeholder="请选择灭菌柜"
                style="width: 100%"
              >
                <el-option label="A" value="A" />
                <el-option label="B" value="B" />
                <el-option label="C" value="C" />
                <el-option label="D" value="D" />
                <el-option label="E" value="E" />
                <el-option label="F" value="F" />
                <el-option label="G" value="G" />
              </el-select>
            </el-form-item>
          </div>

          <div class="form-row">
            <el-form-item label="指定输出" prop="isPrint3" class="form-item">
              <el-select
                v-model="newOrderForm.isPrint3"
                placeholder="请选择输出"
                style="width: 100%"
              >
                <el-option label="不解析" value="0" />
                <el-option label="解析库" value="1" />
                <el-option label="立体库" value="2" />
              </el-select>
            </el-form-item>

            <el-form-item label="进货口指定" prop="inPut" class="form-item">
              <el-select
                v-model="newOrderForm.inPut"
                placeholder="请选择进货口"
                style="width: 100%"
              >
                <el-option label="一楼外部进货" value="1" />
                <el-option label="二楼进货" value="2" />
                <el-option label="三楼进货" value="3" />
                <el-option label="不解析出口" value="4" />
              </el-select>
            </el-form-item>

            <el-form-item label="规格" prop="spec" class="form-item">
              <el-input
                v-model="newOrderForm.spec"
                placeholder="请输入规格"
                maxlength="100"
              />
            </el-form-item>
          </div>

          <el-form-item label="托盘码" prop="qrCode" class="tray-codes-section">
            <div class="tray-codes-container">
              <div class="tray-input-section">
                <el-input
                  v-model="newOrderForm.currentTrayCode"
                  placeholder="请输入托盘码"
                  maxlength="50"
                  @keyup.enter="addTrayCode"
                />
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-plus"
                  @click="addTrayCode"
                  :disabled="!newOrderForm.currentTrayCode.trim()"
                >
                  添加
                </el-button>
              </div>

              <div
                class="tray-codes-display"
                v-if="newOrderForm.trayCodes.length > 0"
              >
                <div class="tray-codes-list">
                  <div
                    v-for="(code, index) in newOrderForm.trayCodes"
                    :key="index"
                    class="tray-code-tag"
                  >
                    <span class="tray-code-text">{{ code }}</span>
                    <el-button
                      type="text"
                      icon="el-icon-close"
                      @click="removeTrayCode(index)"
                      class="remove-btn"
                    />
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddOrder">取消</el-button>
        <el-button
          type="primary"
          @click="submitAddOrder"
          :loading="isSubmittingOrder"
        >
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import HttpUtil from '@/utils/HttpUtil';
import moment from 'moment';
import { ipcRenderer } from 'electron';
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
      runningLogs: [], // 修改为空数组
      alarmLogs: [], // 修改为空数组
      carts: [
        {
          id: 1,
          name: '小车1',
          x: 1395,
          y: 1740,
          width: 150,
          image: require('@/assets/cart.png')
        },
        {
          id: 2,
          name: '小车2',
          x: 1210,
          y: 795,
          width: 150,
          image: require('@/assets/cart.png')
        },
        {
          id: 3,
          name: '小车3',
          x: 1210,
          y: 226,
          width: 145,
          image: require('@/assets/cart.png')
        }
      ],
      queues: [
        {
          id: 1,
          queueName: '缓存区',
          trayInfo: []
        },
        {
          id: 2,
          queueName: 'A1',
          trayInfo: []
        },
        {
          id: 3,
          queueName: 'B1',
          trayInfo: []
        },
        {
          id: 4,
          queueName: 'C1',
          trayInfo: []
        },
        {
          id: 5,
          queueName: 'D1',
          trayInfo: []
        },
        {
          id: 6,
          queueName: 'E1',
          trayInfo: []
        },
        {
          id: 7,
          queueName: 'F1',
          trayInfo: []
        },
        {
          id: 8,
          queueName: 'G1',
          trayInfo: []
        },
        {
          id: 9,
          queueName: 'A2',
          trayInfo: []
        },
        {
          id: 10,
          queueName: 'B2',
          trayInfo: []
        },
        {
          id: 11,
          queueName: 'C2',
          trayInfo: []
        },
        {
          id: 12,
          queueName: 'D2',
          trayInfo: []
        },
        {
          id: 13,
          queueName: 'E2',
          trayInfo: []
        },
        {
          id: 14,
          queueName: 'F2',
          trayInfo: []
        },
        {
          id: 15,
          queueName: 'G2',
          trayInfo: []
        },
        {
          id: 16,
          queueName: 'A3',
          trayInfo: []
        },
        {
          id: 17,
          queueName: 'B3',
          trayInfo: []
        },
        {
          id: 18,
          queueName: 'C3',
          trayInfo: []
        },
        {
          id: 19,
          queueName: 'D3',
          trayInfo: []
        },
        {
          id: 20,
          queueName: 'E3',
          trayInfo: []
        },
        {
          id: 21,
          queueName: 'F3',
          trayInfo: []
        },
        {
          id: 22,
          queueName: 'G3',
          trayInfo: []
        },
        {
          id: 23,
          queueName: '下货区',
          trayInfo: []
        }
      ],
      nowTrays: [],
      draggedTray: null,
      dragSourceQueue: null,
      isQueueExpanded: false,
      selectedQueueIndex: 0,
      isDragging: false,
      isRefreshing: false,
      historyDialogVisible: false,
      historyOrders: [],
      currentPage: 1,
      pageSize: 10,
      totalHistoryOrders: 0,
      addTrayDialogVisible: false,
      // 新建订单相关
      addOrderDialogVisible: false,
      isSubmittingOrder: false,
      newOrderForm: {
        orderId: '',
        batchId: null,
        productCode: '',
        productName: '',
        isPrint1: '',
        isPrint2: '',
        isPrint3: '',
        inPut: '',
        spec: '',
        isManual: '1', // 默认手动
        currentTrayCode: '', // 当前输入的托盘码
        trayCodes: [] // 已添加的托盘码列表
      },
      orderFormRules: {
        orderId: [
          { required: true, message: '请输入生产总订单号', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        batchId: [
          { required: true, message: '请输入生产单批次订单ID', trigger: 'blur' }
        ],
        productCode: [
          { required: true, message: '请输入产品编号', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          {
            min: 1,
            max: 100,
            message: '长度在 1 到 100 个字符',
            trigger: 'blur'
          }
        ],
        isPrint1: [
          { required: true, message: '请选择指定预热房', trigger: 'change' }
        ],
        isPrint2: [
          { required: true, message: '请选择指定灭菌柜', trigger: 'change' }
        ],
        isPrint3: [
          { required: true, message: '请选择指定输出', trigger: 'change' }
        ],
        inPut: [
          { required: true, message: '请选择进货口指定', trigger: 'change' }
        ]
      },
      isSubmitting: false,
      isCacheQueueAdd: false,
      isRequestDestinationLoading: false,
      // WebSocket相关数据
      wsServerStatus: {
        isRunning: false,
        port: 8081
      },
      mobileConnectionDialogVisible: false,
      mobileConnections: [],
      refreshingConnections: false,
      newTrayForm: {
        trayCode: '',
        batchId: '',
        orderId: '',
        isPrint1: '',
        isPrint2: '',
        productName: '',
        productCode: ''
      },
      trayFormRules: {
        trayCode: [
          { required: true, message: '请输入托盘编号', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        batchId: [
          { required: true, message: '请输入批次号', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        orderId: [
          { required: true, message: '请输入订单号', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        isPrint1: [
          { required: true, message: '请选择指定预热房', trigger: 'change' }
        ],
        isPrint2: [
          { required: true, message: '请选择指定灭菌柜', trigger: 'change' }
        ],
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          {
            min: 1,
            max: 100,
            message: '长度在 1 到 100 个字符',
            trigger: 'blur'
          }
        ],
        productCode: [
          { required: true, message: '请输入产品编码', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ]
      },

      // 添加队列位置标识数据
      queueMarkers: [
        { id: 1, name: '缓存区', queueId: 1, x: 1485, y: 1620 },
        { id: 2, name: 'A1', queueId: 2, x: 1216, y: 1550 },
        { id: 3, name: 'B1', queueId: 3, x: 1083, y: 1550 },
        { id: 4, name: 'C1', queueId: 4, x: 905, y: 1550 },
        { id: 5, name: 'D1', queueId: 5, x: 778, y: 1550 },
        { id: 6, name: 'E1', queueId: 6, x: 608, y: 1550 },
        { id: 7, name: 'F1', queueId: 7, x: 480, y: 1550 },
        { id: 8, name: 'G1', queueId: 8, x: 321, y: 1550 },
        { id: 9, name: 'A2', queueId: 9, x: 1214, y: 980 },
        { id: 10, name: 'B2', queueId: 10, x: 1082, y: 980 },
        { id: 11, name: 'C2', queueId: 11, x: 905, y: 980 },
        { id: 12, name: 'D2', queueId: 12, x: 778, y: 980 },
        { id: 13, name: 'E2', queueId: 13, x: 612, y: 980 },
        { id: 14, name: 'F2', queueId: 14, x: 485, y: 980 },
        { id: 15, name: 'G2', queueId: 15, x: 328, y: 980 },
        { id: 16, name: 'A3', queueId: 16, x: 1214, y: 650 },
        { id: 17, name: 'B3', queueId: 17, x: 1082, y: 650 },
        { id: 18, name: 'C3', queueId: 18, x: 905, y: 650 },
        { id: 19, name: 'D3', queueId: 19, x: 778, y: 650 },
        { id: 20, name: 'E3', queueId: 20, x: 612, y: 650 },
        { id: 21, name: 'F3', queueId: 21, x: 484, y: 650 },
        { id: 22, name: 'G3', queueId: 22, x: 333, y: 650 },
        { id: 23, name: '下货区', queueId: 23, x: 1580, y: 220 }
      ],
      logId: 1000, // 添加一个日志ID计数器
      // 输送线当前运行状态-读取PLC
      conveyorStatus: '',
      // 允许进料反馈-读取PLC
      allowFeedBack: {
        bit0: '0', // 值为1时，全部接货口不允许进货
        bit1: '0', // 值为1时，一楼接货口允许进货；值为0时，不允许
        bit2: '0', // 值为1时，二楼1#接货口允许进货；值为0时，不允许
        bit3: '0', // 值为1时，二楼2#接货口允许进货；值为0时，不允许
        bit4: '0', // 值为1时，三楼1#接货口允许进货；值为0时，不允许
        bit5: '0' // 值为1时，三楼2#接货口允许进货；值为0时，不允许
      },
      // A线电机运行信号-读取PLC
      aLineMotorRunning: {
        bit0: '0', // A1-1#电机运行信号
        bit1: '0', // A1-2#电机运行信号
        bit2: '0', // A2-1#电机运行信号
        bit3: '0', // A2-2#电机运行信号
        bit4: '0', // A3-1#电机运行信号
        bit5: '0', // A3-2#电机运行信号
        bit6: '0', // A4-1#电机运行信号
        bit7: '0' // A4-2#电机运行信号
      },
      // A线光电检测信号-读取PLC
      aLinePhotoelectricSignal: {
        bit0: '0', // A-1#光电
        bit1: '0', // A-2#光电
        bit2: '0', // A-3#光电
        bit3: '0', // A-4#光电
        bit4: '0', // A-5#光电
        bit5: '0', // A-6#光电
        bit6: '0', // A-7#光电
        bit7: '0', // A-8#光电
        bit8: '0', // A-9#光电
        bit9: '0' // A-10#光电
      },
      // B线电机运行信号-读取PLC
      bLineMotorRunning: {
        bit0: '0', // B1-1#电机运行信号
        bit1: '0', // B1-2#电机运行信号
        bit2: '0', // B2-1#电机运行信号
        bit3: '0', // B2-2#电机运行信号
        bit4: '0', // B3-1#电机运行信号
        bit5: '0', // B3-2#电机运行信号
        bit6: '0', // B4-1#电机运行信号
        bit7: '0' // B4-2#电机运行信号
      },
      // B线光电检测信号-读取PLC
      bLinePhotoelectricSignal: {
        bit0: '0', // B-1#光电
        bit1: '0', // B-2#光电
        bit2: '0', // B-3#光电
        bit3: '0', // B-4#光电
        bit4: '0', // B-5#光电
        bit5: '0', // B-6#光电
        bit6: '0', // B-7#光电
        bit7: '0', // B-8#光电
        bit8: '0', // B-9#光电
        bit9: '0' // B-10#光电
      },
      // C线电机运行信号-读取PLC
      cLineMotorRunning: {
        bit0: '0', // C1-1#电机运行信号
        bit1: '0', // C1-2#电机运行信号
        bit2: '0', // C2-1#电机运行信号
        bit3: '0', // C2-2#电机运行信号
        bit4: '0', // C3-1#电机运行信号
        bit5: '0', // C3-2#电机运行信号
        bit6: '0', // C4-1#电机运行信号
        bit7: '0' // C4-2#电机运行信号
      },
      // C线光电检测信号-读取PLC
      cLinePhotoelectricSignal: {
        bit0: '0', // C-1#光电
        bit1: '0', // C-2#光电
        bit2: '0', // C-3#光电
        bit3: '0', // C-4#光电
        bit4: '0', // C-5#光电
        bit5: '0', // C-6#光电
        bit6: '0', // C-7#光电
        bit7: '0', // C-8#光电
        bit8: '0', // C-9#光电
        bit9: '0' // C-10#光电
      },
      // D线电机运行信号-读取PLC
      dLineMotorRunning: {
        bit0: '0', // D1-1#电机运行信号
        bit1: '0', // D1-2#电机运行信号
        bit2: '0', // D2-1#电机运行信号
        bit3: '0', // D2-2#电机运行信号
        bit4: '0', // D3-1#电机运行信号
        bit5: '0', // D3-2#电机运行信号
        bit6: '0', // D4-1#电机运行信号
        bit7: '0' // D4-2#电机运行信号
      },
      // D线光电检测信号-读取PLC
      dLinePhotoelectricSignal: {
        bit0: '0', // D-1#光电
        bit1: '0', // D-2#光电
        bit2: '0', // D-3#光电
        bit3: '0', // D-4#光电
        bit4: '0', // D-5#光电
        bit5: '0', // D-6#光电
        bit6: '0', // D-7#光电
        bit7: '0', // D-8#光电
        bit8: '0', // D-9#光电
        bit9: '0' // D-10#光电
      },
      // E线电机运行信号-读取PLC
      eLineMotorRunning: {
        bit0: '0', // E-1#电机运行信号
        bit1: '0', // E-2#电机运行信号
        bit2: '0', // E-3#电机运行信号
        bit3: '0', // E-4#电机运行信号
        bit4: '0', // E-5#电机运行信号
        bit5: '0', // E-6#电机运行信号
        bit6: '0', // E-7#电机运行信号
        bit7: '0' // E-8#电机运行信号
      },
      // E线光电检测信号-读取PLC
      eLinePhotoelectricSignal: {
        bit0: '0', // E-1#光电
        bit1: '0', // E-2#光电
        bit2: '0', // E-3#光电
        bit3: '0', // E-4#光电
        bit4: '0', // E-5#光电
        bit5: '0', // E-6#光电
        bit6: '0', // E-7#光电
        bit7: '0', // E-8#光电
        bit8: '0', // E-9#光电
        bit9: '0' // E-10#光电
      },
      // F线电机运行信号-读取PLC
      fLineMotorRunning: {
        bit0: '0', // F-1#电机运行信号
        bit1: '0', // F-2#电机运行信号
        bit2: '0', // F-3#电机运行信号
        bit3: '0', // F-4#电机运行信号
        bit4: '0', // F-5#电机运行信号
        bit5: '0', // F-6#电机运行信号
        bit6: '0', // F-7#电机运行信号
        bit7: '0' // F-8#电机运行信号
      },
      // F线光电检测信号-读取PLC
      fLinePhotoelectricSignal: {
        bit0: '0', // F-1#光电
        bit1: '0', // F-2#光电
        bit2: '0', // F-3#光电
        bit3: '0', // F-4#光电
        bit4: '0', // F-5#光电
        bit5: '0', // F-6#光电
        bit6: '0', // F-7#光电
        bit7: '0', // F-8#光电
        bit8: '0', // F-9#光电
        bit9: '0' // F-10#光电
      },
      // G线电机运行信号-读取PLC
      gLineMotorRunning: {
        bit0: '0', // G-1#电机运行信号
        bit1: '0', // G-2#电机运行信号
        bit2: '0', // G-3#电机运行信号
        bit3: '0', // G-4#电机运行信号
        bit4: '0', // G-5#电机运行信号
        bit5: '0', // G-6#电机运行信号
        bit6: '0', // G-7#电机运行信号
        bit7: '0' // G-8#电机运行信号
      },
      // G线光电检测信号-读取PLC
      gLinePhotoelectricSignal: {
        bit0: '0', // G-1#光电
        bit1: '0', // G-2#光电
        bit2: '0', // G-3#光电
        bit3: '0', // G-4#光电
        bit4: '0', // G-5#光电
        bit5: '0', // G-6#光电
        bit6: '0', // G-7#光电
        bit7: '0', // G-8#光电
        bit8: '0', // G-9#光电
        bit9: '0' // G-10#光电
      },
      // A线数量-读取PLC
      aLineQuantity: {
        a1: 0,
        a2: 0,
        a3: 0
      },
      // B线数量-读取PLC
      bLineQuantity: {
        b1: 0,
        b2: 0,
        b3: 0
      },
      // C线数量-读取PLC
      cLineQuantity: {
        c1: 0,
        c2: 0,
        c3: 0
      },
      // D线数量-读取PLC
      dLineQuantity: {
        d1: 0,
        d2: 0,
        d3: 0
      },
      // E线数量-读取PLC
      eLineQuantity: {
        e1: 0,
        e2: 0,
        e3: 0
      },
      // F线数量-读取PLC
      fLineQuantity: {
        f1: 0,
        f2: 0,
        f3: 0
      },
      // G线数量-读取PLC
      gLineQuantity: {
        g1: 0,
        g2: 0,
        g3: 0
      },
      //上货区电机运行信号（扫码后入队）-读取PLC
      upLoadMotorRunning: {
        bit0: '0', // S-1#电机运行信号
        bit1: '0', // S-2#电机运行信号
        bit2: '0', // S-3#电机运行信号
        bit3: '0', // S-4#电机运行信号
        bit4: '0', // S-5#电机运行信号
        bit5: '0', // S-6#电机运行信号
        bit6: '0', // S7#电机运行信号
        bit7: '0' // S8#电机运行信号
      },
      // 上货区输送线光电信号-读取PLC
      upLoadPhotoelectricSignal: {
        bit0: '0', // S-1#光电
        bit1: '0', // S-2#光电
        bit2: '0', // S-3#光电
        bit3: '0', // S-4#光电
        bit4: '0', // S-5#光电
        bit5: '0', // S-6#光电
        bit6: '0', // S-7#光电
        bit7: '0', // S-8#光电
        bit8: '0' // S-9#光电
      },
      // 扫码枪处光电信号-读取PLC
      scanPhotoelectricSignal: {
        bit0: '0', // 一楼接货站台"有载信号"/光电占位
        bit1: '0', // 一楼上货区（扫码后入队）处"有载信号"/光电占位
        bit2: '0', // 二楼A接货占位"有载信号"/光电占位
        bit3: '0', // 二楼B接货占位"有载信号"/光电占位
        bit4: '0', // 三楼A接货占位"有载信号"/光电占位
        bit5: '0', // 三楼B接货占位"有载信号"/光电占位
        bit6: '0', // 下线处"扫码枪处"有载信号"/光电占位
        bit7: '0' // 一楼出货站台"有载信号"/光电占位
      },
      // 下线扫码枪处，申请扫码-读取PLC
      upLineScanPhotoelectricSignal: '',
      // 请求上位机下发任务-读取PLC
      requestWCSTask: '',
      // --------------------------------分隔符--------------------------------
      // 一楼出货口有货需取货处理信号-读取PLC
      floor1OutLoadGoodsSignal: '',
      // 一楼下货出口托盘信息（托盘号）-读取PLC
      floor1OutLoadTrayInfo: '',
      // 一楼下线（扫码枪处）（托盘号）-读取PLC
      floor1OutLineTrayInfo: '',
      // --------------------------------分隔符--------------------------------
      // 一楼接货站台扫码数据（托盘号）-读取PLC
      floor1InLineTrayInfo: '',
      // 一楼上货区（扫码后入队）（托盘号）-读取PLC
      floor1UpLineTrayInfo: '',
      // 二楼A接货站台扫码数据（托盘号）-读取PLC
      floor2ALineTrayInfo: '',
      // 二楼B接货站台扫码数据（托盘号）-读取PLC
      floor2BLineTrayInfo: '',
      // 三楼A接货站台扫码数据（托盘号）-读取PLC
      floor3ALineTrayInfo: '',
      // 三楼B接货站台扫码数据（托盘号）-读取PLC
      floor3BLineTrayInfo: '',
      // 入库区光电点位显示
      inLoadPhotoelectricSignal: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0',
        bit11: '0',
        bit12: '0',
        bit13: '0',
        bit14: '0',
        bit15: '0'
      },
      // 入库电机运行信号
      inLoadMotorRunning: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0'
      },
      // 出库区光电点位显示
      outLoadPhotoelectricSignal: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0',
        bit11: '0'
      },
      // 出库电机运行信号
      outLoadMotorRunning: {
        bit0: '0',
        bit1: '0',
        bit2: '0',
        bit3: '0',
        bit4: '0',
        bit5: '0',
        bit6: '0',
        bit7: '0',
        bit8: '0',
        bit9: '0',
        bit10: '0'
      },
      // 请求上位机下发任务-读取PLC
      requestDestination: '',
      // 小车位置数值-读取PLC
      cartPositionValues: {
        cart1: 5670, // DBW80, 范围5670（A线）-19190（G线）
        cart2: 5820, // DBW84, 范围5820（A线）-16990（G线）
        cart3: 5830 // DBW88, 范围5830（A线）-17020（G线）
      },
      // 小车y轴范围配置（MonitorScreen页面小车沿x轴水平行走）
      cartXRanges: {
        cart1: { min: 318, max: 1395 }, // x轴范围318-1395线到G线)
        cart2: { min: 330, max: 1210 }, // x轴范围330-1210线到G线)
        cart3: { min: 335, max: 1210 } // x轴范围335-1210 (A线到G线)
      },
      // 小车PLC数值范围配置
      cartPlcRanges: {
        cart1: { min: 5670, max: 19190 }, // PLC范围5670-19190
        cart2: { min: 5820, max: 16990 }, // PLC范围5820-16990
        cart3: { min: 5830, max: 17020 } // PLC范围5830-17020
      },
      // 光电信号测试加载状态
      photoelectricLoading: {
        bit0: false,
        bit1: false,
        bit2: false,
        bit3: false,
        bit4: false,
        bit5: false,
        bit6: false,
        bit7: false
      },
      // 预热→灭菌完成信号测试加载状态
      isPreheatingCompletedLoading: false,
      // 当前订单已上货托盘计数器
      currentOrderScannedCount: 0,
      // 灭菌出发地
      disinfectionRoomSelectedFrom: '',
      // 灭菌目的地
      disinfectionRoomSelectedTo: '',
      isDisinfectionExecuting: false,
      // 出库选择的队列
      outboundSelectedQueue: '',
      // 出库执行状态
      isOutboundExecuting: false,
      // 目的地选择
      destinationSelected: '',
      // 预热→灭菌完成信号
      isPreheatingCompleted: 0,
      // --------------------------------模式控制相关--------------------------------
      // 控制模式选择：'mse' - MSE控制模式（普通模式），'nocode' - 无码模式
      controlMode: 'mse',
      // 模式执行状态
      isModeExecuting: false,
      // 无码模式配置
      nocodeTargetCount: 16, // 目标上货数量
      nocodeCurrentCount: 0, // 当前上货计数（上货口计数）
      nocodeDestination: 'A1', // 预热房目的地（A1~G1）
      nocodeOrderId: '', // 无码模式临时唯一orderId

      // 无码模式下各接货口启用状态控制
      nocodeFloor1Enabled: false, // 一楼接货口启用状态
      nocodeFloor2AEnabled: false, // 二楼A接货口启用状态
      nocodeFloor2BEnabled: false, // 二楼B接货口启用状态
      nocodeFloor3AEnabled: false, // 三楼A接货口启用状态
      nocodeFloor3BEnabled: false, // 三楼B接货口启用状态
      nocodeOutboundEnabled: false, // 无码下货复选框状态

      // 新增PLC点位变量
      // 预热状态-读取PLC (DBW362)
      preheatingStatus: {
        bit0: '0', // A预热完成
        bit1: '0', // B预热完成
        bit2: '0', // C预热完成
        bit3: '0', // D预热完成
        bit4: '0', // E预热完成
        bit5: '0', // F预热完成
        bit6: '0' // G预热完成
      },
      // 灭菌状态-读取PLC (DBW364)
      sterilizationStatus: {
        bit0: '0', // A灭菌完成
        bit1: '0', // B灭菌完成
        bit2: '0', // C灭菌完成
        bit3: '0', // D灭菌完成
        bit4: '0', // E灭菌完成
        bit5: '0', // F灭菌完成
        bit6: '0' // G灭菌完成
      },
      // 预热门状态-读取PLC (DBW366)
      preheatingDoorStatus: {
        bit0: '0', // A前门开到位
        bit1: '0', // A后门开到位
        bit2: '0', // B前门开到位
        bit3: '0', // B后门开到位
        bit4: '0', // C前门开到位
        bit5: '0', // C后门开到位
        bit6: '0', // D前门开到位
        bit7: '0', // D后门开到位
        bit8: '0', // E前门开到位
        bit9: '0', // E后门开到位
        bit10: '0', // F前门开到位
        bit11: '0', // F后门开到位
        bit12: '0', // G前门开到位
        bit13: '0' // G后门开到位
      },
      // 灭菌门状态-读取PLC (DBW368)
      sterilizationDoorStatus: {
        bit0: '0', // A前门开到位
        bit1: '0', // A后门开到位
        bit2: '0', // B前门开到位
        bit3: '0', // B后门开到位
        bit4: '0', // C前门开到位
        bit5: '0', // C后门开到位
        bit6: '0', // D前门开到位
        bit7: '0', // D后门开到位
        bit8: '0', // E前门开到位
        bit9: '0', // E后门开到位
        bit10: '0', // F前门开到位
        bit11: '0', // F后门开到位
        bit12: '0', // G前门开到位
        bit13: '0' // G后门开到位
      }
    };
  },
  computed: {
    currentLogs() {
      return this.activeLogType === 'running'
        ? this.runningLogs
        : this.alarmLogs;
    },
    unreadAlarms() {
      return this.alarmLogs.filter((log) => log.unread).length;
    },
    selectedQueue() {
      return this.queues[this.selectedQueueIndex];
    },
    currentOrder() {
      return this.ordersList.find((order) => order.orderStatus === '1') || null;
    },
    isLastQrCodeMatch() {
      if (!this.currentOrder || !this.currentOrder.qrCode) {
        return false;
      }
      const qrCodes = this.currentOrder.qrCode.split(',');
      // 根据订单信息里面的托盘号的数量和扫码上货后计数做一个匹配
      return this.currentOrderScannedCount >= qrCodes.length;
    },
    // 获取当前订单托盘总数
    currentOrderTrayCount() {
      if (!this.currentOrder || !this.currentOrder.qrCode) {
        return 0;
      }
      return this.currentOrder.qrCode.split(',').length;
    },
    // 无码模式下的批次显示
    nocodeBatchId() {
      if (this.isModeExecuting && this.controlMode === 'nocode') {
        return this.nocodeOrderId || '--';
      }
      return this.currentOrder ? this.currentOrder.orderId : '--';
    },
    // 无码模式下的托盘数显示
    nocodeTrayCount() {
      if (this.isModeExecuting && this.controlMode === 'nocode') {
        // 计算预热房已有托盘数
        const targetRoomIndex = 'ABCDEFG'.indexOf(this.nocodeDestination[0]);
        const targetQueueIndex = 1 + targetRoomIndex;
        const targetQueue = this.queues[targetQueueIndex];
        const existingTrayCount = targetQueue.trayInfo
          ? targetQueue.trayInfo.length
          : 0;

        // 计算总进度：预热房已有 + 缓冲区实际数量
        const bufferTrayCount = this.queues[0].trayInfo
          ? this.queues[0].trayInfo.length
          : 0;
        const totalProgress = existingTrayCount + bufferTrayCount;

        return `${totalProgress}/${this.nocodeTargetCount}`;
      }
      return `${this.currentOrderTrayCount}/${this.currentOrderScannedCount}`;
    }
  },
  mounted() {
    this.initializeMarkers();
    this.refreshOrders();
    this.loadQueueInfoFromDatabase();
    this.initWebSocketServer();
    this.startTrayCleanupTimer();
    ipcRenderer.on('receivedMsg', (event, values, values2) => {
      // 使用位运算优化赋值
      const getBit = (word, bitIndex) => ((word >> bitIndex) & 1).toString();

      // 外部货物接驳口-允许进料-读取PLC
      let word4 = this.convertToWord(values.DBW4);
      this.allowFeedBack.bit0 = getBit(word4, 8);
      this.allowFeedBack.bit1 = getBit(word4, 9);
      this.allowFeedBack.bit2 = getBit(word4, 10);
      this.allowFeedBack.bit3 = getBit(word4, 11);
      this.allowFeedBack.bit4 = getBit(word4, 12);
      this.allowFeedBack.bit5 = getBit(word4, 13);

      // A线电机运行信号
      let word6 = this.convertToWord(values.DBW6);
      this.aLineMotorRunning.bit0 = getBit(word6, 8);
      this.aLineMotorRunning.bit1 = getBit(word6, 9);
      this.aLineMotorRunning.bit2 = getBit(word6, 10);
      this.aLineMotorRunning.bit3 = getBit(word6, 11);
      this.aLineMotorRunning.bit4 = getBit(word6, 12);
      this.aLineMotorRunning.bit5 = getBit(word6, 13);
      this.aLineMotorRunning.bit6 = getBit(word6, 14);
      this.aLineMotorRunning.bit7 = getBit(word6, 15);

      // A线光电检测信号-读取PLC
      let word8 = this.convertToWord(values.DBW8);
      this.aLinePhotoelectricSignal.bit0 = getBit(word8, 8);
      this.aLinePhotoelectricSignal.bit1 = getBit(word8, 9);
      this.aLinePhotoelectricSignal.bit2 = getBit(word8, 10);
      this.aLinePhotoelectricSignal.bit3 = getBit(word8, 11);
      this.aLinePhotoelectricSignal.bit4 = getBit(word8, 12);
      this.aLinePhotoelectricSignal.bit5 = getBit(word8, 13);
      this.aLinePhotoelectricSignal.bit6 = getBit(word8, 14);
      this.aLinePhotoelectricSignal.bit7 = getBit(word8, 15);
      this.aLinePhotoelectricSignal.bit8 = getBit(word8, 0);
      this.aLinePhotoelectricSignal.bit9 = getBit(word8, 1);

      // B线电机运行信号-读取PLC
      let word10 = this.convertToWord(values.DBW10);
      this.bLineMotorRunning.bit0 = getBit(word10, 8);
      this.bLineMotorRunning.bit1 = getBit(word10, 9);
      this.bLineMotorRunning.bit2 = getBit(word10, 10);
      this.bLineMotorRunning.bit3 = getBit(word10, 11);
      this.bLineMotorRunning.bit4 = getBit(word10, 12);
      this.bLineMotorRunning.bit5 = getBit(word10, 13);
      this.bLineMotorRunning.bit6 = getBit(word10, 14);
      this.bLineMotorRunning.bit7 = getBit(word10, 15);

      // B线光电检测信号
      let word12 = this.convertToWord(values.DBW12);
      this.bLinePhotoelectricSignal.bit0 = getBit(word12, 8);
      this.bLinePhotoelectricSignal.bit1 = getBit(word12, 9);
      this.bLinePhotoelectricSignal.bit2 = getBit(word12, 10);
      this.bLinePhotoelectricSignal.bit3 = getBit(word12, 11);
      this.bLinePhotoelectricSignal.bit4 = getBit(word12, 12);
      this.bLinePhotoelectricSignal.bit5 = getBit(word12, 13);
      this.bLinePhotoelectricSignal.bit6 = getBit(word12, 14);
      this.bLinePhotoelectricSignal.bit7 = getBit(word12, 15);
      this.bLinePhotoelectricSignal.bit8 = getBit(word12, 0);
      this.bLinePhotoelectricSignal.bit9 = getBit(word12, 1);

      // C线电机运行信号-读取PLC
      let word14 = this.convertToWord(values.DBW14);
      this.cLineMotorRunning.bit0 = getBit(word14, 8);
      this.cLineMotorRunning.bit1 = getBit(word14, 9);
      this.cLineMotorRunning.bit2 = getBit(word14, 10);
      this.cLineMotorRunning.bit3 = getBit(word14, 11);
      this.cLineMotorRunning.bit4 = getBit(word14, 12);
      this.cLineMotorRunning.bit5 = getBit(word14, 13);
      this.cLineMotorRunning.bit6 = getBit(word14, 14);
      this.cLineMotorRunning.bit7 = getBit(word14, 15);

      // C线光电检测信号-读取PLC
      let word16 = this.convertToWord(values.DBW16);
      this.cLinePhotoelectricSignal.bit0 = getBit(word16, 8);
      this.cLinePhotoelectricSignal.bit1 = getBit(word16, 9);
      this.cLinePhotoelectricSignal.bit2 = getBit(word16, 10);
      this.cLinePhotoelectricSignal.bit3 = getBit(word16, 11);
      this.cLinePhotoelectricSignal.bit4 = getBit(word16, 12);
      this.cLinePhotoelectricSignal.bit5 = getBit(word16, 13);
      this.cLinePhotoelectricSignal.bit6 = getBit(word16, 14);
      this.cLinePhotoelectricSignal.bit7 = getBit(word16, 15);
      this.cLinePhotoelectricSignal.bit8 = getBit(word16, 0);
      this.cLinePhotoelectricSignal.bit9 = getBit(word16, 1);

      // D线电机运行信号-读取PLC
      let word18 = this.convertToWord(values.DBW18);
      this.dLineMotorRunning.bit0 = getBit(word18, 8);
      this.dLineMotorRunning.bit1 = getBit(word18, 9);
      this.dLineMotorRunning.bit2 = getBit(word18, 10);
      this.dLineMotorRunning.bit3 = getBit(word18, 11);
      this.dLineMotorRunning.bit4 = getBit(word18, 12);
      this.dLineMotorRunning.bit5 = getBit(word18, 13);
      this.dLineMotorRunning.bit6 = getBit(word18, 14);
      this.dLineMotorRunning.bit7 = getBit(word18, 15);

      // D线光电检测信号-读取PLC
      let word20 = this.convertToWord(values.DBW20);
      this.dLinePhotoelectricSignal.bit0 = getBit(word20, 8);
      this.dLinePhotoelectricSignal.bit1 = getBit(word20, 9);
      this.dLinePhotoelectricSignal.bit2 = getBit(word20, 10);
      this.dLinePhotoelectricSignal.bit3 = getBit(word20, 11);
      this.dLinePhotoelectricSignal.bit4 = getBit(word20, 12);
      this.dLinePhotoelectricSignal.bit5 = getBit(word20, 13);
      this.dLinePhotoelectricSignal.bit6 = getBit(word20, 14);
      this.dLinePhotoelectricSignal.bit7 = getBit(word20, 15);
      this.dLinePhotoelectricSignal.bit8 = getBit(word20, 0);
      this.dLinePhotoelectricSignal.bit9 = getBit(word20, 1);

      // E线电机运行信号-读取PLC
      let word22 = this.convertToWord(values.DBW22);
      this.eLineMotorRunning.bit0 = getBit(word22, 8);
      this.eLineMotorRunning.bit1 = getBit(word22, 9);
      this.eLineMotorRunning.bit2 = getBit(word22, 10);
      this.eLineMotorRunning.bit3 = getBit(word22, 11);
      this.eLineMotorRunning.bit4 = getBit(word22, 12);
      this.eLineMotorRunning.bit5 = getBit(word22, 13);
      this.eLineMotorRunning.bit6 = getBit(word22, 14);
      this.eLineMotorRunning.bit7 = getBit(word22, 15);

      // E线光电检测信号-读取PLC
      let word24 = this.convertToWord(values.DBW24);
      this.eLinePhotoelectricSignal.bit0 = getBit(word24, 8);
      this.eLinePhotoelectricSignal.bit1 = getBit(word24, 9);
      this.eLinePhotoelectricSignal.bit2 = getBit(word24, 10);
      this.eLinePhotoelectricSignal.bit3 = getBit(word24, 11);
      this.eLinePhotoelectricSignal.bit4 = getBit(word24, 12);
      this.eLinePhotoelectricSignal.bit5 = getBit(word24, 13);
      this.eLinePhotoelectricSignal.bit6 = getBit(word24, 14);
      this.eLinePhotoelectricSignal.bit7 = getBit(word24, 15);
      this.eLinePhotoelectricSignal.bit8 = getBit(word24, 0);
      this.eLinePhotoelectricSignal.bit9 = getBit(word24, 1);

      // F线电机运行信号-读取PLC
      let word26 = this.convertToWord(values.DBW26);
      this.fLineMotorRunning.bit0 = getBit(word26, 8);
      this.fLineMotorRunning.bit1 = getBit(word26, 9);
      this.fLineMotorRunning.bit2 = getBit(word26, 10);
      this.fLineMotorRunning.bit3 = getBit(word26, 11);
      this.fLineMotorRunning.bit4 = getBit(word26, 12);
      this.fLineMotorRunning.bit5 = getBit(word26, 13);
      this.fLineMotorRunning.bit6 = getBit(word26, 14);
      this.fLineMotorRunning.bit7 = getBit(word26, 15);

      // F线光电检测信号-读取PLC
      let word28 = this.convertToWord(values.DBW28);
      this.fLinePhotoelectricSignal.bit0 = getBit(word28, 8);
      this.fLinePhotoelectricSignal.bit1 = getBit(word28, 9);
      this.fLinePhotoelectricSignal.bit2 = getBit(word28, 10);
      this.fLinePhotoelectricSignal.bit3 = getBit(word28, 11);
      this.fLinePhotoelectricSignal.bit4 = getBit(word28, 12);
      this.fLinePhotoelectricSignal.bit5 = getBit(word28, 13);
      this.fLinePhotoelectricSignal.bit6 = getBit(word28, 14);
      this.fLinePhotoelectricSignal.bit7 = getBit(word28, 15);
      this.fLinePhotoelectricSignal.bit8 = getBit(word28, 0);
      this.fLinePhotoelectricSignal.bit9 = getBit(word28, 1);

      // G线电机运行信号-读取PLC
      let word30 = this.convertToWord(values.DBW30);
      this.gLineMotorRunning.bit0 = getBit(word30, 8);
      this.gLineMotorRunning.bit1 = getBit(word30, 9);
      this.gLineMotorRunning.bit2 = getBit(word30, 10);
      this.gLineMotorRunning.bit3 = getBit(word30, 11);
      this.gLineMotorRunning.bit4 = getBit(word30, 12);
      this.gLineMotorRunning.bit5 = getBit(word30, 13);
      this.gLineMotorRunning.bit6 = getBit(word30, 14);
      this.gLineMotorRunning.bit7 = getBit(word30, 15);

      // G线光电检测信号-读取PLC
      let word32 = this.convertToWord(values.DBW32);
      this.gLinePhotoelectricSignal.bit0 = getBit(word32, 8);
      this.gLinePhotoelectricSignal.bit1 = getBit(word32, 9);
      this.gLinePhotoelectricSignal.bit2 = getBit(word32, 10);
      this.gLinePhotoelectricSignal.bit3 = getBit(word32, 11);
      this.gLinePhotoelectricSignal.bit4 = getBit(word32, 12);
      this.gLinePhotoelectricSignal.bit5 = getBit(word32, 13);
      this.gLinePhotoelectricSignal.bit6 = getBit(word32, 14);
      this.gLinePhotoelectricSignal.bit7 = getBit(word32, 15);
      this.gLinePhotoelectricSignal.bit8 = getBit(word32, 0);
      this.gLinePhotoelectricSignal.bit9 = getBit(word32, 1);

      // A线数量-读取PLC
      this.aLineQuantity.a1 = Number(values.DBW34);
      this.aLineQuantity.a2 = Number(values.DBW36);
      this.aLineQuantity.a3 = Number(values.DBW38);

      // B线数量-读取PLC
      this.bLineQuantity.b1 = Number(values.DBW40);
      this.bLineQuantity.b2 = Number(values.DBW42);
      this.bLineQuantity.b3 = Number(values.DBW44);

      // C线数量-读取PLC
      this.cLineQuantity.c1 = Number(values.DBW46);
      this.cLineQuantity.c2 = Number(values.DBW48);
      this.cLineQuantity.c3 = Number(values.DBW50);

      // D线数量-读取PLC
      this.dLineQuantity.d1 = Number(values.DBW52);
      this.dLineQuantity.d2 = Number(values.DBW54);
      this.dLineQuantity.d3 = Number(values.DBW56);

      // E线数量-读取PLC
      this.eLineQuantity.e1 = Number(values.DBW58);
      this.eLineQuantity.e2 = Number(values.DBW60);
      this.eLineQuantity.e3 = Number(values.DBW62);

      // F线数量-读取PLC
      this.fLineQuantity.f1 = Number(values.DBW64);
      this.fLineQuantity.f2 = Number(values.DBW66);
      this.fLineQuantity.f3 = Number(values.DBW68);

      // G线数量-读取PLC
      this.gLineQuantity.g1 = Number(values.DBW70);
      this.gLineQuantity.g2 = Number(values.DBW72);
      this.gLineQuantity.g3 = Number(values.DBW74);

      // 上货区电机运行信号（扫码后入队）-读取PLC
      let word76 = this.convertToWord(values.DBW76);
      this.upLoadMotorRunning.bit0 = getBit(word76, 8);
      this.upLoadMotorRunning.bit1 = getBit(word76, 9);
      this.upLoadMotorRunning.bit2 = getBit(word76, 10);
      this.upLoadMotorRunning.bit3 = getBit(word76, 11);
      this.upLoadMotorRunning.bit4 = getBit(word76, 12);
      this.upLoadMotorRunning.bit5 = getBit(word76, 13);
      this.upLoadMotorRunning.bit6 = getBit(word76, 14);
      this.upLoadMotorRunning.bit7 = getBit(word76, 15);

      // 上货区输送线光电信号
      let word78 = this.convertToWord(values.DBW78);
      this.upLoadPhotoelectricSignal.bit0 = getBit(word78, 8);
      this.upLoadPhotoelectricSignal.bit1 = getBit(word78, 9);
      this.upLoadPhotoelectricSignal.bit2 = getBit(word78, 10);
      this.upLoadPhotoelectricSignal.bit3 = getBit(word78, 11);
      this.upLoadPhotoelectricSignal.bit4 = getBit(word78, 12);
      this.upLoadPhotoelectricSignal.bit5 = getBit(word78, 13);
      this.upLoadPhotoelectricSignal.bit6 = getBit(word78, 14);
      this.upLoadPhotoelectricSignal.bit7 = getBit(word78, 15);
      this.upLoadPhotoelectricSignal.bit8 = getBit(word78, 0);

      // 扫码枪处光电信号
      let word92 = this.convertToWord(values.DBW92);
      this.scanPhotoelectricSignal.bit0 = getBit(word92, 8);
      this.scanPhotoelectricSignal.bit1 = getBit(word92, 9);
      this.scanPhotoelectricSignal.bit2 = getBit(word92, 10);
      this.scanPhotoelectricSignal.bit3 = getBit(word92, 11);
      this.scanPhotoelectricSignal.bit4 = getBit(word92, 12);
      this.scanPhotoelectricSignal.bit5 = getBit(word92, 13);
      this.scanPhotoelectricSignal.bit6 = getBit(word92, 14);
      this.scanPhotoelectricSignal.bit7 = getBit(word92, 15);

      // 入库区光电点位显示
      let word340 = this.convertToWord(values.DBW340);
      this.inLoadPhotoelectricSignal.bit0 = getBit(word340, 8);
      this.inLoadPhotoelectricSignal.bit1 = getBit(word340, 9);
      this.inLoadPhotoelectricSignal.bit2 = getBit(word340, 10);
      this.inLoadPhotoelectricSignal.bit3 = getBit(word340, 11);
      this.inLoadPhotoelectricSignal.bit4 = getBit(word340, 12);
      this.inLoadPhotoelectricSignal.bit5 = getBit(word340, 13);
      this.inLoadPhotoelectricSignal.bit6 = getBit(word340, 14);
      this.inLoadPhotoelectricSignal.bit7 = getBit(word340, 15);
      this.inLoadPhotoelectricSignal.bit8 = getBit(word340, 0);
      this.inLoadPhotoelectricSignal.bit9 = getBit(word340, 1);
      this.inLoadPhotoelectricSignal.bit10 = getBit(word340, 2);
      this.inLoadPhotoelectricSignal.bit11 = getBit(word340, 3);
      this.inLoadPhotoelectricSignal.bit12 = getBit(word340, 4);
      this.inLoadPhotoelectricSignal.bit13 = getBit(word340, 5);
      this.inLoadPhotoelectricSignal.bit14 = getBit(word340, 6);
      this.inLoadPhotoelectricSignal.bit15 = getBit(word340, 7);

      // 入库电机运行信号
      let word342 = this.convertToWord(values.DBW342);
      this.inLoadMotorRunning.bit0 = getBit(word342, 8);
      this.inLoadMotorRunning.bit1 = getBit(word342, 9);
      this.inLoadMotorRunning.bit2 = getBit(word342, 10);
      this.inLoadMotorRunning.bit3 = getBit(word342, 11);
      this.inLoadMotorRunning.bit4 = getBit(word342, 12);
      this.inLoadMotorRunning.bit5 = getBit(word342, 13);
      this.inLoadMotorRunning.bit6 = getBit(word342, 14);
      this.inLoadMotorRunning.bit7 = getBit(word342, 15);
      this.inLoadMotorRunning.bit8 = getBit(word342, 0);
      this.inLoadMotorRunning.bit9 = getBit(word342, 1);
      this.inLoadMotorRunning.bit10 = getBit(word342, 2);

      // 出库区光电点位显示
      let word344 = this.convertToWord(values.DBW344);
      this.outLoadPhotoelectricSignal.bit0 = getBit(word344, 8);
      this.outLoadPhotoelectricSignal.bit1 = getBit(word344, 9);
      this.outLoadPhotoelectricSignal.bit2 = getBit(word344, 10);
      this.outLoadPhotoelectricSignal.bit3 = getBit(word344, 11);
      this.outLoadPhotoelectricSignal.bit4 = getBit(word344, 12);
      this.outLoadPhotoelectricSignal.bit5 = getBit(word344, 13);
      this.outLoadPhotoelectricSignal.bit6 = getBit(word344, 14);
      this.outLoadPhotoelectricSignal.bit7 = getBit(word344, 15);
      this.outLoadPhotoelectricSignal.bit8 = getBit(word344, 0);
      this.outLoadPhotoelectricSignal.bit9 = getBit(word344, 1);
      this.outLoadPhotoelectricSignal.bit10 = getBit(word344, 2);
      this.outLoadPhotoelectricSignal.bit11 = getBit(word344, 3);

      // 出库电机运行信号
      let word346 = this.convertToWord(values.DBW346);
      this.outLoadMotorRunning.bit0 = getBit(word346, 8);
      this.outLoadMotorRunning.bit1 = getBit(word346, 9);
      this.outLoadMotorRunning.bit2 = getBit(word346, 10);
      this.outLoadMotorRunning.bit3 = getBit(word346, 11);
      this.outLoadMotorRunning.bit4 = getBit(word346, 12);
      this.outLoadMotorRunning.bit5 = getBit(word346, 13);
      this.outLoadMotorRunning.bit6 = getBit(word346, 14);
      this.outLoadMotorRunning.bit7 = getBit(word346, 15);
      this.outLoadMotorRunning.bit8 = getBit(word346, 0);
      this.outLoadMotorRunning.bit9 = getBit(word346, 1);
      this.outLoadMotorRunning.bit10 = getBit(word346, 2);

      // 下线扫码枪处，申请扫码
      this.upLineScanPhotoelectricSignal = Number(values.DBW94);

      // 请求上位机下发任务
      this.requestWCSTask = Number(values.DBW96);

      // 一楼出货口有货需取货处理信号
      this.floor1OutLoadGoodsSignal = Number(values.DBW98);

      // 一楼下货出口托盘信息（托盘号）
      this.floor1OutLoadTrayInfo = values.DBB100 ? values.DBB100.trim() : '';

      // 一楼下线（扫码枪处）（托盘号）
      this.floor1OutLineTrayInfo = values.DBB130 ? values.DBB130.trim() : '';

      // 一楼接货站台扫码数据（托盘号）
      this.floor1InLineTrayInfo = values.DBB160 ? values.DBB160.trim() : '';
      // 一楼上货区（扫码后入队）（托盘号）
      this.floor1UpLineTrayInfo = values.DBB190 ? values.DBB190.trim() : '';

      // 二楼A接货站台扫码数据（托盘号）
      this.floor2ALineTrayInfo = values.DBB220 ? values.DBB220.trim() : '';

      // 二楼B接货站台扫码数据（托盘号）
      this.floor2BLineTrayInfo = values.DBB250 ? values.DBB250.trim() : '';

      // 三楼A接货站台扫码数据（托盘号）
      this.floor3ALineTrayInfo = values.DBB280 ? values.DBB280.trim() : '';

      // 三楼B接货站台扫码数据（托盘号）
      this.floor3BLineTrayInfo = values.DBB310 ? values.DBB310.trim() : '';

      // 预热房前缓存线请求目的地
      this.requestDestination = Number(values.DBW360);

      // 预热→灭菌完成信号
      this.isPreheatingCompleted = Number(values.DBW348);

      // 读取小车位置数值
      this.cartPositionValues.cart1 = Number(values.DBW80 ?? 0);
      this.cartPositionValues.cart2 = Number(values.DBW84 ?? 0);
      this.cartPositionValues.cart3 = Number(values.DBW88 ?? 0);

      // 新增PLC点位赋值
      // 预热状态-读取PLC (DBW362)
      let word362 = this.convertToWord(values.DBW362);
      this.preheatingStatus.bit0 = getBit(word362, 8); // A预热完成
      this.preheatingStatus.bit1 = getBit(word362, 9); // B预热完成
      this.preheatingStatus.bit2 = getBit(word362, 10); // C预热完成
      this.preheatingStatus.bit3 = getBit(word362, 11); // D预热完成
      this.preheatingStatus.bit4 = getBit(word362, 12); // E预热完成
      this.preheatingStatus.bit5 = getBit(word362, 13); // F预热完成
      this.preheatingStatus.bit6 = getBit(word362, 14); // G预热完成

      // 灭菌状态-读取PLC (DBW364)
      let word364 = this.convertToWord(values.DBW364);
      this.sterilizationStatus.bit0 = getBit(word364, 8); // A灭菌完成
      this.sterilizationStatus.bit1 = getBit(word364, 9); // B灭菌完成
      this.sterilizationStatus.bit2 = getBit(word364, 10); // C灭菌完成
      this.sterilizationStatus.bit3 = getBit(word364, 11); // D灭菌完成
      this.sterilizationStatus.bit4 = getBit(word364, 12); // E灭菌完成
      this.sterilizationStatus.bit5 = getBit(word364, 13); // F灭菌完成
      this.sterilizationStatus.bit6 = getBit(word364, 14); // G灭菌完成

      // 预热门状态-读取PLC (DBW366)
      let word366 = this.convertToWord(values.DBW366);
      this.preheatingDoorStatus.bit0 = getBit(word366, 8); // A前门开到位
      this.preheatingDoorStatus.bit1 = getBit(word366, 9); // A后门开到位
      this.preheatingDoorStatus.bit2 = getBit(word366, 10); // B前门开到位
      this.preheatingDoorStatus.bit3 = getBit(word366, 11); // B后门开到位
      this.preheatingDoorStatus.bit4 = getBit(word366, 12); // C前门开到位
      this.preheatingDoorStatus.bit5 = getBit(word366, 13); // C后门开到位
      this.preheatingDoorStatus.bit6 = getBit(word366, 14); // D前门开到位
      this.preheatingDoorStatus.bit7 = getBit(word366, 15); // D后门开到位
      this.preheatingDoorStatus.bit8 = getBit(word366, 0); // E前门开到位
      this.preheatingDoorStatus.bit9 = getBit(word366, 1); // E后门开到位
      this.preheatingDoorStatus.bit10 = getBit(word366, 2); // F前门开到位
      this.preheatingDoorStatus.bit11 = getBit(word366, 3); // F后门开到位
      this.preheatingDoorStatus.bit12 = getBit(word366, 4); // G前门开到位
      this.preheatingDoorStatus.bit13 = getBit(word366, 5); // G后门开到位

      // 灭菌门状态-读取PLC (DBW368)
      let word368 = this.convertToWord(values.DBW368);
      this.sterilizationDoorStatus.bit0 = getBit(word368, 8); // A前门开到位
      this.sterilizationDoorStatus.bit1 = getBit(word368, 9); // A后门开到位
      this.sterilizationDoorStatus.bit2 = getBit(word368, 10); // B前门开到位
      this.sterilizationDoorStatus.bit3 = getBit(word368, 11); // B后门开到位
      this.sterilizationDoorStatus.bit4 = getBit(word368, 12); // C前门开到位
      this.sterilizationDoorStatus.bit5 = getBit(word368, 13); // C后门开到位
      this.sterilizationDoorStatus.bit6 = getBit(word368, 14); // D前门开到位
      this.sterilizationDoorStatus.bit7 = getBit(word368, 15); // D后门开到位
      this.sterilizationDoorStatus.bit8 = getBit(word368, 0); // E前门开到位
      this.sterilizationDoorStatus.bit9 = getBit(word368, 1); // E后门开到位
      this.sterilizationDoorStatus.bit10 = getBit(word368, 2); // F前门开到位
      this.sterilizationDoorStatus.bit11 = getBit(word368, 3); // F后门开到位
      this.sterilizationDoorStatus.bit12 = getBit(word368, 4); // G前门开到位
      this.sterilizationDoorStatus.bit13 = getBit(word368, 5); // G后门开到位
    });
  },
  watch: {
    'cartPositionValues.cart1'(newVal) {
      this.updateCartPositionByValue(1, newVal);
    },
    'cartPositionValues.cart2'(newVal) {
      this.updateCartPositionByValue(2, newVal);
    },
    'cartPositionValues.cart3'(newVal) {
      this.updateCartPositionByValue(3, newVal);
    },
    // 监听A1队列数量变化
    'aLineQuantity.a1'(newVal, oldVal) {
      this.handleQueueQuantityChange('a1', newVal, oldVal);
      // 无码模式自动停止判断
      this.checkNocodeAutoStopByPlc('A1', newVal, oldVal);
    },
    // 监听B1队列数量变化
    'bLineQuantity.b1'(newVal, oldVal) {
      this.handleQueueQuantityChange('b1', newVal, oldVal);
      // 无码模式自动停止判断
      this.checkNocodeAutoStopByPlc('B1', newVal, oldVal);
    },
    // 监听C1队列数量变化
    'cLineQuantity.c1'(newVal, oldVal) {
      this.handleQueueQuantityChange('c1', newVal, oldVal);
      // 无码模式自动停止判断
      this.checkNocodeAutoStopByPlc('C1', newVal, oldVal);
    },
    // 监听D1队列数量变化
    'dLineQuantity.d1'(newVal, oldVal) {
      this.handleQueueQuantityChange('d1', newVal, oldVal);
      // 无码模式自动停止判断
      this.checkNocodeAutoStopByPlc('D1', newVal, oldVal);
    },
    // 监听E1队列数量变化
    'eLineQuantity.e1'(newVal, oldVal) {
      this.handleQueueQuantityChange('e1', newVal, oldVal);
      // 无码模式自动停止判断
      this.checkNocodeAutoStopByPlc('E1', newVal, oldVal);
    },
    // 监听F1队列数量变化
    'fLineQuantity.f1'(newVal, oldVal) {
      this.handleQueueQuantityChange('f1', newVal, oldVal);
      // 无码模式自动停止判断
      this.checkNocodeAutoStopByPlc('F1', newVal, oldVal);
    },
    // 监听G1队列数量变化
    'gLineQuantity.g1'(newVal, oldVal) {
      this.handleQueueQuantityChange('g1', newVal, oldVal);
      // 无码模式自动停止判断
      this.checkNocodeAutoStopByPlc('G1', newVal, oldVal);
    },
    // 监听A2队列数量变化
    'aLineQuantity.a2'(newVal, oldVal) {
      this.handleLevel2QueueQuantityChange('a2', newVal, oldVal);
    },
    // 监听B2队列数量变化
    'bLineQuantity.b2'(newVal, oldVal) {
      this.handleLevel2QueueQuantityChange('b2', newVal, oldVal);
    },
    // 监听C2队列数量变化
    'cLineQuantity.c2'(newVal, oldVal) {
      this.handleLevel2QueueQuantityChange('c2', newVal, oldVal);
    },
    // 监听D2队列数量变化
    'dLineQuantity.d2'(newVal, oldVal) {
      this.handleLevel2QueueQuantityChange('d2', newVal, oldVal);
    },
    // 监听E2队列数量变化
    'eLineQuantity.e2'(newVal, oldVal) {
      this.handleLevel2QueueQuantityChange('e2', newVal, oldVal);
    },
    // 监听F2队列数量变化
    'fLineQuantity.f2'(newVal, oldVal) {
      this.handleLevel2QueueQuantityChange('f2', newVal, oldVal);
    },
    // 监听G2队列数量变化
    'gLineQuantity.g2'(newVal, oldVal) {
      this.handleLevel2QueueQuantityChange('g2', newVal, oldVal);
    },
    // 监听预热完成信号
    isPreheatingCompleted(newVal, oldVal) {
      if (newVal === 1 && oldVal === 0 && this.isDisinfectionExecuting) {
        this.finishDisinfectionMove();
        this.addLog('预热→灭菌完成信号触发，执行状态已完成');
      }
    },
    // MES模式下监听各个预热柜完成信号
    'preheatingStatus.bit0'(newVal, oldVal) {
      this.handlePreheatingComplete('A', 0, newVal, oldVal);
    },
    'preheatingStatus.bit1'(newVal, oldVal) {
      this.handlePreheatingComplete('B', 1, newVal, oldVal);
    },
    'preheatingStatus.bit2'(newVal, oldVal) {
      this.handlePreheatingComplete('C', 2, newVal, oldVal);
    },
    'preheatingStatus.bit3'(newVal, oldVal) {
      this.handlePreheatingComplete('D', 3, newVal, oldVal);
    },
    'preheatingStatus.bit4'(newVal, oldVal) {
      this.handlePreheatingComplete('E', 4, newVal, oldVal);
    },
    'preheatingStatus.bit5'(newVal, oldVal) {
      this.handlePreheatingComplete('F', 5, newVal, oldVal);
    },
    'preheatingStatus.bit6'(newVal, oldVal) {
      this.handlePreheatingComplete('G', 6, newVal, oldVal);
    },
    // MES模式下监听各个灭菌柜完成信号
    'sterilizationStatus.bit0'(newVal, oldVal) {
      this.handleSterilizationComplete('A', 0, newVal, oldVal);
    },
    'sterilizationStatus.bit1'(newVal, oldVal) {
      this.handleSterilizationComplete('B', 1, newVal, oldVal);
    },
    'sterilizationStatus.bit2'(newVal, oldVal) {
      this.handleSterilizationComplete('C', 2, newVal, oldVal);
    },
    'sterilizationStatus.bit3'(newVal, oldVal) {
      this.handleSterilizationComplete('D', 3, newVal, oldVal);
    },
    'sterilizationStatus.bit4'(newVal, oldVal) {
      this.handleSterilizationComplete('E', 4, newVal, oldVal);
    },
    'sterilizationStatus.bit5'(newVal, oldVal) {
      this.handleSterilizationComplete('F', 5, newVal, oldVal);
    },
    'sterilizationStatus.bit6'(newVal, oldVal) {
      this.handleSterilizationComplete('G', 6, newVal, oldVal);
    },
    // 一楼接货站台"有载信号"/光电占位
    'scanPhotoelectricSignal.bit0'(newVal) {
      // 当值变为1时执行逻辑
      if (newVal === '1') {
        // 检查是否在无码模式执行中
        if (this.isModeExecuting && this.controlMode === 'nocode') {
          // 无码模式：直接调用接货方法，不检查扫码
          this.yiloujiehuozhantai(this.floor1InLineTrayInfo || 'NOCODE', 'PC');
          return;
        }

        // 普通模式：检查扫码状态
        // 1、先判断条码状态是否不为空串 或者 不为NoRead
        if (
          !this.floor1InLineTrayInfo ||
          this.floor1InLineTrayInfo === '' ||
          this.floor1InLineTrayInfo.toLowerCase() === 'noread'
        ) {
          // 2、如果异常，直接给PLC发送一楼接货口禁用命令DBW512：0
          ipcRenderer.send('writeValuesToPLC', 'DBW512', 0);
          // 发送进货异常报警DBW580.bit0
          ipcRenderer.send('writeSingleValueToPLC', 'DBW580', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW580');
          }, 2000);
          this.addLog('一楼接货口条码异常，已禁用接货口', 'alarm');
          return;
        }
        this.yiloujiehuozhantai(this.floor1InLineTrayInfo, 'PC');
      }
    },
    // 一楼上货区（扫码后入队）处"有载信号"/光电占位
    'scanPhotoelectricSignal.bit1'(newVal) {
      // 当值变为1时执行逻辑
      if (newVal === '1') {
        // 检查是否在无码模式执行中
        if (this.isModeExecuting && this.controlMode === 'nocode') {
          // 无码模式：直接调用缓存区扫码方法，不检查扫码
          this.yiloushanghuosaoma(this.floor1UpLineTrayInfo || 'NOCODE', 'PC');
          return;
        }

        // 普通模式：检查扫码状态
        // 1、先判断条码状态是否不为空串 或者 不为NoRead
        if (
          !this.floor1UpLineTrayInfo ||
          this.floor1UpLineTrayInfo === '' ||
          this.floor1UpLineTrayInfo.toLowerCase() === 'noread'
        ) {
          // 缓存区扫码反馈异常DBW582
          ipcRenderer.send('writeSingleValueToPLC', 'DBW582', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW582');
          }, 2000);
          this.addLog('一楼上货区条码异常，已发送报警信号', 'alarm');
          return;
        }
        this.yiloushanghuosaoma(this.floor1UpLineTrayInfo, 'PC');
      }
    },
    // 监听预热房前缓存线请求目的地变化
    requestDestination(newVal) {
      if (newVal === 1) {
        // 1、判断上货区队列是否大于0，如果不是大于0，报警
        if (!this.queues[0].trayInfo || this.queues[0].trayInfo.length <= 0) {
          this.addLog(
            '收到预热房前缓存线请求目的地，但上货区队列为空，本次请求不给PLC发送命令'
          );
          return;
        }

        // 2、读取上货区托盘第一个托盘的信息，遍历上货区里面的托盘信息，看看本orderId下是不是就他一个托盘了
        // 先找到第一个未发送过预热房命令的托盘
        const firstUnprocessedTray = this.queues[0].trayInfo.find(
          (tray) => !tray.hasSentPreheatCommand
        );

        // 如果没有找到未处理的托盘，记录日志并返回
        if (!firstUnprocessedTray) {
          this.addLog('上货区所有托盘都已发送过预热房命令，本次请求不处理');
          return;
        }
        const currentOrderId = firstUnprocessedTray.orderId;
        const trayOrderCount = firstUnprocessedTray.trayOrderCount;

        // 无码模式下的尾托托盘判断逻辑
        let isLastTray = false;
        if (this.isModeExecuting && this.controlMode === 'nocode') {
          // 无码模式：目标预热房+缓存区已发送预热命令的托盘数+1=设定数量
          const targetRoomIndex = 'ABCDEFG'.indexOf(this.nocodeDestination[0]);
          const targetQueueIndex = 1 + targetRoomIndex;
          const targetQueue = this.queues[targetQueueIndex];
          const targetRoomTrayCount = targetQueue.trayInfo
            ? targetQueue.trayInfo.length
            : 0;

          // 计算缓存区中已发送预热命令的托盘数量
          const cacheSentCount = this.queues[0].trayInfo
            ? this.queues[0].trayInfo.filter(
                (tray) => tray.hasSentPreheatCommand
              ).length
            : 0;

          // 无码模式尾托判断：目标预热房托盘数 + 缓存区已发送命令托盘数 + 1 = 设定数量
          isLastTray =
            Number(targetRoomTrayCount + cacheSentCount + 1) ===
            Number(this.nocodeTargetCount);

          this.addLog(
            `【无码模式】尾托判断：目标预热房${
              this.nocodeDestination
            }托盘数${targetRoomTrayCount} + 缓存区已发送命令托盘数${cacheSentCount} + 1 = ${
              targetRoomTrayCount + cacheSentCount + 1
            }，设定数量${this.nocodeTargetCount}，${
              isLastTray ? '是' : '不是'
            }尾托`
          );
        } else {
          // 新逻辑：遍历所有队列，查找orderId与当前托盘相同且hasSentPreheatCommand为true的托盘数量
          // 需要排除当前托盘本身，因为它还没有发送命令
          let sentCount = 0;
          this.queues.forEach((queue) => {
            if (Array.isArray(queue.trayInfo)) {
              sentCount += queue.trayInfo.filter(
                (tray) =>
                  tray.orderId === currentOrderId &&
                  tray.hasSentPreheatCommand &&
                  tray.trayCode !== firstUnprocessedTray.trayCode
              ).length;
            }
          });
          // 普通模式：已发送命令的托盘数量 + 当前托盘 = 订单总托盘数量
          isLastTray = sentCount + 1 === Number(trayOrderCount);
          // 输出一下当前发送命令的托盘的订单托盘数量和已发送托盘数量，以及本托盘是不是最后一个托盘
          this.addLog(
            `当前托盘：${
              firstUnprocessedTray.trayCode
            }，订单号：${currentOrderId}，订单托盘数量：${trayOrderCount}，已发送托盘数量：${sentCount}，本托盘${
              isLastTray ? '是' : '不是'
            }尾托盘`
          );
        }

        // 3、判断完是否为本订单最后一个托盘后，给PLC发送，对应预热房命令
        const isPrint1 = firstUnprocessedTray.isPrint1 || '';
        let plcCommand = 0;

        // 读取isPrint1字段，判断是否包含字母：ABCDEFG
        if (isPrint1.includes('A')) {
          plcCommand = isLastTray ? 11 : 1; // 预热房A启用进货，如果是本订单最后一个托盘发11
        } else if (isPrint1.includes('B')) {
          plcCommand = isLastTray ? 21 : 2; // 预热房B启用进货，如果是本订单最后一个托盘发21
        } else if (isPrint1.includes('C')) {
          plcCommand = isLastTray ? 31 : 3; // 预热房C启用进货，如果是本订单最后一个托盘发31
        } else if (isPrint1.includes('D')) {
          plcCommand = isLastTray ? 41 : 4; // 预热房D启用进货，如果是本订单最后一个托盘发41
        } else if (isPrint1.includes('E')) {
          plcCommand = isLastTray ? 51 : 5; // 预热房E启用进货，如果是本订单最后一个托盘发51
        } else if (isPrint1.includes('F')) {
          plcCommand = isLastTray ? 61 : 6; // 预热房F启用进货，如果是本订单最后一个托盘发61
        } else if (isPrint1.includes('G')) {
          plcCommand = isLastTray ? 71 : 7; // 预热房G启用进货，如果是本订单最后一个托盘发71
        }

        // 给PLC的DBW524发送对应信息
        if (plcCommand > 0) {
          ipcRenderer.send('writeSingleValueToPLC', 'DBW524', plcCommand);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW524');
          }, 2000);
          // 设置托盘已发送预热房命令的标识
          firstUnprocessedTray.hasSentPreheatCommand = true;

          this.addLog(
            `预热房命令已发送：${plcCommand}，托盘：${
              firstUnprocessedTray.trayCode
            }，订单：${currentOrderId}，${
              isLastTray ? '本订单最后一个托盘' : '非本订单最后一个托盘'
            }`
          );
        } else {
          this.addLog(
            `托盘${firstUnprocessedTray.trayCode}的isPrint1字段不包含有效预热房信息：${isPrint1}`
          );
        }
      }
    },
    // ---- 新增：监听指定队列的 trayInfo 变化 ----
    'queues.0.trayInfo': {
      // 监听上货区 (ID: 1)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(1);
      }
    },
    'queues.1.trayInfo': {
      // 监听A1 (ID: 2)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(2);
      }
    },
    'queues.2.trayInfo': {
      // 监听B1 (ID: 3)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(3);
      }
    },
    'queues.3.trayInfo': {
      // 监听 C1 (ID: 4)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(4);
      }
    },
    'queues.4.trayInfo': {
      // 监听 D1 (ID: 5)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(5);
      }
    },
    'queues.5.trayInfo': {
      // 监听 E1 (ID: 6)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(6);
      }
    },
    'queues.6.trayInfo': {
      // 监听 F1 (ID: 7)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(7);
      }
    },
    'queues.7.trayInfo': {
      // 监听 G1 (ID: 8)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(8);
      }
    },
    'queues.8.trayInfo': {
      // 监听 A2 (ID: 9)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(9);
      }
    },
    'queues.9.trayInfo': {
      // 监听 B2 (ID: 10)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(10);
      }
    },
    'queues.10.trayInfo': {
      // 监听 C2 (ID: 11)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(11);
      }
    },
    'queues.11.trayInfo': {
      // 监听 D2 (ID: 12)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(12);
      }
    },
    'queues.12.trayInfo': {
      // 监听 E2 (ID: 13)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(13);
      }
    },
    'queues.13.trayInfo': {
      // 监听 F2 (ID: 14)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(14);
      }
    },
    'queues.14.trayInfo': {
      // 监听 G2 (ID: 15)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(15);
      }
    },
    'queues.15.trayInfo': {
      // 监听 A3 (ID: 16)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(16);
      }
    },
    'queues.16.trayInfo': {
      // 监听 B3 (ID: 17)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(17);
      }
    },
    'queues.17.trayInfo': {
      // 监听 C3 (ID: 18)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(18);
      }
    },
    'queues.18.trayInfo': {
      // 监听 D3 (ID: 19)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(19);
      }
    },
    'queues.19.trayInfo': {
      // 监听 E3 (ID: 20)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(20);
      }
    },
    'queues.20.trayInfo': {
      // 监听 F3 (ID: 21)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(21);
      }
    },
    'queues.21.trayInfo': {
      // 监听 G3 (ID: 22)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(22);
      }
    },
    'queues.22.trayInfo': {
      // 监听下货区 (ID: 23)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(23);
      }
    },
    'aLineQuantity.a3'(newVal, oldVal) {
      this.handleDisinfectionQueueChange('A3', newVal, oldVal);
    },
    'bLineQuantity.b3'(newVal, oldVal) {
      this.handleDisinfectionQueueChange('B3', newVal, oldVal);
    },
    'cLineQuantity.c3'(newVal, oldVal) {
      this.handleDisinfectionQueueChange('C3', newVal, oldVal);
    },
    'dLineQuantity.d3'(newVal, oldVal) {
      this.handleDisinfectionQueueChange('D3', newVal, oldVal);
    },
    'eLineQuantity.e3'(newVal, oldVal) {
      this.handleDisinfectionQueueChange('E3', newVal, oldVal);
    },
    'fLineQuantity.f3'(newVal, oldVal) {
      this.handleDisinfectionQueueChange('F3', newVal, oldVal);
    },
    'gLineQuantity.g3'(newVal, oldVal) {
      this.handleDisinfectionQueueChange('G3', newVal, oldVal);
    },
    // 二楼A接货站台"有载信号"/光电占位
    'scanPhotoelectricSignal.bit2'(newVal) {
      // 当值变为1时执行逻辑
      if (newVal === '1') {
        // 检查是否在无码模式执行中
        if (this.isModeExecuting && this.controlMode === 'nocode') {
          // 无码模式：直接调用接货方法，不检查扫码
          this.jiehuo2A(this.floor2ALineTrayInfo || 'NOCODE', 'PC');
          return;
        }

        // 普通模式：检查扫码状态
        // 1、先判断条码状态是否不为空串 或者 不为NoRead
        if (
          !this.floor2ALineTrayInfo ||
          this.floor2ALineTrayInfo === '' ||
          this.floor2ALineTrayInfo.toLowerCase() === 'noread'
        ) {
          // 2、如果异常，直接给PLC发送二楼A接货口禁用命令DBW514：0
          ipcRenderer.send('writeValuesToPLC', 'DBW514', 0);
          // 发送进货异常报警DB101.DBW584
          ipcRenderer.send('writeSingleValueToPLC', 'DBW584', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW584');
          }, 2000);
          this.addLog('二楼A接货口条码异常，已禁用接货口', 'alarm');
          return;
        }
        this.jiehuo2A(this.floor2ALineTrayInfo, 'PC');
      }
    },
    // 二楼B接货站台"有载信号"/光电占位
    'scanPhotoelectricSignal.bit3'(newVal) {
      // 当值变为1时执行逻辑
      if (newVal === '1') {
        // 检查是否在无码模式执行中
        if (this.isModeExecuting && this.controlMode === 'nocode') {
          // 无码模式：直接调用接货方法，不检查扫码
          this.jiehuo2B(this.floor2BLineTrayInfo || 'NOCODE', 'PC');
          return;
        }

        // 普通模式：检查扫码状态
        // 1、先判断条码状态是否不为空串 或者 不为NoRead
        if (
          !this.floor2BLineTrayInfo ||
          this.floor2BLineTrayInfo === '' ||
          this.floor2BLineTrayInfo.toLowerCase() === 'noread'
        ) {
          // 2、如果异常，直接给PLC发送二楼B接货口禁用命令DBW516：0
          ipcRenderer.send('writeValuesToPLC', 'DBW516', 0);
          // 发送进货异常报警DB101.DBW586
          ipcRenderer.send('writeSingleValueToPLC', 'DBW586', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW586');
          }, 2000);
          this.addLog('二楼B接货口条码异常，已禁用接货口', 'alarm');
          return;
        }
        this.jiehuo2B(this.floor2BLineTrayInfo, 'PC');
      }
    },
    // 三楼A接货站台"有载信号"/光电占位
    'scanPhotoelectricSignal.bit4'(newVal) {
      // 当值变为1时执行逻辑
      if (newVal === '1') {
        // 检查是否在无码模式执行中
        if (this.isModeExecuting && this.controlMode === 'nocode') {
          // 无码模式：直接调用接货方法，不检查扫码
          this.jiehuo3A(this.floor3ALineTrayInfo || 'NOCODE', 'PC');
          return;
        }

        // 普通模式：检查扫码状态
        // 1、先判断条码状态是否不为空串 或者 不为NoRead
        if (
          !this.floor3ALineTrayInfo ||
          this.floor3ALineTrayInfo === '' ||
          this.floor3ALineTrayInfo.toLowerCase() === 'noread'
        ) {
          // 2、如果异常，直接给PLC发送三楼A接货口禁用命令DBW518：0
          ipcRenderer.send('writeValuesToPLC', 'DBW518', 0);
          // 发送进货异常报警DB101.DBW588
          ipcRenderer.send('writeSingleValueToPLC', 'DBW588', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW588');
          }, 2000);
          this.addLog('三楼A接货口条码异常，已禁用接货口', 'alarm');
          return;
        }
        this.jiehuo3A(this.floor3ALineTrayInfo, 'PC');
      }
    },
    // 三楼B接货站台"有载信号"/光电占位
    'scanPhotoelectricSignal.bit5'(newVal) {
      // 当值变为1时执行逻辑
      if (newVal === '1') {
        // 检查是否在无码模式执行中
        if (this.isModeExecuting && this.controlMode === 'nocode') {
          // 无码模式：直接调用接货方法，不检查扫码
          this.jiehuo3B(this.floor3BLineTrayInfo || 'NOCODE', 'PC');
          return;
        }

        // 普通模式：检查扫码状态
        // 1、先判断条码状态是否不为空串 或者 不为NoRead
        if (
          !this.floor3BLineTrayInfo ||
          this.floor3BLineTrayInfo === '' ||
          this.floor3BLineTrayInfo.toLowerCase() === 'noread'
        ) {
          // 2、如果异常，直接给PLC发送三楼B接货口禁用命令DBW520：0
          ipcRenderer.send('writeValuesToPLC', 'DBW520', 0);
          // 发送进货异常报警DB101.DBW590
          ipcRenderer.send('writeSingleValueToPLC', 'DBW590', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW590');
          }, 2000);
          this.addLog('三楼B接货口条码异常，已禁用接货口', 'alarm');
          return;
        }
        this.jiehuo3B(this.floor3BLineTrayInfo, 'PC');
      }
    },
    // 监听下货扫码处光电信号
    'scanPhotoelectricSignal.bit6'(newVal) {
      if (newVal === '1') {
        this.handleDownLoadScan();
      }
    }
    // ---- 监听指定队列的 trayInfo 变化结束 ----
  },
  methods: {
    // --------------------------------模式控制相关方法--------------------------------
    // 处理模式设定
    handleModeSet() {
      // 如果是无码模式，先检查当前是否有订单执行中
      if (this.controlMode === 'nocode') {
        if (this.currentOrder) {
          this.$message.warning('当前有订单正在执行中，无法启动无码模式');
          this.addLog('启动无码模式失败：当前有订单正在执行中', 'alarm');
          return;
        }

        // 获取目标预热房的队列索引
        const targetRoomIndex = 'ABCDEFG'.indexOf(this.nocodeDestination[0]);
        if (targetRoomIndex === -1) {
          this.$message.error('无效的预热房选择');
          this.addLog('启动无码模式失败：无效的预热房选择', 'alarm');
          return;
        }

        // 获取目标预热房队列（A1-G1对应索引1-7）
        const targetQueueIndex = 1 + targetRoomIndex;
        const targetQueue = this.queues[targetQueueIndex];
        const existingTrayCount = targetQueue.trayInfo
          ? targetQueue.trayInfo.length
          : 0;

        // 检查设定数量是否小于目标预热房已有托盘数量
        if (this.nocodeTargetCount <= existingTrayCount) {
          this.$message.error(
            `设定数量（${this.nocodeTargetCount}）不能小于目标预热房已有托盘数量（${existingTrayCount}）`
          );
          this.addLog(
            `启动无码模式失败：设定数量（${this.nocodeTargetCount}）小于目标预热房已有托盘数量（${existingTrayCount}）`,
            'alarm'
          );
          return;
        }

        // 计算需要新增的托盘数量（目标数量 - 已有托盘数量）
        const newTrayCount = this.nocodeTargetCount - existingTrayCount;

        // 检查预热房队列数量和PLC数量一致性
        const queueCount = targetQueue.trayInfo
          ? targetQueue.trayInfo.length
          : 0;
        const plcCount = this.getQueueCountFromPLC(this.nocodeDestination);

        if (queueCount !== plcCount) {
          this.$message.error(
            `预热房${this.nocodeDestination}队列数量（${queueCount}）与PLC数量（${plcCount}）不一致，请检查系统状态`
          );
          this.addLog(
            `启动无码模式失败：预热房${this.nocodeDestination}队列数量（${queueCount}）与PLC数量（${plcCount}）不一致`,
            'alarm'
          );
          return;
        }

        this.addLog(
          `无码模式验证：目标预热房${this.nocodeDestination}已有托盘${existingTrayCount}个，设定目标数量${this.nocodeTargetCount}个，需要新增${newTrayCount}个托盘，队列与PLC数量一致（${queueCount}）`
        );
      }

      this.isModeExecuting = true;

      // 如果是无码模式，重置计数器并生成临时唯一orderId
      if (this.controlMode === 'nocode') {
        // 获取目标预热房的队列索引
        const targetRoomIndex = 'ABCDEFG'.indexOf(this.nocodeDestination[0]);
        const targetQueueIndex = 1 + targetRoomIndex;
        const targetQueue = this.queues[targetQueueIndex];
        const existingTrayCount = targetQueue.trayInfo
          ? targetQueue.trayInfo.length
          : 0;

        // 重置计数器，基于已有托盘数量开始
        this.nocodeCurrentCount = existingTrayCount;

        // 更新进度显示，基于已有托盘数量
        this.addLog(
          `无码模式进度初始化：预热房${this.nocodeDestination}已有托盘${existingTrayCount}个，目标数量${this.nocodeTargetCount}个，当前进度：${existingTrayCount}/${this.nocodeTargetCount}`
        );

        // 生成无码模式的临时唯一orderId
        this.nocodeOrderId = `order_${Date.now()}`;
        this.addLog(
          `已启动无码模式，目标数量：${this.nocodeTargetCount}，预热房：${this.nocodeDestination}，已有托盘：${existingTrayCount}，临时订单ID：${this.nocodeOrderId}`
        );
        this.$message.success(
          `无码模式已启动（目标：${this.nocodeTargetCount}，预热房：${this.nocodeDestination}，已有：${existingTrayCount}）`
        );
      } else {
        this.addLog('已启动MSE控制模式');
        this.$message.success('MSE控制模式已启动');
      }
    },

    // 处理模式取消
    handleModeCancel() {
      this.$confirm('确定要取消当前执行模式吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.isModeExecuting = false;

          // 如果是无码模式，重置计数器和清理临时orderId
          if (this.controlMode === 'nocode') {
            this.nocodeCurrentCount = 0;
            this.nocodeOrderId = ''; // 清理临时orderId
            this.addLog(
              `已取消无码模式（上货口计数：${this.nocodeCurrentCount}/${this.nocodeTargetCount}）`
            );
            this.$message.info('无码模式已取消');
          } else {
            this.addLog('已取消MSE控制模式');
            this.$message.info('MSE控制模式已取消');
          }
        })
        .catch(() => {});
    },
    // --------------------------------模式控制相关方法结束--------------------------------

    // --------------------------------无码模式接货口控制方法--------------------------------
    // 处理一楼接货口复选框状态变化
    handleNocodeFloor1Change(checked) {
      if (checked) {
        ipcRenderer.send('writeValuesToPLC', 'DBW512', 1);
        this.addLog('【无码模式】一楼接货口已启用，给PLC发送DBW512值为1');
      } else {
        ipcRenderer.send('writeValuesToPLC', 'DBW512', 0);
        this.addLog('【无码模式】一楼接货口已禁用，给PLC发送DBW512值为0');
      }
    },

    // 处理二楼A接货口复选框状态变化
    handleNocodeFloor2AChange(checked) {
      if (checked) {
        ipcRenderer.send('writeValuesToPLC', 'DBW514', 1);
        this.addLog('【无码模式】二楼A接货口已启用，给PLC发送DBW514值为1');
      } else {
        ipcRenderer.send('writeValuesToPLC', 'DBW514', 0);
        this.addLog('【无码模式】二楼A接货口已禁用，给PLC发送DBW514值为0');
      }
    },

    // 处理二楼B接货口复选框状态变化
    handleNocodeFloor2BChange(checked) {
      if (checked) {
        ipcRenderer.send('writeValuesToPLC', 'DBW516', 1);
        this.addLog('【无码模式】二楼B接货口已启用，给PLC发送DBW516值为1');
      } else {
        ipcRenderer.send('writeValuesToPLC', 'DBW516', 0);
        this.addLog('【无码模式】二楼B接货口已禁用，给PLC发送DBW516值为0');
      }
    },

    // 处理三楼A接货口复选框状态变化
    handleNocodeFloor3AChange(checked) {
      if (checked) {
        ipcRenderer.send('writeValuesToPLC', 'DBW518', 1);
        this.addLog('【无码模式】三楼A接货口已启用，给PLC发送DBW518值为1');
      } else {
        ipcRenderer.send('writeValuesToPLC', 'DBW518', 0);
        this.addLog('【无码模式】三楼A接货口已禁用，给PLC发送DBW518值为0');
      }
    },

    // 处理三楼B接货口复选框状态变化
    handleNocodeFloor3BChange(checked) {
      if (checked) {
        ipcRenderer.send('writeValuesToPLC', 'DBW520', 1);
        this.addLog('【无码模式】三楼B接货口已启用，给PLC发送DBW520值为1');
      } else {
        ipcRenderer.send('writeValuesToPLC', 'DBW520', 0);
        this.addLog('【无码模式】三楼B接货口已禁用，给PLC发送DBW520值为0');
      }
    },
    // --------------------------------无码模式接货口控制方法结束--------------------------------

    changeQueueExpanded() {
      this.isQueueExpanded = !this.isQueueExpanded;
      // 当展开面板时，刷新当前选中队列的托盘信息
      if (this.isQueueExpanded && this.selectedQueueIndex !== -1) {
        this.showTrays(this.selectedQueueIndex);
      }
    },
    queryQueueList() {
      HttpUtil.post('/queue_info/queryQueueList', {})
        .then((res) => {
          // 处理队列数据，解析trayInfo
          const processedQueues = res.data.map((queue) => ({
            ...queue,
            trayInfo: queue.trayInfo ? JSON.parse(queue.trayInfo) : []
          }));
          this.queues = processedQueues;
          // 如果当前没有选中的队列，默认选中第一个
          if (this.selectedQueueIndex === 0) {
            this.showTrays(0);
          }
        })
        .catch((err) => {
          this.$message.error('查询队列失败，请重试' + err);
        });
    },
    toggleButtonState(button) {
      if (button === 'start') {
        this.$confirm('确定要全线启动吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.buttonStates = {
              start: false,
              stop: false,
              reset: false,
              fault_reset: false,
              clear: false
            };
            ipcRenderer.send('writeValuesToPLC', 'DBW502', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW502', 0);
            }, 500);
            this.buttonStates[button] = !this.buttonStates[button];
            this.$message.success('全线启动成功');
            this.addLog('全线启动成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      } else if (button === 'stop') {
        this.$confirm('确定要全线停止吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.buttonStates = {
              start: false,
              stop: false,
              reset: false,
              fault_reset: false,
              clear: false
            };
            ipcRenderer.send('writeValuesToPLC', 'DBW504', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW504', 0);
            }, 500);
            this.buttonStates[button] = !this.buttonStates[button];
            this.$message.success('全线停止成功');
            this.addLog('全线停止成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      } else if (button === 'reset') {
        this.$confirm('确定要全线暂停吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.buttonStates = {
              start: false,
              stop: false,
              reset: false,
              fault_reset: false,
              clear: false
            };
            this.buttonStates[button] = !this.buttonStates[button];
            ipcRenderer.send('writeValuesToPLC', 'DBW506', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW506', 0);
            }, 500);
            this.$message.success('全线暂停成功');
            this.addLog('全线暂停成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      } else if (button === 'fault_reset') {
        this.$confirm('确定要故障复位吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            ipcRenderer.send('writeValuesToPLC', 'DBW508', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW508', 0);
            }, 500);
            this.$message.success('故障复位成功');
            this.addLog('故障复位成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      } else if (button === 'clear') {
        this.$confirm('确定要全线清空吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$message.success('全线清空成功');
            this.addLog('全线清空成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      }
    },
    // 根据队列名称获取PLC数量
    getQueueCountFromPLC(queueName) {
      switch (queueName) {
        case 'A1':
          return this.aLineQuantity.a1;
        case 'A2':
          return this.aLineQuantity.a2;
        case 'A3':
          return this.aLineQuantity.a3;
        case 'B1':
          return this.bLineQuantity.b1;
        case 'B2':
          return this.bLineQuantity.b2;
        case 'B3':
          return this.bLineQuantity.b3;
        case 'C1':
          return this.cLineQuantity.c1;
        case 'C2':
          return this.cLineQuantity.c2;
        case 'C3':
          return this.cLineQuantity.c3;
        case 'D1':
          return this.dLineQuantity.d1;
        case 'D2':
          return this.dLineQuantity.d2;
        case 'D3':
          return this.dLineQuantity.d3;
        case 'E1':
          return this.eLineQuantity.e1;
        case 'E2':
          return this.eLineQuantity.e2;
        case 'E3':
          return this.eLineQuantity.e3;
        case 'F1':
          return this.fLineQuantity.f1;
        case 'F2':
          return this.fLineQuantity.f2;
        case 'F3':
          return this.fLineQuantity.f3;
        case 'G1':
          return this.gLineQuantity.g1;
        case 'G2':
          return this.gLineQuantity.g2;
        case 'G3':
          return this.gLineQuantity.g3;
        default:
          // 对于非A1-G3的队列，仍然使用数据库数据
          return this.getQueueCountFromDatabase(queueName);
      }
    },
    // 处理队列数量变化的方法
    handleQueueQuantityChange(queueName, newVal, oldVal) {
      // 获取对应的队列索引
      const queueIndexMap = {
        a1: 1, // A1队列索引为1
        b1: 2, // B1队列索引为2
        c1: 3, // C1队列索引为3
        d1: 4, // D1队列索引为4
        e1: 5, // E1队列索引为5
        f1: 6, // F1队列索引为6
        g1: 7 // G1队列索引为7
      };

      const queueIndex = queueIndexMap[queueName];
      if (queueIndex === undefined) return;

      const targetQueue = this.queues[queueIndex];
      const uploadQueue = this.queues[0]; // 上货区队列

      if (newVal > oldVal) {
        // 数量增加，从上货区挪托盘数据
        const increaseCount = newVal - oldVal;
        const availableTrays = uploadQueue.trayInfo || [];

        if (availableTrays.length >= increaseCount) {
          // 批量移除托盘并添加到目标队列
          const traysToMove = availableTrays.splice(0, increaseCount);
          if (!targetQueue.trayInfo) {
            targetQueue.trayInfo = [];
          }
          targetQueue.trayInfo.push(...traysToMove);

          this.addLog(
            `${queueName.toUpperCase()}队列数量增加${increaseCount}，已从上货区移动${increaseCount}个托盘`
          );
        } else {
          this.addLog(
            `${queueName.toUpperCase()}队列数量增加${increaseCount}，但上货区托盘不足，仅移动${
              availableTrays.length
            }个托盘`
          );
          // 移动所有可用的托盘
          const remainingTrays = availableTrays.splice(0);
          if (!targetQueue.trayInfo) {
            targetQueue.trayInfo = [];
          }
          targetQueue.trayInfo.push(...remainingTrays);
        }
      }
    },
    // 处理*2队列数量变化的方法
    handleLevel2QueueQuantityChange(queueName, newVal, oldVal) {
      // 获取对应的队列索引
      const queueIndexMap = {
        a2: 8, // A2队列索引为8
        b2: 9, // B2队列索引为9
        c2: 10, // C2队列索引为10
        d2: 11, // D2队列索引为11
        e2: 12, // E2队列索引为12
        f2: 13, // F2队列索引为13
        g2: 14 // G2队列索引为14
      };

      const queueIndex = queueIndexMap[queueName];
      if (queueIndex === undefined) return;

      // 获取对应*1队列的索引
      const sourceQueueIndexMap = {
        a2: 1, // A2对应A1
        b2: 2, // B2对应B1
        c2: 3, // C2对应C1
        d2: 4, // D2对应D1
        e2: 5, // E2对应E1
        f2: 6, // F2对应F1
        g2: 7 // G2对应G1
      };

      const targetQueue = this.queues[queueIndex];
      const sourceQueue = this.queues[sourceQueueIndexMap[queueName]]; // 对应的*1队列

      if (newVal > oldVal) {
        // 数量增加，从*1队列挪托盘数据
        const increaseCount = newVal - oldVal;
        const availableTrays = sourceQueue.trayInfo || [];

        if (availableTrays.length >= increaseCount) {
          // 批量移除托盘并添加到目标队列
          const traysToMove = availableTrays.splice(0, increaseCount);
          if (!targetQueue.trayInfo) {
            targetQueue.trayInfo = [];
          }
          targetQueue.trayInfo.push(...traysToMove);

          this.addLog(
            `${queueName.toUpperCase()}队列数量增加${increaseCount}，已从${
              sourceQueue.queueName
            }移动${increaseCount}个托盘`
          );
        } else {
          this.addLog(
            `${queueName.toUpperCase()}队列数量增加${increaseCount}，但${
              sourceQueue.queueName
            }托盘不足，仅移动${availableTrays.length}个托盘`
          );
          // 移动所有可用的托盘
          const remainingTrays = availableTrays.splice(0);
          if (!targetQueue.trayInfo) {
            targetQueue.trayInfo = [];
          }
          targetQueue.trayInfo.push(...remainingTrays);
        }
      }
    },
    // 重置所有队列数量
    resetAllQueueQuantities() {
      this.aLineQuantity.a1 = 0;
      this.bLineQuantity.b1 = 0;
      this.cLineQuantity.c1 = 0;
      this.dLineQuantity.d1 = 0;
      this.eLineQuantity.e1 = 0;
      this.fLineQuantity.f1 = 0;
      this.gLineQuantity.g1 = 0;
      this.addLog('已重置所有队列数量为0');
    },
    // 根据队列名称获取数据库中的队列数量
    getQueueCountFromDatabase(queueName) {
      const marker = this.queueMarkers.find((m) => m.name === queueName);
      if (!marker) return 0;

      const queue = this.queues.find((q) => q.id === marker.queueId);
      return queue?.trayInfo?.length || 0;
    },
    getStatusText(status) {
      const statusMap = {
        0: '待执行',
        1: '正在执行',
        2: '已暂停',
        3: '已完成'
      };
      return statusMap[status] || status;
    },
    initializeMarkers() {
      this.$nextTick(() => {
        this.updateMarkerPositions();
        window.addEventListener('resize', this.updateMarkerPositions);
      });
    },
    updateMarkerPositions() {
      const images = document.querySelectorAll('.floor-image');
      images.forEach((image) => {
        const imageWrapper = image.parentElement;
        if (!imageWrapper) return;

        const markers = imageWrapper.querySelectorAll(
          '.marker, .marker-with-panel, .queue-marker, .motor-marker, .preheating-room-marker, .mode-control-card, .door-status-marker, .status-card'
        );
        const carts = imageWrapper.querySelectorAll('.cart-container');
        const wrapperRect = imageWrapper.getBoundingClientRect();

        // 计算图片的实际显示区域
        const displayedWidth = image.width;
        const displayedHeight = image.height;
        const scaleX = displayedWidth / image.naturalWidth;
        const scaleY = displayedHeight / image.naturalHeight;

        // 计算图片在容器中的偏移量
        const imageOffsetX = (wrapperRect.width - displayedWidth) / 2;
        const imageOffsetY = (wrapperRect.height - displayedHeight) / 2;

        // 使用requestAnimationFrame批量更新，减少重排重绘
        requestAnimationFrame(() => {
          markers.forEach((marker) => {
            const x = parseFloat(marker.dataset.x);
            const y = parseFloat(marker.dataset.y);
            if (!isNaN(x) && !isNaN(y)) {
              marker.style.left = `${imageOffsetX + x * scaleX}px`;
              marker.style.top = `${imageOffsetY + y * scaleY}px`;
            }
          });

          // 更新小车位置和大小
          carts.forEach((cart) => {
            const x = parseFloat(cart.dataset.x);
            const y = parseFloat(cart.dataset.y);
            const width = parseFloat(cart.dataset.width);
            if (!isNaN(x) && !isNaN(y)) {
              cart.style.left = `${imageOffsetX + x * scaleX}px`;
              cart.style.top = `${imageOffsetY + y * scaleY}px`;
              if (!isNaN(width)) {
                cart.style.width = `${width * scaleX}px`;
              }
            }
          });
        });
      });
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.updateMarkerPositions);
    },
    showTrays(index) {
      if (index < 0 || index >= this.queues.length) {
        this.nowTrays = [];
        return;
      }

      this.selectedQueueIndex = index;
      const selectedQueue = this.queues[index];

      if (!selectedQueue) {
        this.nowTrays = [];
        return;
      }

      try {
        // 确保 trayInfo 是数组
        const trayInfo = Array.isArray(selectedQueue.trayInfo)
          ? selectedQueue.trayInfo
          : [];

        this.nowTrays = trayInfo
          .map((tray) => {
            const baseTray = {
              id: tray.trayCode || '',
              name: tray.trayCode ? `托盘 ${tray.trayCode}` : '未知托盘',
              time: tray.trayTime || '',
              batchId: tray.batchId || '--',
              orderId: tray.orderId || '--',
              productName: tray.productName || '--',
              productCode: tray.productCode || '--',
              spec: tray.spec || '--',
              isPrint1: tray.isPrint1 || '--',
              isPrint2: tray.isPrint2 || '--',
              hasSentPreheatCommand:
                tray.hasSentPreheatCommand === true ? '是' : '否'
            };

            // 如果是下货区队列（索引22），添加进入时间和预计自动解绑时间
            if (index === 22 && tray.entryTime) {
              const entryTime = new Date(tray.entryTime);
              const autoUnbindTime = new Date(tray.entryTime + 10 * 60 * 1000); // 10分钟后自动解绑

              baseTray.entryTime = entryTime.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              baseTray.autoUnbindTime = autoUnbindTime.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });
            }

            return baseTray;
          })
          .filter((tray) => tray.id); // 过滤掉没有 id 的托盘
      } catch (error) {
        console.error('处理托盘信息时出错:', error);
        this.nowTrays = [];
      }
    },
    handleDragStart(event, tray, queueIndex) {
      if (!tray || queueIndex === undefined) return;

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
    async handleDrop(targetQueueIndex) {
      if (
        !this.draggedTray ||
        this.dragSourceQueue === null ||
        targetQueueIndex === null
      )
        return;
      if (this.dragSourceQueue === targetQueueIndex) return;

      const sourceQueue = this.queues[this.dragSourceQueue];
      const targetQueue = this.queues[targetQueueIndex];

      if (!sourceQueue || !targetQueue) {
        this.$message.error('队列不存在，无法移动托盘');
        return;
      }

      sourceQueue.trayInfo = Array.isArray(sourceQueue.trayInfo)
        ? sourceQueue.trayInfo
        : [];
      targetQueue.trayInfo = Array.isArray(targetQueue.trayInfo)
        ? targetQueue.trayInfo
        : [];

      try {
        if (!this.draggedTray.id) {
          throw new Error('托盘信息无效');
        }

        const trayIndex = sourceQueue.trayInfo.findIndex(
          (t) => t.trayCode === this.draggedTray.id
        );
        if (trayIndex === -1) {
          throw new Error('找不到要移动的托盘');
        }

        const [movedTray] = sourceQueue.trayInfo.splice(trayIndex, 1);
        targetQueue.trayInfo.push(movedTray);

        // 添加日志
        this.addLog(`队列 ${sourceQueue.queueName} 数据已更新`);
        this.addLog(`队列 ${targetQueue.queueName} 数据已更新`);

        // 队列数据已在前端，无需重新查询

        const currentQueueIndex = this.selectedQueueIndex;
        if (
          currentQueueIndex === targetQueueIndex ||
          currentQueueIndex === this.dragSourceQueue
        ) {
          this.$nextTick(() => {
            this.showTrays(currentQueueIndex);
          });
        }

        // 添加托盘移动日志
        this.addLog(
          `托盘 ${movedTray.trayCode} 从 ${sourceQueue.queueName} 移动到 ${targetQueue.queueName}`
        );

        this.$message({
          type: 'success',
          message: `托盘 ${movedTray.trayCode} 已成功移动到 ${targetQueue.queueName}`,
          duration: 2000
        });
      } catch (error) {
        console.error('移动托盘时出错:', error);
        this.$message.error(error.message || '移动托盘失败，请重试');
        // 队列数据已在前端，无需重新查询
      } finally {
        this.draggedTray = null;
        this.dragSourceQueue = null;
        this.isDragging = false;
      }
    },
    async handleOrderStatusChange(order, newStatus) {
      // 根据状态显示不同的消息
      if (newStatus === '1') {
        this.$message.success(`订单 ${order.orderId} 已开始执行`);
      } else if (newStatus === '3') {
        this.$message.success(`订单 ${order.orderId} 已完成`);
      }
      // 重新查询数据库获取最新订单信息
      await this.refreshOrders();
    },
    async switchOrder(order) {
      try {
        const runningOrder = this.ordersList.find(
          (order) => order.orderStatus === '1'
        );
        // 如果有正在运行的订单
        if (runningOrder) {
          if (this.isLastQrCodeMatch) {
            this.$message.warning(
              '当前批次已完成上货，请先点击"上货完成"按钮完成当前订单'
            );
            return;
          } else {
            this.$message.warning(
              '当前批次上货未完成，请完成上货后再切换下一个订单'
            );
            return;
          }
        }

        await this.$confirm('确认要执行该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        // 设置加载状态
        order.isLoading = true;
        const param = {
          id: order.id,
          orderStatus: '1'
        };
        await HttpUtil.post('/order_info/update', param)
          .then((res) => {
            if (res.code === '200') {
              this.handleOrderStatusChange(order, '1');
              // 重置已上货托盘计数器
              this.currentOrderScannedCount = 0;
              // 添加开始订单日志
              this.addLog(
                `订单 ${order.orderId} 开始执行，产品：${
                  order.productName
                }，进货口：${this.getInputText(order.inPut)}`
              );
              // 判断当前订单order.inPut进货口是几楼的，给PLC发送进货口启动命令，启用0禁用1，一个口启动，其他口都禁用
              this.controlPLCInputPorts(order.inPut);
            } else {
              this.$message.error('启动订单失败，请重试');
            }
          })
          .catch((err) => {
            this.$message.error('启动订单失败，请重试');
          })
          .finally(() => {
            order.isLoading = false;
          });
      } catch (err) {
        // 用户取消操作，不做处理
      }
    },
    async finishOrder(order) {
      try {
        await this.$confirm('确认完成该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        // 设置加载状态
        order.isLoading = true;
        const param = {
          id: order.id,
          orderStatus: '3'
        };
        await HttpUtil.post('/order_info/update', param)
          .then((res) => {
            if (res.code === '200') {
              this.handleOrderStatusChange(order, '3');
              // 重置已上货托盘计数器
              this.currentOrderScannedCount = 0;
              // 添加完成订单日志
              this.addLog(
                `订单 ${order.orderId} 已完成，产品：${order.productName}`
              );
            } else {
              this.$message.error('完成订单失败，请重试');
            }
          })
          .catch((err) => {
            this.$message.error('完成订单失败，请重试');
          })
          .finally(() => {
            order.isLoading = false;
          });
      } catch (err) {
        // 用户取消操作，不做处理
      }
    },
    async cancelOrder(order) {
      try {
        await this.$confirm('确认要取消该订单的完成状态吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        // 设置加载状态
        order.isLoading = true;
        const param = {
          id: order.id,
          orderStatus: '0' // 改为0，表示待执行状态
        };
        await HttpUtil.post('/order_info/update', param)
          .then((res) => {
            if (res.code === '200') {
              this.handleOrderStatusChange(order, '0'); // 更新为待执行状态
              // 重置已上货托盘计数器
              this.currentOrderScannedCount = 0;
              this.$message.success('订单状态已更新为待执行');
            } else {
              this.$message.error('取消订单失败，请重试');
            }
          })
          .catch((err) => {
            this.$message.error('取消订单失败，请重试');
          })
          .finally(() => {
            order.isLoading = false;
          });
      } catch (err) {
        // 用户取消操作，不做处理
      }
    },
    async deleteOrder(order) {
      try {
        await this.$confirm('确认要删除该订单吗？删除后无法恢复。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        // 设置删除加载状态
        this.$set(order, 'isDeleting', true);
        const param = {
          id: order.id,
          invalidFlag: 1
        };

        await HttpUtil.post('/order_info/update', param)
          .then((res) => {
            if (res.code === '200') {
              this.$message.success('订单删除成功');
              this.addLog(`订单 ${order.orderId} 已删除`);

              // 重新查询订单列表
              this.refreshOrders();
            } else {
              this.$message.error('删除订单失败，请重试');
            }
          })
          .catch((err) => {
            this.$message.error('删除订单失败，请重试');
          })
          .finally(() => {
            this.$set(order, 'isDeleting', false);
          });
      } catch (err) {
        // 用户取消操作，不做处理
      }
    },
    async refreshOrders() {
      if (this.isRefreshing) return;
      this.isRefreshing = true;
      // 刷新订单 列表
      await HttpUtil.post('/order_info/queryOrderList', {})
        .then((res) => {
          this.$message.success('刷新订单列表成功');
          this.ordersList = res.data;
        })
        .catch((err) => {
          this.$message.error('刷新订单列表失败，请重试，错误：' + err);
        })
        .finally(() => {
          this.isRefreshing = false;
        });
    },
    async showHistoryOrders() {
      this.historyDialogVisible = true;
      await this.loadHistoryOrders();
    },
    handleHistoryDialogClose(done) {
      this.historyOrders = [];
      this.currentPage = 1;
      done();
    },
    async loadHistoryOrders() {
      const params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize
      };

      try {
        const res = await HttpUtil.post(
          '/order_info/queryHistoryOrderList',
          params
        );
        if (res.code === '200') {
          this.historyOrders = res.data.list;
          this.totalHistoryOrders = res.data.total;
        } else {
          this.$message.error('获取历史订单失败');
        }
      } catch (error) {
        this.$message.error('获取历史订单失败');
      }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadHistoryOrders();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.loadHistoryOrders();
    },
    getInputText(input) {
      const inputMap = {
        1: '一楼进货',
        2: '二楼进货',
        3: '三楼进货',
        4: '不解析出口'
      };
      return inputMap[input] || '--';
    },
    getOutputText(output) {
      const outputMap = {
        0: '不解析',
        1: '解析库',
        2: '立体库'
      };
      return outputMap[output] || '--';
    },
    clearAllQrCodes() {
      this.floor2ALineTrayInfo = '';
      this.floor2BLineTrayInfo = '';
      this.floor3ALineTrayInfo = '';
      this.floor3BLineTrayInfo = '';
      this.floor1InLineTrayInfo = '';
      this.floor1UpLineTrayInfo = '';
      this.floor1OutLineTrayInfo = '';
    },
    // 触发光电信号测试
    triggerPhotoelectricSignal(bit) {
      if (this.photoelectricLoading[bit]) return;

      this.photoelectricLoading[bit] = true;

      // 设置光电信号为1
      this.scanPhotoelectricSignal[bit] = '1';

      // 1秒后恢复为0
      setTimeout(() => {
        this.scanPhotoelectricSignal[bit] = '0';
        this.photoelectricLoading[bit] = false;
      }, 1000);

      // 添加日志
      const bitNames = {
        bit0: '一楼接货站台光电',
        bit1: '一楼上货区光电',
        bit2: '二楼A接货光电',
        bit3: '二楼B接货光电',
        bit4: '三楼A接货光电',
        bit5: '三楼B接货光电',
        bit6: '下线扫码处光电',
        bit7: '一楼出货站台光电'
      };

      this.addLog(`触发${bitNames[bit]}信号测试`);
    },
    // 触发预热房前缓存线请求目的地测试
    triggerRequestDestination() {
      // 设置loading状态
      this.isRequestDestinationLoading = true;

      // 模拟requestDestination变为1
      this.requestDestination = 1;
      this.addLog('触发预热房前缓存线请求目的地测试');

      // 1秒后恢复为0并关闭loading
      setTimeout(() => {
        this.requestDestination = 0;
        this.isRequestDestinationLoading = false;
      }, 1000);
    },
    // 切换预热完成信号测试
    togglePreheatingComplete(room) {
      const bitIndex = 'ABCDEFG'.indexOf(room);
      const bitKey = `bit${bitIndex}`;

      // 取反当前状态
      this.preheatingStatus[bitKey] =
        this.preheatingStatus[bitKey] === '1' ? '0' : '1';
      const status = this.preheatingStatus[bitKey] === '1' ? '开启' : '关闭';
      this.addLog(`测试：预热房${room}完成信号${status}`);
    },
    // 切换灭菌完成信号测试
    toggleSterilizationComplete(room) {
      const bitIndex = 'ABCDEFG'.indexOf(room);
      const bitKey = `bit${bitIndex}`;

      // 取反当前状态
      this.sterilizationStatus[bitKey] =
        this.sterilizationStatus[bitKey] === '1' ? '0' : '1';
      const status = this.sterilizationStatus[bitKey] === '1' ? '开启' : '关闭';
      this.addLog(`测试：灭菌柜${room}完成信号${status}`);
    },
    // 触发预热→灭菌完成信号测试
    triggerPreheatingCompletedSignal() {
      if (this.isPreheatingCompletedLoading) return;

      this.isPreheatingCompletedLoading = true;

      // 设置预热→灭菌完成信号为1
      this.isPreheatingCompleted = 1;
      this.addLog('触发预热→灭菌完成信号测试');

      // 1秒后恢复为0并关闭loading
      setTimeout(() => {
        this.isPreheatingCompleted = 0;
        this.isPreheatingCompletedLoading = false;
        this.addLog('预热→灭菌完成信号已恢复为0');
      }, 1000);
    },

    // 更新数据库队列信息
    updateQueueInfo(id) {
      const param = {
        id: id,
        trayInfo: JSON.stringify(this.queues[id - 1].trayInfo)
      };
      HttpUtil.post('/queue_info/update', param).catch((err) => {
        this.$message.error('更新队列信息失败: ' + err);
      });
    },
    async deleteTray(tray) {
      if (!this.selectedQueue) return;

      try {
        // 确认是否删除
        await this.$confirm('确认要删除该托盘吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        // 从队列中移除托盘
        const trayIndex = this.selectedQueue.trayInfo.findIndex(
          (t) => t.trayCode === tray.id
        );
        if (trayIndex > -1) {
          this.selectedQueue.trayInfo.splice(trayIndex, 1);

          // 添加日志
          this.addLog(`队列 ${this.selectedQueue.queueName} 数据已更新`);

          // 刷新显示
          this.showTrays(this.selectedQueueIndex);

          // 添加删除托盘日志
          this.addLog(
            `托盘 ${tray.id} 已从 ${this.selectedQueue.queueName} 删除`
          );

          this.$message.success('托盘删除成功');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除托盘失败，请重试');
        }
      }
    },
    showAddTrayDialog() {
      // 检查是否为缓存区
      const isCacheQueue =
        this.selectedQueue && this.selectedQueue.queueName === '缓存区';

      // 无码模式下不需要运行订单限制
      if (
        isCacheQueue &&
        !this.currentOrder &&
        !(this.isModeExecuting && this.controlMode === 'nocode')
      ) {
        this.$message.error('添加缓存区托盘时，必须当前有运行订单');
        return;
      }

      this.addTrayDialogVisible = true;
      this.isCacheQueueAdd = isCacheQueue;

      // 根据队列类型初始化表单
      if (
        isCacheQueue &&
        this.currentOrder &&
        !(this.isModeExecuting && this.controlMode === 'nocode')
      ) {
        // 缓存区托盘且有运行订单：自动获取当前订单信息，用户只需填写托盘码
        this.newTrayForm = {
          trayCode: '',
          batchId: this.currentOrder.batchId || '',
          orderId: this.currentOrder.orderId || '',
          isPrint1: this.currentOrder.isPrint1 || '',
          isPrint2: this.currentOrder.isPrint2 || '',
          productName: this.currentOrder.productName || '',
          productCode: this.currentOrder.productCode || ''
        };

        // 缓存区托盘只需要验证托盘码
        this.trayFormRules = {
          trayCode: [
            { required: true, message: '请输入托盘编号', trigger: 'blur' },
            {
              min: 1,
              max: 50,
              message: '长度在 1 到 50 个字符',
              trigger: 'blur'
            }
          ]
        };
      } else {
        // 非缓存区托盘：用户需要填写所有信息
        this.newTrayForm = {
          trayCode: '',
          batchId: '',
          orderId: '',
          isPrint1: '',
          isPrint2: '',
          productName: '',
          productCode: ''
        };

        // 非缓存区托盘需要验证所有字段
        this.trayFormRules = {
          trayCode: [
            { required: true, message: '请输入托盘编号', trigger: 'blur' },
            {
              min: 1,
              max: 50,
              message: '长度在 1 到 50 个字符',
              trigger: 'blur'
            }
          ],
          batchId: [
            { required: true, message: '请输入批次号', trigger: 'blur' },
            {
              min: 1,
              max: 50,
              message: '长度在 1 到 50 个字符',
              trigger: 'blur'
            }
          ],
          orderId: [
            { required: true, message: '请输入订单号', trigger: 'blur' },
            {
              min: 1,
              max: 50,
              message: '长度在 1 到 50 个字符',
              trigger: 'blur'
            }
          ],
          isPrint1: [
            { required: true, message: '请选择指定预热房', trigger: 'change' }
          ],
          isPrint2: [
            { required: true, message: '请选择指定灭菌柜', trigger: 'change' }
          ],
          productName: [
            { required: true, message: '请输入产品名称', trigger: 'blur' },
            {
              min: 1,
              max: 100,
              message: '长度在 1 到 100 个字符',
              trigger: 'blur'
            }
          ],
          productCode: [
            { required: true, message: '请输入产品编码', trigger: 'blur' },
            {
              min: 1,
              max: 50,
              message: '长度在 1 到 50 个字符',
              trigger: 'blur'
            }
          ]
        };
      }
    },
    async submitAddTray() {
      if (!this.selectedQueue) return;

      try {
        // 表单验证
        await this.$refs.newTrayForm.validate();

        this.isSubmitting = true;
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

        // 检查是否为缓存区
        const isCacheQueue = this.selectedQueue.queueName === '缓存区';

        // 构建托盘信息
        const newTray = {
          trayCode: this.newTrayForm.trayCode, // 托盘码，用户填写
          trayTime: currentTime, // 系统生成
          batchId: this.newTrayForm.batchId, // 批次id
          orderId: this.newTrayForm.orderId, // 订单id
          isPrint1: this.newTrayForm.isPrint1, // 指定预热房
          isPrint2: this.newTrayForm.isPrint2, // 指定灭菌柜
          productName: this.newTrayForm.productName, // 产品名称
          productCode: this.newTrayForm.productCode, // 产品编码
          hasSentPreheatCommand: false, // 系统生成，默认false
          trayOrderCount:
            isCacheQueue && this.currentOrder
              ? this.currentOrder.qrCode.split(',').length
              : 1 // 获取当前运行订单的托盘列表计算
        };

        // 无码模式下，如果没有运行订单，使用无码模式的默认值
        if (
          isCacheQueue &&
          !this.currentOrder &&
          this.isModeExecuting &&
          this.controlMode === 'nocode'
        ) {
          newTray.batchId = this.nocodeOrderId || 'NOCODE_BATCH';
          newTray.orderId = this.nocodeOrderId || 'NOCODE_ORDER';
          newTray.isPrint1 = this.nocodeDestination || 'A1';
          newTray.isPrint2 = '';
          newTray.productName = '无码模式产品';
          newTray.productCode = 'NOCODE_PRODUCT';
          newTray.trayOrderCount = 1;
        }

        // 确保trayInfo是数组
        if (!Array.isArray(this.selectedQueue.trayInfo)) {
          this.selectedQueue.trayInfo = [];
        }

        // 添加新托盘
        this.selectedQueue.trayInfo.push(newTray);

        // 添加日志
        this.addLog(`队列 ${this.selectedQueue.queueName} 数据已更新`);

        // 刷新显示
        this.showTrays(this.selectedQueueIndex);

        // 添加新托盘日志
        const logMessage = isCacheQueue
          ? `新托盘 ${newTray.trayCode} 已添加到 ${
              this.selectedQueue.queueName
            }，批次号：${newTray.batchId}，订单号：${newTray.orderId}${
              this.isModeExecuting && this.controlMode === 'nocode'
                ? '（无码模式）'
                : ''
            }`
          : `新托盘 ${newTray.trayCode} 已添加到 ${this.selectedQueue.queueName}，批次号：${newTray.batchId}，订单号：${newTray.orderId}，产品：${newTray.productName}`;

        this.addLog(logMessage);

        this.$message.success('托盘添加成功');
        this.addTrayDialogVisible = false;
        this.isCacheQueueAdd = false;
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('添加托盘失败，请重试');
        }
      } finally {
        this.isSubmitting = false;
      }
    },
    cancelAddTray() {
      this.addTrayDialogVisible = false;
      this.isCacheQueueAdd = false;
      // 重置表单
      this.$refs.newTrayForm && this.$refs.newTrayForm.resetFields();
    },

    // --------------------------------新建订单相关方法--------------------------------
    // 显示新建订单弹窗
    showAddOrderDialog() {
      this.addOrderDialogVisible = true;
      // 重置表单
      this.newOrderForm = {
        orderId: '',
        batchId: null,
        productCode: '',
        productName: '',
        isPrint1: '',
        isPrint2: '',
        isPrint3: '',
        inPut: '',
        spec: '',
        isManual: '1', // 默认手动
        currentTrayCode: '', // 当前输入的托盘码
        trayCodes: [] // 已添加的托盘码列表
      };
    },

    // 添加托盘码
    addTrayCode() {
      const code = this.newOrderForm.currentTrayCode.trim();
      if (!code) {
        this.$message.warning('请输入托盘码');
        return;
      }

      // 检查是否已存在
      if (this.newOrderForm.trayCodes.includes(code)) {
        this.$message.warning('该托盘码已存在');
        return;
      }

      // 添加到列表
      this.newOrderForm.trayCodes.push(code);
      // 清空输入框
      this.newOrderForm.currentTrayCode = '';
    },

    // 删除托盘码
    removeTrayCode(index) {
      this.newOrderForm.trayCodes.splice(index, 1);
    },

    // 提交新建订单
    async submitAddOrder() {
      try {
        // 表单验证
        await this.$refs.newOrderForm.validate();

        // 验证至少有一个托盘码
        if (this.newOrderForm.trayCodes.length === 0) {
          this.$message.error('请至少添加一个托盘码');
          return;
        }

        this.isSubmittingOrder = true;

        // 构建订单数据
        const orderData = {
          orderId: this.newOrderForm.orderId,
          batchId: this.newOrderForm.batchId,
          productCode: this.newOrderForm.productCode,
          productName: this.newOrderForm.productName,
          isPrint1: this.newOrderForm.isPrint1,
          isPrint2: this.newOrderForm.isPrint2,
          isPrint3: this.newOrderForm.isPrint3,
          inPut: this.newOrderForm.inPut,
          spec: this.newOrderForm.spec || '',
          isManual: '1', // 新建订单都是手动添加
          qrCode: this.newOrderForm.trayCodes.join(','), // 托盘码用逗号分隔
          orderStatus: '0', // 待执行
          invalidFlag: '0' // 未作废
        };

        // 调用保存接口
        await HttpUtil.post('/order_info/save', orderData)
          .then((res) => {
            if (res.code === '200' || res.data >= 1) {
              this.$message.success('订单创建成功');
              this.addLog(
                `新建订单 ${orderData.orderId} 创建成功，产品：${orderData.productName}，托盘数：${this.newOrderForm.trayCodes.length}`
              );

              // 关闭弹窗
              this.addOrderDialogVisible = false;

              // 刷新订单列表
              this.refreshOrders();
            } else {
              this.$message.error('创建订单失败：' + (res.message || '请重试'));
            }
          })
          .catch((err) => {
            this.$message.error('创建订单失败：' + err);
          })
          .finally(() => {
            this.isSubmittingOrder = false;
          });
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('表单验证失败，请检查输入');
        }
        this.isSubmittingOrder = false;
      }
    },

    // 取消新建订单
    cancelAddOrder() {
      this.addOrderDialogVisible = false;
      // 重置表单
      this.$refs.newOrderForm && this.$refs.newOrderForm.resetFields();
    },

    // 点击队列标识
    handleQueueMarkerClick(queueId) {
      // 展开队列面板
      this.isQueueExpanded = true;

      // 找到队列在数组中的索引
      const queueIndex = this.queues.findIndex((q) => q.id === queueId);
      if (queueIndex !== -1) {
        // 选中并显示对应队列
        this.selectedQueueIndex = queueIndex;
        this.showTrays(queueIndex);
      }
    },
    // 添加新的日志方法
    addLog(message, type = 'running') {
      const log = {
        id: this.logId++,
        type,
        message,
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        unread: type === 'alarm'
      };
      // 只要是日志就往运行日志中添加
      this.runningLogs.unshift(log);
      // 保持日志数量在合理范围内
      if (this.runningLogs.length > 100) {
        this.runningLogs.pop();
      }

      // 报警日志单独处理
      if (type === 'alarm') {
        this.alarmLogs.unshift(log);
        if (this.alarmLogs.length > 100) {
          this.alarmLogs.pop();
        }

        // 如果是报警日志，推送到移动端
        this.pushAlarmToMobile(log);
      }

      // 同时写入本地文件
      const logTypeText = type === 'running' ? '运行日志' : '报警日志';
      const logMessage = `[${logTypeText}] ${message}`;
      ipcRenderer.send('writeLogToLocal', logMessage);
    },
    convertToWord(value) {
      if (value < 0) {
        return (value & 0xffff) >>> 0; // 负数转换为无符号的16位整数
      } else {
        return value; // 非负数保持不变
      }
    },
    toggleBitValue(obj, bit) {
      obj[bit] = obj[bit] === '1' ? '0' : '1';
    },
    updateCartPositionByValue(cartId, value) {
      const cart = this.carts.find((c) => c.id === cartId);
      if (!cart) return;
      const xRange = this.cartXRanges[`cart${cartId}`];
      const plcRange = this.cartPlcRanges[`cart${cartId}`];
      if (!xRange || !plcRange) return;
      // 防止越界
      if (value < plcRange.min) value = plcRange.min;
      if (value > plcRange.max) value = plcRange.max;
      // 计算比例
      const ratio = (value - plcRange.min) / (plcRange.max - plcRange.min);
      // 修正方向：PLC数值增大时小车从A线移动到G线
      cart.x = Math.round(xRange.max - (xRange.max - xRange.min) * ratio);
      this.$nextTick(() => {
        this.updateCartPositionOnly(cartId);
      });
    },
    // 只更新小车位置，不更新其他元素
    updateCartPositionOnly(cartId) {
      const images = document.querySelectorAll('.floor-image');
      images.forEach((image) => {
        const imageWrapper = image.parentElement;
        if (!imageWrapper) return;

        const cart = imageWrapper.querySelector(
          `.cart-container[data-cart-id="${cartId}"]`
        );
        if (!cart) return;

        // 获取最新的小车数据
        const cartData = this.carts.find((c) => c.id === cartId);
        if (!cartData) return;

        const wrapperRect = imageWrapper.getBoundingClientRect();

        // 计算图片的实际显示区域
        const displayedWidth = image.width;
        const displayedHeight = image.height;
        const scaleX = displayedWidth / image.naturalWidth;
        const scaleY = displayedHeight / image.naturalHeight;

        // 计算图片在容器中的偏移量
        const imageOffsetX = (wrapperRect.width - displayedWidth) / 2;
        const imageOffsetY = (wrapperRect.height - displayedHeight) / 2;

        // 使用最新的小车数据更新位置
        const x = cartData.x;
        const y = cartData.y;
        const width = cartData.width;
        if (!isNaN(x) && !isNaN(y)) {
          cart.style.left = `${imageOffsetX + x * scaleX}px`;
          cart.style.top = `${imageOffsetY + y * scaleY}px`;
          if (!isNaN(width)) {
            cart.style.width = `${width * scaleX}px`;
          }
        }
      });
    },
    // 根据楼层控制PLC接货口启用/禁用
    controlPLCInputPorts(floor) {
      // PLC地址映射：0启用，1禁用
      const plcAddresses = {
        1: ['DBW512'], // 一楼接货口
        2: ['DBW514', 'DBW516'], // 二楼1#和2#接货口
        3: ['DBW518', 'DBW520'] // 三楼1#和2#接货口
      };

      // 所有接货口地址列表
      const allAddresses = ['DBW512', 'DBW514', 'DBW516', 'DBW518', 'DBW520'];

      // 先禁用所有接货口
      allAddresses.forEach((address) => {
        ipcRenderer.send('writeValuesToPLC', address, 0); // 0表示禁用
      });

      // 启用指定楼层的接货口
      if (plcAddresses[floor]) {
        plcAddresses[floor].forEach((address) => {
          ipcRenderer.send('writeValuesToPLC', address, 1); // 1表示启用
        });
        this.addLog(
          `已启用${this.getInputText(floor)}接货口，禁用其他楼层接货口`
        );
      } else {
        this.addLog(`未知楼层：${floor}，所有接货口已禁用`, 'alarm');
      }
    },
    // 从数据库加载队列信息
    loadQueueInfoFromDatabase() {
      HttpUtil.post('/queue_info/queryQueueList', {})
        .then((res) => {
          if (res.data && res.data.length > 0) {
            // 遍历数据库返回的队列信息
            res.data.forEach((queueData) => {
              const queueId = queueData.id;
              const queueIndex = queueId - 1; // 数组索引从0开始，队列ID从1开始

              // 确保队列索引有效
              if (queueIndex >= 0 && queueIndex < this.queues.length) {
                try {
                  // 解析托盘信息JSON字符串
                  const trayInfo = queueData.trayInfo
                    ? JSON.parse(queueData.trayInfo)
                    : [];
                  // 赋值给对应的队列
                  this.queues[queueIndex].trayInfo = Array.isArray(trayInfo)
                    ? trayInfo
                    : [];
                  this.addLog(
                    `已加载队列${queueData.queueName || queueId}的托盘信息，共${
                      this.queues[queueIndex].trayInfo.length
                    }个托盘`
                  );
                } catch (error) {
                  console.error(`解析队列${queueId}的托盘信息失败:`, error);
                  this.queues[queueIndex].trayInfo = [];
                  this.addLog(`队列${queueId}托盘信息解析失败，已重置为空`);
                }
              }
            });
            this.addLog('队列信息加载完成');
          } else {
            this.addLog('数据库中暂无队列信息');
          }
        })
        .catch((err) => {
          console.error('加载队列信息失败:', err);
          this.$message.error('加载队列信息失败: ' + err);
          this.addLog('队列信息加载失败');
        });
    },
    handleDisinfectionRoomExecute() {
      // 判断 起始和终点都不为空
      if (
        !this.disinfectionRoomSelectedFrom ||
        !this.disinfectionRoomSelectedTo
      ) {
        this.$message.warning('请选择预热房和灭菌柜');
        return;
      }
      // 预热房编号映射
      const fromMap = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, '': 0 };
      const toMap = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, '': 0 };
      const fromValue = fromMap[this.disinfectionRoomSelectedFrom] || 0;
      const toValue = toMap[this.disinfectionRoomSelectedTo] || 0;
      this.addLog(
        `预热房选择：${this.disinfectionRoomSelectedFrom}，发送DBW526值：${fromValue}，灭菌柜选择：${this.disinfectionRoomSelectedTo}，发送DBW528值：${toValue}`
      );
      ipcRenderer.send('writeSingleValueToPLC', 'DBW526', fromValue);
      ipcRenderer.send('writeSingleValueToPLC', 'DBW528', toValue);
      setTimeout(() => {
        ipcRenderer.send('cancelWriteToPLC', 'DBW526');
        ipcRenderer.send('cancelWriteToPLC', 'DBW528');
      }, 2000);
      this.isDisinfectionExecuting = true;
    },
    finishDisinfectionMove() {
      this.isDisinfectionExecuting = false;
      this.$message.success('托盘已移入目标灭菌柜队列，可继续操作');
    },
    cancelDisinfectionExecute() {
      this.isDisinfectionExecuting = false;
      this.$message.info('已取消预热→灭菌柜执行操作');
      this.addLog('用户手动取消了预热→灭菌柜执行操作');
    },
    handleDisinfectionQueueChange(queueName, newVal, oldVal) {
      if (!this.isDisinfectionExecuting) {
        // 加日志
        this.addLog('灭菌柜队列变化，但预热->灭菌柜未执行，不处理');
        return;
      }
      // 灭菌柜选择和队列名一致才处理
      if (queueName[0] === this.disinfectionRoomSelectedTo) {
        if (newVal > oldVal) {
          // 计算需要移动的托盘数量
          const moveCount = newVal - oldVal;
          // 预热房A2-G2队列索引为8~14
          const preheatIndex =
            8 + 'ABCDEFG'.indexOf(this.disinfectionRoomSelectedFrom);

          // 检查预热房是否有足够的托盘
          const availableTrays = this.queues[preheatIndex].trayInfo || [];
          if (availableTrays.length < moveCount) {
            this.addLog(
              `预热房${this.disinfectionRoomSelectedFrom}托盘不足，需要${moveCount}个，实际只有${availableTrays.length}个`
            );
            return;
          }

          // 根据变化数量移动对应数量的托盘
          const traysToMove = this.queues[preheatIndex].trayInfo.splice(
            0,
            moveCount
          );
          // 根据灭菌柜选择确定目标队列，A3-G3队列索引为15~21
          const targetIndex = 15 + 'ABCDEFG'.indexOf(queueName[0]);
          if (!this.queues[targetIndex].trayInfo)
            this.queues[targetIndex].trayInfo = [];
          this.queues[targetIndex].trayInfo.push(...traysToMove);
          this.addLog(
            `已将${traysToMove.length}个托盘从${this.disinfectionRoomSelectedFrom}预热房移到${queueName}`
          );
          // 移除完成执行状态的调用，改为监听isPreheatingCompleted
        }
      }
    },
    // 出库选择执行逻辑
    handleOutboundExecute() {
      if (!this.outboundSelectedQueue) {
        this.$message.warning('请选择要出库的队列');
        return;
      }

      this.isOutboundExecuting = true;

      // 根据选择的队列给PLC发送对应命令
      // 根据图片协议：00无灭菌柜启用出货，01灭菌柜A启用出货...07灭菌柜G启用出货
      const queueCommandMap = {
        A: '01',
        B: '02',
        C: '03',
        D: '04',
        E: '05',
        F: '06',
        G: '07'
      };

      const commandValue = queueCommandMap[this.outboundSelectedQueue] || '00';

      // 发送PLC命令 - 根据协议图片，使用DBW530地址
      ipcRenderer.send(
        'writeSingleValueToPLC',
        'DBW530',
        parseInt(commandValue)
      );
      setTimeout(() => {
        ipcRenderer.send('cancelWriteToPLC', 'DBW530');
      }, 2000);

      this.addLog(
        `出库选择执行：队列${this.outboundSelectedQueue}，发送命令值：${commandValue}到PLC地址DBW530`
      );

      this.$message.success(
        `${this.outboundSelectedQueue}队列出库命令已发送，等待出库完成`
      );
    },
    // 取消下货执行
    cancelOutboundExecute() {
      this.isOutboundExecuting = false;
      this.$message.info('已取消下货执行操作');
      this.addLog('用户手动取消了下货执行操作');
    },
    // 处理无码下货模式复选框变化
    handleNocodeOutboundChange(value) {
      // 如果勾选无码下货模式，检查是否已选择目的地
      if (value && !this.destinationSelected) {
        this.$message.warning('请先选择目的地后再启用无码下货模式');
        this.nocodeOutboundEnabled = false; // 取消勾选
        this.addLog('无码下货模式启用失败：未选择目的地', 'alarm');
        return;
      }

      if (value) {
        this.addLog(
          `无码下货模式已启用，目的地：${this.getDestinationText(
            this.destinationSelected
          )}`
        );
      } else {
        this.addLog('无码下货模式已禁用');
      }
    },
    // 检查下货执行状态，当队列托盘数量变成0时自动取消执行状态
    checkOutboundExecuteStatus(queueName) {
      // 只有在执行中且选择的队列与当前队列匹配时才检查
      if (
        this.isOutboundExecuting &&
        this.outboundSelectedQueue === queueName
      ) {
        // 获取灭菌房队列索引（A3-G3对应索引15-21）
        const queueIndexMap = {
          A: 15,
          B: 16,
          C: 17,
          D: 18,
          E: 19,
          F: 20,
          G: 21
        };

        const queueIndex = queueIndexMap[queueName];
        if (queueIndex !== undefined) {
          const queue = this.queues[queueIndex];
          // 当队列托盘数量变成0时，自动取消执行状态
          if (!queue.trayInfo || queue.trayInfo.length === 0) {
            this.isOutboundExecuting = false;
            this.$message.success(
              `${queueName}队列出库完成，执行状态已自动取消`
            );
            this.addLog(`${queueName}队列托盘数量变成0，自动取消下货执行状态`);
          }
        }
      }
    },
    // MES模式下处理预热完成信号
    async handlePreheatingComplete(preheatingRoom, bitIndex, newVal, oldVal) {
      // 只有在MES模式下且信号从0变为1时才处理
      if (this.controlMode !== 'mse' || newVal !== '1' || oldVal === '1') {
        return;
      }

      this.addLog(`【MES模式】检测到预热房${preheatingRoom}完成信号`);

      // 获取对应A2-G2队列索引（8~14）
      const queueIndex = 8 + bitIndex;
      const queue = this.queues[queueIndex];

      // 检查队列中是否有托盘
      if (!queue || !queue.trayInfo || queue.trayInfo.length === 0) {
        this.addLog(
          `【MES模式】预热房${preheatingRoom}对应队列${queue.queueName}中无托盘，跳过自动执行`
        );
        return;
      }

      // 获取队列第一个托盘
      const firstTray = queue.trayInfo[0];
      const orderId = firstTray.orderId;

      this.addLog(
        `【MES模式】预热房${preheatingRoom}队列第一个托盘订单号：${orderId}，开始查询最新订单信息`
      );

      try {
        const params = {
          id: firstTray.infoId
        };
        // 查询最新订单信息
        const res = await HttpUtil.post('/order_info/selectByList', params);
        if (res.code === '200' && res.data) {
          // 查找匹配的订单
          const matchedOrder = res.data.find(
            (order) => order.orderId === orderId
          );

          if (matchedOrder) {
            this.addLog(
              `【MES模式】查询到订单信息：${matchedOrder.orderId}，指定灭菌柜：${matchedOrder.isPrint2}`
            );

            // 自动设置预热房到灭菌柜的选择
            this.disinfectionRoomSelectedFrom = preheatingRoom;
            this.disinfectionRoomSelectedTo = matchedOrder.isPrint2
              ? matchedOrder.isPrint2.charAt(0)
              : '';

            // 延迟100ms后自动执行
            setTimeout(() => {
              this.addLog(
                `【MES模式】自动执行：预热房${this.disinfectionRoomSelectedFrom}到灭菌柜${this.disinfectionRoomSelectedTo}`
              );
              this.handleDisinfectionRoomExecute();
            }, 100);
          } else {
            this.addLog(
              `【MES模式】未找到匹配的订单：${orderId}，跳过自动执行`,
              'alarm'
            );
          }
        } else {
          this.addLog('【MES模式】查询订单失败，跳过自动执行', 'alarm');
        }
      } catch (error) {
        this.addLog(`【MES模式】查询订单异常：${error}，跳过自动执行`, 'alarm');
      }
    },
    // MES模式下处理灭菌完成信号
    async handleSterilizationComplete(
      sterilizationRoom,
      bitIndex,
      newVal,
      oldVal
    ) {
      // 只有在MES模式下且信号从0变为1时才处理
      if (this.controlMode !== 'mse' || newVal !== '1' || oldVal === '1') {
        return;
      }

      this.addLog(`【MES模式】检测到灭菌柜${sterilizationRoom}完成信号`);

      // 获取对应A3-G3队列索引（15~21）
      const queueIndex = 15 + bitIndex;
      const queue = this.queues[queueIndex];

      // 检查队列中是否有托盘
      if (!queue || !queue.trayInfo || queue.trayInfo.length === 0) {
        this.addLog(
          `【MES模式】灭菌柜${sterilizationRoom}对应队列${queue.queueName}中无托盘，跳过自动执行`
        );
        return;
      }

      // 获取队列第一个托盘
      const firstTray = queue.trayInfo[0];
      const orderId = firstTray.orderId;

      this.addLog(
        `【MES模式】灭菌柜${sterilizationRoom}队列第一个托盘订单号：${orderId}，开始查询最新订单信息`
      );

      try {
        // 查询最新订单信息
        const params = {
          id: firstTray.infoId
        };
        const res = await HttpUtil.post('/order_info/selectByList', params);
        if (res.code === '200' && res.data) {
          // 查找匹配的订单
          const matchedOrder = res.data.find(
            (order) => order.orderId === orderId
          );

          if (matchedOrder) {
            this.addLog(
              `【MES模式】查询到订单信息：${matchedOrder.orderId}，指定出口：${matchedOrder.isPrint3}`
            );

            // 自动设置出库选择
            this.outboundSelectedQueue = sterilizationRoom;

            // 延迟100ms后自动执行出库
            setTimeout(() => {
              this.addLog(
                `【MES模式】自动执行出库：队列${this.outboundSelectedQueue}`
              );
              this.handleOutboundExecute();
            }, 100);

            // 根据订单的isPrint3字段设置目的地
            // isPrint3: 0-不解析, 1-解析库, 2-立体库
            // destinationSelected: 1-一楼, 2-解析, 3-立库
            let destination = '1'; // 默认一楼
            if (matchedOrder.isPrint3 === '1') {
              destination = '2'; // 解析库
            } else if (matchedOrder.isPrint3 === '2') {
              destination = '3'; // 立体库
            }

            // 自动设置目的地
            this.destinationSelected = destination;
            this.addLog(
              `【MES模式】自动设置目的地：${this.getDestinationText(
                destination
              )}`
            );
          } else {
            this.addLog(
              `【MES模式】未找到匹配的订单：${orderId}，跳过自动执行`,
              'alarm'
            );
          }
        } else {
          this.addLog('【MES模式】查询订单失败，跳过自动执行', 'alarm');
        }
      } catch (error) {
        this.addLog(`【MES模式】查询订单异常：${error}，跳过自动执行`, 'alarm');
      }
    },
    // 处理下货扫码逻辑
    handleDownLoadScan() {
      this.addLog('检测到下货扫码处光电信号，开始处理下货扫码逻辑');

      // 1、检查无码下货复选框是否勾选
      if (this.nocodeOutboundEnabled) {
        // 无码下货：直接给通行，并请求信号后直接出货当前正在出货执行的灭菌房队列的第一个托盘

        // 查找当前正在进行出货执行的灭菌房队列的第一个托盘
        let firstTray = null;
        let sourceQueueIndex = -1;

        // 检查是否有正在执行的出货操作
        if (this.isOutboundExecuting && this.outboundSelectedQueue) {
          // 根据选择的出货队列找到对应的队列索引
          const queueIndexMap = {
            A: 15,
            B: 16,
            C: 17,
            D: 18,
            E: 19,
            F: 20,
            G: 21
          };
          sourceQueueIndex = queueIndexMap[this.outboundSelectedQueue];

          if (sourceQueueIndex !== undefined) {
            const queue = this.queues[sourceQueueIndex];
            if (
              queue.trayInfo &&
              Array.isArray(queue.trayInfo) &&
              queue.trayInfo.length > 0
            ) {
              firstTray = queue.trayInfo[0];
            }
          }
        }

        if (firstTray) {
          this.addLog(
            `【无码下货】找到灭菌房队列${this.queues[sourceQueueIndex].queueName}第一个托盘：${firstTray.trayCode}，开始出货`
          );

          // 检查目的地选择
          if (!this.destinationSelected) {
            this.addLog(
              '【无码下货】目的地未选择，无法发送目的地命令',
              'alarm'
            );
            return;
          }

          // 发送目的地命令到PLC - 根据协议图片，使用DBW542地址
          const destinationValue = this.destinationSelected;
          ipcRenderer.send(
            'writeSingleValueToPLC',
            'DBW542',
            parseInt(destinationValue)
          );
          ipcRenderer.send('writeSingleValueToPLC', 'DBW592', 11);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW542');
            ipcRenderer.send('cancelWriteToPLC', 'DBW592');
          }, 2000);

          this.addLog(
            `【无码下货】下货通行，直接给通行信号，发送目的地命令：${this.getDestinationText(
              destinationValue
            )}，命令值：${destinationValue}到PLC地址DBW542，已给PLC发送DBW592扫码反馈通行11命令`
          );

          // 从源队列中移除第一个托盘
          this.queues[sourceQueueIndex].trayInfo.splice(0, 1);

          // 检查出库执行状态，如果队列为空则取消执行状态
          this.checkOutboundExecuteStatus(this.outboundSelectedQueue);

          // 添加到下货区队列，并记录进入时间
          const downLoadQueue = this.queues[22]; // 下货区队列索引为22
          if (!downLoadQueue.trayInfo) {
            downLoadQueue.trayInfo = [];
          }

          // 为托盘添加进入下货队列时间属性
          const trayWithEntryTime = {
            ...firstTray,
            entryTime: new Date().getTime() // 记录进入下货队列的时间戳
          };

          downLoadQueue.trayInfo.push(trayWithEntryTime);

          this.addLog(
            `【无码下货】托盘${firstTray.trayCode}已从${this.queues[sourceQueueIndex].queueName}移动到下货区队列`
          );
        } else {
          if (this.isOutboundExecuting && this.outboundSelectedQueue) {
            this.addLog(
              `【无码下货】当前正在执行的出货队列${this.outboundSelectedQueue}中无托盘，无法出货`,
              'alarm'
            );
          } else {
            this.addLog(
              `【无码下货】当前没有正在执行的出货操作，无法出货`,
              'alarm'
            );
          }
        }

        return;
      }

      // 2、普通模式：读取下货扫码的条码
      if (
        !this.floor1OutLineTrayInfo ||
        this.floor1OutLineTrayInfo === '' ||
        this.floor1OutLineTrayInfo.toLowerCase() === 'noread'
      ) {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW592', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW592');
        }, 2000);
        this.addLog(
          '下货扫码条码异常或为空，无法处理，已发送报警信号',
          'alarm'
        );
        return;
      }
      this.xiahuosaoma(this.floor1OutLineTrayInfo, 'PC');
    },
    // 获取目的地文本描述
    getDestinationText(value) {
      const destinationMap = {
        1: '一楼下货口',
        2: '二楼A解析出口',
        3: '二楼B解析出口'
      };
      return destinationMap[value] || '未知目的地';
    },
    // 判断是否为预热房队列（A2-G2）
    isPreheatingQueue(queueName) {
      return /^[A-G]2$/.test(queueName);
    },
    // 判断是否为灭菌柜队列（A3-G3）
    isSterilizationQueue(queueName) {
      return /^[A-G]3$/.test(queueName);
    },
    // 判断预热是否完成
    checkPreheatingCompleted(queueName) {
      const room = queueName[0];
      const bitIndex = 'ABCDEFG'.indexOf(room);
      if (bitIndex === -1) return false;
      const bitKey = `bit${bitIndex}`;
      return this.preheatingStatus[bitKey] === '1';
    },
    // 判断灭菌是否完成
    checkSterilizationCompleted(queueName) {
      const room = queueName[0];
      const bitIndex = 'ABCDEFG'.indexOf(room);
      if (bitIndex === -1) return false;
      const bitKey = `bit${bitIndex}`;
      return this.sterilizationStatus[bitKey] === '1';
    },
    // 获取预热房目的地
    getPreheatingDestination(queueName) {
      const room = queueName[0];
      const bitIndex = 'ABCDEFG'.indexOf(room);
      if (bitIndex === -1) return '--';

      // 获取队列索引（A2-G2对应索引8-14）
      const queueIndex = 8 + bitIndex;
      const queue = this.queues[queueIndex];

      // 获取队列第一个托盘的目的地（灭菌柜）
      if (queue && queue.trayInfo && queue.trayInfo.length > 0) {
        const firstTray = queue.trayInfo[0];
        return firstTray.isPrint2 || '--';
      }
      return '--';
    },
    // 获取灭菌柜目的地
    getSterilizationDestination(queueName) {
      const room = queueName[0];
      const bitIndex = 'ABCDEFG'.indexOf(room);
      if (bitIndex === -1) return '--';

      // 获取队列索引（A3-G3对应索引15-21）
      const queueIndex = 15 + bitIndex;
      const queue = this.queues[queueIndex];

      // 获取队列第一个托盘的目的地（一楼、解析、立库）
      if (queue && queue.trayInfo && queue.trayInfo.length > 0) {
        const firstTray = queue.trayInfo[0];
        // isPrint3: 0-不解析(一楼), 1-解析库, 2-立体库
        if (firstTray.isPrint3 === '0' || firstTray.isPrint3 === 0) {
          return '一楼';
        } else if (firstTray.isPrint3 === '1' || firstTray.isPrint3 === 1) {
          return '解析';
        } else if (firstTray.isPrint3 === '2' || firstTray.isPrint3 === 2) {
          return '立库';
        }
      }
      return '--';
    },

    // 检查无码模式自动停止条件（基于PLC数量变化）
    checkNocodeAutoStopByPlc(queueName, newVal, oldVal) {
      // 只有在无码模式执行中且PLC数量增加时才检查
      if (
        !this.isModeExecuting ||
        this.controlMode !== 'nocode' ||
        newVal <= oldVal
      ) {
        return;
      }

      // 检查是否是目标预热房
      if (queueName !== this.nocodeDestination) {
        return;
      }

      // 当目标预热房PLC数量达到设定上货数时自动停止
      if (newVal >= this.nocodeTargetCount) {
        this.addLog(
          `【无码模式】目标预热房${queueName}PLC数量（${newVal}）已达到设定上货数（${this.nocodeTargetCount}），自动结束`
        );
        this.$message.success(
          `无码模式已完成！目标预热房${queueName}PLC数量 ${newVal} 个，已达到设定上货数 ${this.nocodeTargetCount} 个`
        );
        this.isModeExecuting = false;
        // 重置计数器和清理临时orderId
        this.nocodeCurrentCount = 0;
        this.nocodeOrderId = ''; // 清理临时orderId
      }
    },

    // ============ WebSocket相关方法 ============
    // 初始化WebSocket连接（通过IPC与主进程通信）
    initWebSocketServer() {
      try {
        // 监听WebSocket服务器状态更新
        ipcRenderer.on('websocket-status-update', (event, status) => {
          this.wsServerStatus = status;
        });

        // 监听移动端扫码消息
        ipcRenderer.on('mobile-scan-code', (event, data) => {
          this.handleMobileScanCode(data);
        });

        // 立即获取一次状态
        ipcRenderer.send('get-websocket-status');

        // 定期请求服务器状态
        setInterval(() => {
          ipcRenderer.send('get-websocket-status');
        }, 5000);

        this.addLog('已连接到WebSocket服务器', 'running');
      } catch (error) {
        console.error('WebSocket连接失败:', error);
        this.addLog(`WebSocket连接失败: ${error.message}`, 'alarm');
      }
    },

    // 处理移动端扫码消息
    handleMobileScanCode(data) {
      const { method, trayCode, source, clientId } = data;

      try {
        // 调用对应的处理方法
        if (this[method] && typeof this[method] === 'function') {
          this[method](trayCode, source);
          this.addLog(`移动端扫码处理成功: ${method}(${trayCode})`, 'running');

          // 发送成功结果给移动端
          ipcRenderer.send('send-scan-result-to-mobile', {
            clientId: clientId,
            result: {
              success: true,
              message: '扫码处理成功',
              data: { trayCode, location: method }
            }
          });
        } else {
          throw new Error(`方法 ${method} 不存在`);
        }
      } catch (error) {
        console.error('处理移动端扫码消息失败:', error);
        this.addLog(`移动端扫码处理失败: ${error.message}`, 'alarm');

        // 发送失败结果给移动端
        ipcRenderer.send('send-scan-result-to-mobile', {
          clientId: clientId,
          result: {
            success: false,
            message: `处理失败: ${error.message}`,
            data: null
          }
        });
      }
    },

    // 推送报警到移动端（通过IPC）
    pushAlarmToMobile(logData) {
      const alarmData = {
        id: logData.id,
        message: logData.message,
        timestamp: logData.timestamp,
        type: logData.type || 'alarm',
        source: '消毒车间',
        unread: true
      };

      // 发送IPC消息到主进程，请求推送报警
      ipcRenderer.send('push-alarm-to-mobile', alarmData);
      console.log('报警推送请求已发送到主进程');
    },

    // 显示移动端连接状态
    showMobileConnectionStatus() {
      this.mobileConnectionDialogVisible = true;
      this.refreshMobileConnections();
    },

    // 刷新移动端连接状态（通过IPC）
    refreshMobileConnections() {
      this.refreshingConnections = true;

      // 发送IPC消息到主进程，请求获取连接的客户端
      ipcRenderer.send('get-websocket-clients');

      // 监听客户端列表响应
      ipcRenderer.once('websocket-clients-list', (event, clients) => {
        this.mobileConnections = clients || [];
        this.refreshingConnections = false;
      });
    },
    // 格式化时间
    formatTime(timeValue) {
      if (!timeValue) return '--';
      return moment(timeValue).format('YYYY-MM-DD HH:mm:ss');
    },
    // 切换到报警日志时清除未读状态
    switchToAlarmLog() {
      this.activeLogType = 'alarm';
      // 清除所有报警日志的未读状态
      this.alarmLogs.forEach((log) => {
        log.unread = false;
      });
    },
    // trayCode条码号，source来源：'PC'/'PDA'
    yiloujiehuozhantai(trayCode, source) {
      // 检查是否在无码模式执行中
      if (this.isModeExecuting && this.controlMode === 'nocode') {
        // 检查上货口计数是否已达到目标
        if (this.nocodeCurrentCount >= this.nocodeTargetCount) {
          // 已达到目标数量，禁止继续上货
          ipcRenderer.send('writeValuesToPLC', 'DBW512', 0);
          ipcRenderer.send('writeSingleValueToPLC', 'DBW580', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW580');
          }, 2000);
          this.addLog(
            `${source}：【无码模式】上货口计数已满（${this.nocodeCurrentCount}/${this.nocodeTargetCount}），禁止继续上货`,
            'alarm'
          );
          return;
        }

        // 无码模式：直接通行，不判断订单包含，并增加计数
        // 注意：DBW512等接货口控制命令由复选框单独控制，这里不再发送
        ipcRenderer.send('writeSingleValueToPLC', 'DBW580', 11);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW580');
        }, 2000);

        // 增加无码模式上货口计数
        this.nocodeCurrentCount++;

        // 获取目标预热房已有托盘数量
        const targetRoomIndex = 'ABCDEFG'.indexOf(this.nocodeDestination[0]);
        const targetQueueIndex = 1 + targetRoomIndex;
        const targetQueue = this.queues[targetQueueIndex];
        const existingTrayCount = targetQueue.trayInfo
          ? targetQueue.trayInfo.length
          : 0;

        this.addLog(
          `${source}：【无码模式】托盘${trayCode}直接通行一楼接货口（上货口计数：${this.nocodeCurrentCount}/${this.nocodeTargetCount}，预热房已有：${existingTrayCount}）`
        );
        return;
      }

      // 普通模式（MSE控制模式）：按原有逻辑执行
      // 3、如果正常，先判断当前有没有正在执行的订单
      if (!this.currentOrder) {
        // 没有正在执行的订单，禁用接货口
        ipcRenderer.send('writeValuesToPLC', 'DBW512', 0);
        // 发送进货异常报警DBW580.bit0
        ipcRenderer.send('writeSingleValueToPLC', 'DBW580', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW580');
        }, 2000);
        this.addLog(`${source}：当前无执行订单，已禁用一楼接货口`, 'alarm');
        return;
      }

      // 4、判断trayCode读到的条码是否属于当前执行订单
      if (
        this.currentOrder.qrCode &&
        this.currentOrder.qrCode.includes(trayCode)
      ) {
        // 如果属于当前订单，给PLC发送一楼接货口启用命令DBW512：1
        ipcRenderer.send('writeValuesToPLC', 'DBW512', 1);
        // 使用新的单次写入方法，写入DBW580值为11，1秒内发送3次
        ipcRenderer.send('writeSingleValueToPLC', 'DBW580', 11);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW580');
        }, 2000);
        this.addLog(
          `${source}：托盘${trayCode}属于当前订单，已启用一楼接货口，给PLC发送DBW580值为11`
        );
      } else {
        // 如果不属于当前订单，直接给PLC发送一楼接货口禁用命令DBW512：0
        ipcRenderer.send('writeValuesToPLC', 'DBW512', 0);
        // 发送进货异常报警DBW580.bit0
        ipcRenderer.send('writeSingleValueToPLC', 'DBW580', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW580');
        }, 2000);
        this.addLog(
          `${source}：托盘${trayCode}不属于当前订单，已禁用一楼接货口`,
          'alarm'
        );
      }
    },
    // trayCode条码号，source来源：'PC'/'PDA'
    yiloushanghuosaoma(trayCode, source) {
      // 检查是否在无码模式执行中
      if (this.isModeExecuting && this.controlMode === 'nocode') {
        // 检查缓存区是否已满（总进度是否达到目标）
        const targetRoomIndex = 'ABCDEFG'.indexOf(this.nocodeDestination[0]);
        const targetQueueIndex = 1 + targetRoomIndex;
        const targetQueue = this.queues[targetQueueIndex];
        const existingTrayCount = targetQueue.trayInfo
          ? targetQueue.trayInfo.length
          : 0;

        // 计算总进度：预热房已有 + 缓冲区实际数量
        const bufferTrayCount = this.queues[0].trayInfo
          ? this.queues[0].trayInfo.length
          : 0;
        const totalProgress = existingTrayCount + bufferTrayCount;

        // 检查是否已达到目标数量
        if (totalProgress >= this.nocodeTargetCount) {
          // 缓存区已满，拒绝继续上货
          ipcRenderer.send('writeSingleValueToPLC', 'DBW582', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW582');
          }, 2000);
          this.addLog(
            `${source}：【无码模式】缓存区已满（总进度：${totalProgress}/${this.nocodeTargetCount}），拒绝继续上货`,
            'alarm'
          );
          return;
        }

        // 无码模式：直接生成时间戳托盘号，直接入队，不判断任何条件
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const timestampTrayCode = `${Date.now()}`; // 生成时间戳托盘号

        const newTray = {
          trayCode: timestampTrayCode, // 使用时间戳托盘号
          trayTime: currentTime,
          batchId: 'no_tray_code', // 无码模式下批次id为no_tray_code
          infoId: '',
          orderId: this.nocodeOrderId, // 无码模式下使用生成的临时唯一orderId
          isPrint1: this.nocodeDestination, // 使用设定的预热房目的地
          isPrint2: '', // 无码模式下不指定灭菌柜
          isPrint3: '', // 无码模式下不指定出口
          inPut: '',
          productName: '',
          productCode: '',
          spec: '', // 无码模式下规格为空
          hasSentPreheatCommand: false,
          trayOrderCount: this.nocodeTargetCount // 无码模式下根据设定目标值赋值
        };

        // 确保trayInfo是数组
        if (!Array.isArray(this.queues[0].trayInfo)) {
          this.queues[0].trayInfo = [];
        }

        // 无码模式：直接入队，不检查重复
        this.addLog(
          `${source}：【无码模式】缓存区直接通行，给PLC发送DBW582值为11`
        );
        ipcRenderer.send('writeSingleValueToPLC', 'DBW582', 11);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW582');
        }, 2000);

        // 直接添加新托盘
        this.queues[0].trayInfo.push(newTray);

        // 重新计算总进度
        const newBufferTrayCount = this.queues[0].trayInfo
          ? this.queues[0].trayInfo.length
          : 0;
        const newTotalProgress = existingTrayCount + newBufferTrayCount;

        this.addLog(
          `${source}：【无码模式】托盘${timestampTrayCode}已添加到上货区队列（预热房${this.nocodeDestination}已有：${existingTrayCount}，缓冲区实际：${newBufferTrayCount}，总进度：${newTotalProgress}/${this.nocodeTargetCount}）`
        );
        return;
      }

      // 普通模式（MSE控制模式）：按原有逻辑执行
      // 3、如果正常，先判断当前有没有正在执行的订单
      if (!this.currentOrder) {
        // 缓存区扫码反馈异常DBW582
        ipcRenderer.send('writeSingleValueToPLC', 'DBW582', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW582');
        }, 2000);
        this.addLog(
          `${source}：当前无执行订单，一楼上货区已发送报警信号`,
          'alarm'
        );
        return;
      }

      // 4、判断trayCode读到的条码是否属于当前执行订单
      if (
        this.currentOrder.qrCode &&
        this.currentOrder.qrCode.includes(trayCode)
      ) {
        // 如果属于当前订单，将托盘信息添加到上货区队列
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const newTray = {
          trayCode: trayCode, // 托盘码
          trayTime: currentTime,
          batchId: this.currentOrder.batchId || '', // 批次id
          infoId: this.currentOrder.id || '',
          orderId: this.currentOrder.orderId || '', // 订单id
          isPrint1: this.currentOrder.isPrint1 || '', // 指定预热房
          isPrint2: this.currentOrder.isPrint2 || '', // 指定灭菌柜
          isPrint3: this.currentOrder.isPrint3 || '', // 指定出口
          inPut: this.currentOrder.inPut || '',
          productName: this.currentOrder.productName || '',
          productCode: this.currentOrder.productCode || '',
          spec: this.currentOrder.spec || '', // 产品规格
          hasSentPreheatCommand: false, // 添加标识字段，表示是否已发送预热房命令
          // 订单托盘数量,计算方式： this.currentOrder.qrCode字段，每个托盘号使用英文逗号间隔。计算托盘数量。
          trayOrderCount: this.currentOrder.qrCode.split(',').length
        };

        // 确保trayInfo是数组
        if (!Array.isArray(this.queues[0].trayInfo)) {
          this.queues[0].trayInfo = [];
        }

        // 检查托盘是否已存在
        const existingTrayIndex = this.queues[0].trayInfo.findIndex(
          (t) => t.trayCode === trayCode
        );

        if (existingTrayIndex === -1) {
          this.addLog(`${source}：缓存区可以通行，给PLC发送DBW582值为11`);
          ipcRenderer.send('writeSingleValueToPLC', 'DBW582', 11);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW582');
          }, 2000);
          // 添加新托盘
          this.queues[0].trayInfo.push(newTray);
          // 增加已上货托盘计数器
          this.currentOrderScannedCount++;
          this.addLog(
            `${source}：托盘${trayCode}属于当前订单，已添加到上货区队列 (${this.currentOrderScannedCount}/${this.currentOrderTrayCount})`
          );
        } else {
          // 缓存区扫码反馈异常DBW582
          ipcRenderer.send('writeSingleValueToPLC', 'DBW582', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW582');
          }, 2000);
          this.addLog(
            `${source}：托盘${trayCode}已在上货区队列中，已发送报警信号`,
            'alarm'
          );
        }
      } else {
        // 缓存区扫码反馈异常DBW582
        ipcRenderer.send('writeSingleValueToPLC', 'DBW582', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW582');
        }, 2000);
        this.addLog(
          `${source}：托盘${trayCode}不属于当前订单，已发送报警信号`,
          'alarm'
        );
      }
    },
    // trayCode条码号，source来源：'PC'/'PDA'
    jiehuo2A(trayCode, source) {
      // 检查是否在无码模式执行中
      if (this.isModeExecuting && this.controlMode === 'nocode') {
        // 检查上货口计数是否已达到目标
        if (this.nocodeCurrentCount >= this.nocodeTargetCount) {
          // 已达到目标数量，禁止继续上货
          ipcRenderer.send('writeValuesToPLC', 'DBW514', 0);
          ipcRenderer.send('writeSingleValueToPLC', 'DBW584', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW584');
          }, 2000);
          this.addLog(
            `${source}：【无码模式】上货口计数已满（${this.nocodeCurrentCount}/${this.nocodeTargetCount}），禁止继续上货`,
            'alarm'
          );
          return;
        }

        // 无码模式：直接通行，不判断订单包含，并增加计数
        // 注意：DBW514等接货口控制命令由复选框单独控制，这里不再发送
        ipcRenderer.send('writeSingleValueToPLC', 'DBW584', 11);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW584');
        }, 2000);

        // 增加无码模式上货口计数
        this.nocodeCurrentCount++;

        // 获取目标预热房已有托盘数量
        const targetRoomIndex = 'ABCDEFG'.indexOf(this.nocodeDestination[0]);
        const targetQueueIndex = 1 + targetRoomIndex;
        const targetQueue = this.queues[targetQueueIndex];
        const existingTrayCount = targetQueue.trayInfo
          ? targetQueue.trayInfo.length
          : 0;

        this.addLog(
          `${source}：【无码模式】托盘${trayCode}直接通行二楼A接货口（上货口计数：${this.nocodeCurrentCount}/${this.nocodeTargetCount}，预热房已有：${existingTrayCount}）`
        );
        return;
      }

      // 普通模式（MSE控制模式）：按原有逻辑执行
      // 3、如果正常，先判断当前有没有正在执行的订单
      if (!this.currentOrder) {
        // 没有正在执行的订单，禁用接货口
        ipcRenderer.send('writeValuesToPLC', 'DBW514', 0);
        // 发送进货异常报警DB101.DBW584
        ipcRenderer.send('writeSingleValueToPLC', 'DBW584', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW584');
        }, 2000);
        this.addLog(`${source}：当前无执行订单，已禁用二楼A接货口`, 'alarm');
        return;
      }

      // 4、判断trayCode读到的条码是否属于当前执行订单
      if (
        this.currentOrder.qrCode &&
        this.currentOrder.qrCode.includes(trayCode)
      ) {
        // 如果属于当前订单，给PLC发送二楼A接货口启用命令DBW514：1
        ipcRenderer.send('writeValuesToPLC', 'DBW514', 1);
        // 使用新的单次写入方法，写入DB101.DBW584值为11，1秒内发送3次
        ipcRenderer.send('writeSingleValueToPLC', 'DBW584', 11);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW584');
        }, 2000);
        this.addLog(
          `${source}：托盘${trayCode}属于当前订单，已启用二楼A接货口，给PLC发送DBW584值为11`
        );
      } else {
        // 如果不属于当前订单，直接给PLC发送二楼A接货口禁用命令DBW514：0
        ipcRenderer.send('writeValuesToPLC', 'DBW514', 0);
        // 发送进货异常报警DB101.DBW584
        ipcRenderer.send('writeSingleValueToPLC', 'DBW584', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW584');
        }, 2000);
        this.addLog(
          `${source}：托盘${trayCode}不属于当前订单，已禁用二楼A接货口`,
          'alarm'
        );
      }
    },
    // trayCode条码号，source来源：'PC'/'PDA'
    jiehuo2B(trayCode, source) {
      // 检查是否在无码模式执行中
      if (this.isModeExecuting && this.controlMode === 'nocode') {
        // 检查上货口计数是否已达到目标
        if (this.nocodeCurrentCount >= this.nocodeTargetCount) {
          // 已达到目标数量，禁止继续上货
          ipcRenderer.send('writeValuesToPLC', 'DBW516', 0);
          ipcRenderer.send('writeSingleValueToPLC', 'DBW586', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW586');
          }, 2000);
          this.addLog(
            `${source}：【无码模式】上货口计数已满（${this.nocodeCurrentCount}/${this.nocodeTargetCount}），禁止继续上货`,
            'alarm'
          );
          return;
        }

        // 无码模式：直接通行，不判断订单包含，并增加计数
        // 注意：DBW516等接货口控制命令由复选框单独控制，这里不再发送
        ipcRenderer.send('writeSingleValueToPLC', 'DBW586', 11);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW586');
        }, 2000);

        // 增加无码模式上货口计数
        this.nocodeCurrentCount++;

        // 获取目标预热房已有托盘数量
        const targetRoomIndex = 'ABCDEFG'.indexOf(this.nocodeDestination[0]);
        const targetQueueIndex = 1 + targetRoomIndex;
        const targetQueue = this.queues[targetQueueIndex];
        const existingTrayCount = targetQueue.trayInfo
          ? targetQueue.trayInfo.length
          : 0;

        this.addLog(
          `${source}：【无码模式】托盘${trayCode}直接通行二楼B接货口（上货口计数：${this.nocodeCurrentCount}/${this.nocodeTargetCount}，预热房已有：${existingTrayCount}）`
        );
        return;
      }

      // 普通模式（MSE控制模式）：按原有逻辑执行
      // 3、如果正常，先判断当前有没有正在执行的订单
      if (!this.currentOrder) {
        // 没有正在执行的订单，禁用接货口0
        ipcRenderer.send('writeValuesToPLC', 'DBW516', 0);
        // 发送进货异常报警DB101.DBW586
        ipcRenderer.send('writeSingleValueToPLC', 'DBW586', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW586');
        }, 2000);
        this.addLog(`${source}：当前无执行订单，已禁用二楼B接货口`, 'alarm');
        return;
      }

      // 4、判断trayCode读到的条码是否属于当前执行订单
      if (
        this.currentOrder.qrCode &&
        this.currentOrder.qrCode.includes(trayCode)
      ) {
        // 如果属于当前订单，给PLC发送二楼B接货口启用命令DBW516：1
        ipcRenderer.send('writeValuesToPLC', 'DBW516', 1);
        // 使用新的单次写入方法，写入DB101.DBW586值为11，1秒内发送3次
        ipcRenderer.send('writeSingleValueToPLC', 'DBW586', 11);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW586');
        }, 2000);
        this.addLog(
          `${source}：托盘${trayCode}属于当前订单，已启用二楼B接货口，给PLC发送DBW586值为11`
        );
      } else {
        // 如果不属于当前订单，直接给PLC发送二楼B接货口禁用命令DBW516：0
        ipcRenderer.send('writeValuesToPLC', 'DBW516', 0);
        // 发送进货异常报警DB101.DBW586
        ipcRenderer.send('writeSingleValueToPLC', 'DBW586', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW586');
        }, 2000);
        this.addLog(
          `${source}：托盘${trayCode}不属于当前订单，已禁用二楼B接货口`,
          'alarm'
        );
      }
    },
    // trayCode条码号，source来源：'PC'/'PDA'
    jiehuo3A(trayCode, source) {
      // 检查是否在无码模式执行中
      if (this.isModeExecuting && this.controlMode === 'nocode') {
        // 检查上货口计数是否已达到目标
        if (this.nocodeCurrentCount >= this.nocodeTargetCount) {
          // 已达到目标数量，禁止继续上货
          ipcRenderer.send('writeValuesToPLC', 'DBW518', 0);
          ipcRenderer.send('writeSingleValueToPLC', 'DBW588', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW588');
          }, 2000);
          this.addLog(
            `${source}：【无码模式】上货口计数已满（${this.nocodeCurrentCount}/${this.nocodeTargetCount}），禁止继续上货`,
            'alarm'
          );
          return;
        }

        // 无码模式：直接通行，不判断订单包含，并增加计数
        // 注意：DBW518等接货口控制命令由复选框单独控制，这里不再发送
        ipcRenderer.send('writeSingleValueToPLC', 'DBW588', 11);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW588');
        }, 2000);

        // 增加无码模式上货口计数
        this.nocodeCurrentCount++;

        // 获取目标预热房已有托盘数量
        const targetRoomIndex = 'ABCDEFG'.indexOf(this.nocodeDestination[0]);
        const targetQueueIndex = 1 + targetRoomIndex;
        const targetQueue = this.queues[targetQueueIndex];
        const existingTrayCount = targetQueue.trayInfo
          ? targetQueue.trayInfo.length
          : 0;

        this.addLog(
          `${source}：【无码模式】托盘${trayCode}直接通行三楼A接货口（上货口计数：${this.nocodeCurrentCount}/${this.nocodeTargetCount}，预热房已有：${existingTrayCount}）`
        );
        return;
      }

      // 普通模式（MSE控制模式）：按原有逻辑执行
      // 3、如果正常，先判断当前有没有正在执行的订单
      if (!this.currentOrder) {
        // 没有正在执行的订单，禁用接货口0
        ipcRenderer.send('writeValuesToPLC', 'DBW518', 0);
        // 发送进货异常报警DB101.DBW588
        ipcRenderer.send('writeSingleValueToPLC', 'DBW588', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW588');
        }, 2000);
        this.addLog(`${source}：当前无执行订单，已禁用三楼A接货口`, 'alarm');
        return;
      }

      // 4、判断trayCode读到的条码是否属于当前执行订单
      if (
        this.currentOrder.qrCode &&
        this.currentOrder.qrCode.includes(trayCode)
      ) {
        // 如果属于当前订单，给PLC发送三楼A接货口启用命令DBW518：1
        ipcRenderer.send('writeValuesToPLC', 'DBW518', 1);
        // 使用新的单次写入方法，写入DB101.DBW588值为11，1秒内发送3次
        ipcRenderer.send('writeSingleValueToPLC', 'DBW588', 11);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW588');
        }, 2000);
        this.addLog(
          `${source}：托盘${trayCode}属于当前订单，已启用三楼A接货口，给PLC发送DBW588值为11`
        );
      } else {
        // 如果不属于当前订单，直接给PLC发送三楼A接货口禁用命令DBW518：0
        ipcRenderer.send('writeValuesToPLC', 'DBW518', 0);
        // 发送进货异常报警DB101.DBW588
        ipcRenderer.send('writeSingleValueToPLC', 'DBW588', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW588');
        }, 2000);
        this.addLog(
          `${source}：托盘${trayCode}不属于当前订单，已禁用三楼A接货口`,
          'alarm'
        );
      }
    },
    // trayCode条码号，source来源：'PC'/'PDA'
    jiehuo3B(trayCode, source) {
      // 检查是否在无码模式执行中
      if (this.isModeExecuting && this.controlMode === 'nocode') {
        // 检查上货口计数是否已达到目标
        if (this.nocodeCurrentCount >= this.nocodeTargetCount) {
          // 已达到目标数量，禁止继续上货
          ipcRenderer.send('writeValuesToPLC', 'DBW520', 0);
          ipcRenderer.send('writeSingleValueToPLC', 'DBW590', 10);
          setTimeout(() => {
            ipcRenderer.send('cancelWriteToPLC', 'DBW590');
          }, 2000);
          this.addLog(
            `${source}：【无码模式】上货口计数已满（${this.nocodeCurrentCount}/${this.nocodeTargetCount}），禁止继续上货`,
            'alarm'
          );
          return;
        }

        // 无码模式：直接通行，不判断订单包含，并增加计数
        // 注意：DBW520等接货口控制命令由复选框单独控制，这里不再发送
        ipcRenderer.send('writeSingleValueToPLC', 'DBW590', 11);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW590');
        }, 2000);

        // 增加无码模式上货口计数
        this.nocodeCurrentCount++;
        this.addLog(
          `${source}：【无码模式】托盘${trayCode}直接通行三楼B接货口（上货口计数：${this.nocodeCurrentCount}/${this.nocodeTargetCount}）`
        );
        return;
      }

      // 普通模式（MSE控制模式）：按原有逻辑执行
      // 3、如果正常，先判断当前有没有正在执行的订单
      if (!this.currentOrder) {
        // 没有正在执行的订单，禁用接货口0
        ipcRenderer.send('writeValuesToPLC', 'DBW520', 0);
        // 发送进货异常报警DB101.DBW590
        ipcRenderer.send('writeSingleValueToPLC', 'DBW590', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW590');
        }, 2000);
        this.addLog(`${source}：当前无执行订单，已禁用三楼B接货口`, 'alarm');
        return;
      }

      // 4、判断trayCode读到的条码是否属于当前执行订单
      if (
        this.currentOrder.qrCode &&
        this.currentOrder.qrCode.includes(trayCode)
      ) {
        // 如果属于当前订单，给PLC发送三楼B接货口启用命令DBW520：1
        ipcRenderer.send('writeValuesToPLC', 'DBW520', 1);
        // 使用新的单次写入方法，写入DB101.DBW590值为11，1秒内发送3次
        ipcRenderer.send('writeSingleValueToPLC', 'DBW590', 11);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW590');
        }, 2000);
        this.addLog(
          `${source}：托盘${trayCode}属于当前订单，已启用三楼B接货口，给PLC发送DBW590值为11`
        );
      } else {
        // 如果不属于当前订单，直接给PLC发送三楼B接货口禁用命令DBW520：0
        ipcRenderer.send('writeValuesToPLC', 'DBW520', 0);
        // 发送进货异常报警DB101.DBW590
        ipcRenderer.send('writeSingleValueToPLC', 'DBW590', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW590');
        }, 2000);
        this.addLog(
          `${source}：托盘${trayCode}不属于当前订单，已禁用三楼B接货口`,
          'alarm'
        );
      }
    },
    // scanCode条码号，source来源：'PC'/'PDA'
    xiahuosaoma(scanCode, source) {
      this.addLog(`${source}：读取到下货条码：${scanCode}`);

      // 1、通过下货条码的托盘码，查找A3-G3队列符合的托盘
      const targetQueues = [15, 16, 17, 18, 19, 20, 21]; // A3-G3队列索引
      let foundTray = null;
      let sourceQueueIndex = -1;

      for (let queueIndex of targetQueues) {
        const queue = this.queues[queueIndex];
        if (queue.trayInfo && Array.isArray(queue.trayInfo)) {
          const trayIndex = queue.trayInfo.findIndex(
            (tray) => tray.trayCode === scanCode
          );

          if (trayIndex !== -1) {
            foundTray = queue.trayInfo[trayIndex];
            sourceQueueIndex = queueIndex;
            break;
          }
        }
      }

      if (!foundTray) {
        this.addLog(
          `${source}：在A3-G3队列中未找到匹配的托盘：${scanCode}，已发送报警信号`,
          'alarm'
        );
        ipcRenderer.send('writeSingleValueToPLC', 'DBW592', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW592');
        }, 2000);
        return;
      }

      this.addLog(
        `${source}：在队列${this.queues[sourceQueueIndex].queueName}中找到匹配托盘：${scanCode}`
      );

      // 3、根据目的地选择给PLC发送下发目的地命令
      if (!this.destinationSelected) {
        this.addLog(`${source}：目的地未选择，无法发送目的地命令`);
        ipcRenderer.send('writeSingleValueToPLC', 'DBW592', 10);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW592');
        }, 2000);
        return;
      }

      // 根据图片协议：01一楼下货口，02二楼A解析出口，03二楼B解析出口
      const destinationValue = this.destinationSelected;

      // 发送目的地命令到PLC - 根据协议图片，使用DBW542地址
      ipcRenderer.send(
        'writeSingleValueToPLC',
        'DBW542',
        parseInt(destinationValue)
      );
      ipcRenderer.send('writeSingleValueToPLC', 'DBW592', 11);
      setTimeout(() => {
        ipcRenderer.send('cancelWriteToPLC', 'DBW542');
        ipcRenderer.send('cancelWriteToPLC', 'DBW592');
      }, 2000);
      this.addLog(
        `${source}：发送目的地命令：${this.getDestinationText(
          destinationValue
        )}，命令值：${destinationValue}到PLC地址DBW542，已给PLC发送DBW592扫码反馈通行11命令`
      );
      // 4、把找到的托盘移到下货区队列去
      const downLoadQueue = this.queues[22]; // 下货区队列索引为22

      // 从源队列中移除托盘
      this.queues[sourceQueueIndex].trayInfo.splice(
        this.queues[sourceQueueIndex].trayInfo.findIndex(
          (t) => t.trayCode === scanCode
        ),
        1
      );

      // 检查出库执行状态，如果当前执行的队列为空则取消执行状态
      this.checkOutboundExecuteStatus(this.outboundSelectedQueue);

      // 添加到下货区队列
      if (!downLoadQueue.trayInfo) {
        downLoadQueue.trayInfo = [];
      }

      // 为托盘添加进入下货队列时间属性
      const trayWithEntryTime = {
        ...foundTray,
        entryTime: new Date().getTime() // 记录进入下货队列的时间戳
      };

      downLoadQueue.trayInfo.push(trayWithEntryTime);

      this.addLog(
        `${source}：托盘${scanCode}已从${this.queues[sourceQueueIndex].queueName}移动到下货区队列`
      );
    },

    // 启动托盘清理定时器
    startTrayCleanupTimer() {
      // 每10秒检查一次下货区队列中的托盘
      setInterval(() => {
        this.cleanupExpiredTrays();
      }, 10 * 1000); // 10秒 = 10 * 1000 毫秒
    },

    // 清理超过10分钟的托盘
    cleanupExpiredTrays() {
      const downLoadQueue = this.queues[22]; // 下货区队列索引为22

      if (!downLoadQueue.trayInfo || !Array.isArray(downLoadQueue.trayInfo)) {
        return;
      }

      const currentTime = new Date().getTime();
      const tenMinutesInMs = 10 * 60 * 1000; // 10分钟 = 10 * 60 * 1000 毫秒
      // const tenMinutesInMs = 10000; // 10秒 = 10 * 1000 毫秒测试

      // 找出需要删除的托盘索引（从后往前删除，避免索引变化）
      const indicesToRemove = [];

      downLoadQueue.trayInfo.forEach((tray, index) => {
        if (tray.entryTime && currentTime - tray.entryTime > tenMinutesInMs) {
          indicesToRemove.push(index);
        }
      });

      // 从后往前删除，避免索引变化
      indicesToRemove.reverse().forEach((index) => {
        const removedTray = downLoadQueue.trayInfo.splice(index, 1)[0];
        this.addLog(
          `自动清理：托盘${removedTray.trayCode}在下货区队列中停留超过10分钟，已自动删除`,
          'running'
        );
      });

      if (indicesToRemove.length > 0) {
        this.addLog(
          `自动清理完成：共清理了${indicesToRemove.length}个超时托盘`,
          'running'
        );
      }
    }
  }
};
</script>
<style lang="less" scoped>
.smart-workshop {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle, #83b3de, #ffffff);
  padding: 0;
  font-family: 'Roboto', sans-serif;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: 10px;
  user-select: none;
  .header {
    position: relative;
    width: 100%;
    height: 80px;
    overflow: hidden;
    flex-shrink: 0;
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
    }
  }
  .content-wrapper {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
    .side-info-panel {
      width: 420px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 5px;
      box-sizing: border-box;
      flex-shrink: 0;
      overflow: hidden;
      .plc-info-section,
      .operation-panel,
      .order-list-section {
        background: #052438;
        padding: 10px;
        border-radius: 15px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        color: #f5f5f5;
        box-sizing: border-box;
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 22px;
          color: #0ac5a8;
          font-weight: 900;
          .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
        .scrollable-content {
          overflow-y: auto;
        }
      }
      .plc-info-section {
        .scrollable-content {
          .status-overview {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
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
              background-image: linear-gradient(
                to right,
                rgba(72, 146, 254, 1),
                rgba(71, 207, 245, 1)
              );
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
          }
        }
      }
      .order-list-section {
        height: 300px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        .section-header {
          .section-title {
            .title-actions {
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .refresh-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 28px;
              height: 28px;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.3s ease;
              margin-left: 0; /* 移除左边距 */
              margin-right: 0; /* 移除右边距 */
              background: rgba(10, 197, 168, 0.2);
              border: 1px solid rgba(10, 197, 168, 0.3);
              i {
                font-size: 16px;
                color: #0ac5a8;
                transition: all 0.3s ease;
              }
            }

            .refresh-btn:hover {
              background: rgba(10, 197, 168, 0.3);
              border-color: rgba(10, 197, 168, 0.5);
              i {
                color: #fff;
              }
            }

            .refresh-btn.is-loading i {
              animation: rotate 1s linear infinite;
            }

            .add-order-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 28px;
              height: 28px;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.3s ease;
              background: rgba(64, 158, 255, 0.2);
              border: 1px solid rgba(64, 158, 255, 0.3);
              i {
                font-size: 16px;
                color: #409eff;
                transition: all 0.3s ease;
              }
            }

            .add-order-btn:hover {
              background: rgba(64, 158, 255, 0.3);
              border-color: rgba(64, 158, 255, 0.5);
              i {
                color: #fff;
              }
            }
          }
          .order-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            .el-button {
              background: rgba(10, 197, 168, 0.2);
              border: 1px solid rgba(10, 197, 168, 0.3);
              color: #0ac5a8;
              font-size: 12px;
              height: 28px;
              padding: 0 12px;
              display: flex;
              align-items: center;
              gap: 4px;
              transition: all 0.3s ease;
              i {
                font-size: 14px;
              }
            }
            .el-button:hover {
              background: rgba(10, 197, 168, 0.3);
              border-color: rgba(10, 197, 168, 0.5);
              color: #fff;
            }
          }
        }
        .scrollable-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 10px;
          margin-right: -10px;
          .order-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 8px 0;
            width: 100%;
            box-sizing: border-box;
            .order-item {
              width: 100%;
              box-sizing: border-box;
              background: linear-gradient(
                90deg,
                rgba(30, 42, 56, 0.95) 0%,
                rgba(48, 65, 86, 0.85) 50%,
                rgba(48, 65, 86, 0.75) 100%
              );
              border-radius: 6px;
              padding: 12px 15px;
              position: relative;
              transition: all 0.3s ease;
              position: relative;
              height: 120px; /* 增加高度以适应新增的信息 */
              display: flex;
              align-items: center;
              gap: 15px;
              overflow: hidden;
              cursor: pointer;
              box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

              .delete-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10;
              }

              &:hover .delete-btn {
                opacity: 1;
              }
              .order-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
                min-width: 0;
                padding-right: 100px;
                .order-header {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  margin: 0;
                  padding: 0;
                  border: none;
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
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    i {
                      font-size: 12px;
                    }
                  }
                  .order-status.running {
                    background: rgba(64, 158, 255, 0.15);
                    color: #409eff;
                  }
                }
                .order-info {
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                  padding: 0;
                  .info-row {
                    display: flex;
                    align-items: center;
                    gap: 20px; /* 增加间距 */
                  }
                  .info-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                    min-width: 0;
                    .info-label {
                      color: rgba(255, 255, 255, 0.45);
                      font-size: 12px;
                      white-space: nowrap;
                      width: 50px; /* 调整标签宽度 */
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
                  }
                }
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
              .switch-order-btn.complete-btn:hover {
                border-color: rgba(103, 194, 58, 0.4);
              }

              /* 禁用和加载状态 */
              .switch-order-btn:disabled,
              .switch-order-btn.loading {
                cursor: not-allowed;
                opacity: 0.8;
              }
            }

            .order-item:hover {
              background: linear-gradient(
                90deg,
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

            /* 订单类型标识样式 */
            .order-type-badge {
              position: absolute;
              top: 0;
              right: 0;
              padding: 4px 12px;
              font-size: 11px;
              font-weight: bold;
              color: #fff;
              border-bottom-left-radius: 6px;
              border-top-right-radius: 6px;
              z-index: 10;
              background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 5px,
                rgba(255, 255, 255, 0.1) 5px,
                rgba(255, 255, 255, 0.1) 10px
              );
            }

            .order-type-badge.manual {
              background-color: #e6a23c;
              background-image: repeating-linear-gradient(
                45deg,
                #e6a23c,
                #e6a23c 5px,
                #d89b34 5px,
                #d89b34 10px
              );
            }

            .order-type-badge.mse {
              background-color: #409eff;
              background-image: repeating-linear-gradient(
                45deg,
                #409eff,
                #409eff 5px,
                #3a8eeb 5px,
                #3a8eeb 10px
              );
            }
          }
          /* 添加空状态样式 */
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 0;
            color: rgba(255, 255, 255, 0.6);
            i {
              font-size: 48px;
              margin-bottom: 16px;
              color: rgba(255, 255, 255, 0.3);
            }
            p {
              font-size: 14px;
              margin: 0 0 16px 0;
            }
            .el-button {
              color: #0ac5a8;
              font-size: 14px;
              i {
                font-size: 14px;
                margin-right: 4px;
                color: inherit;
              }
            }
            .el-button:hover {
              color: #0db196;
            }
          }
        }
        .scrollable-content::-webkit-scrollbar {
          width: 4px;
        }
        .scrollable-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollable-content::-webkit-scrollbar-thumb {
          background: rgba(10, 197, 168, 0.2);
          border-radius: 2px;
        }
        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: rgba(10, 197, 168, 0.4);
        }
      }
      .log-section {
        background: #052438;
        padding: 10px;
        border-radius: 15px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        height: 257px;
        display: flex;
        flex-direction: column;
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0px 0px 8px 0px;
          color: #0ac5a8;
          font-size: 22px;
          font-weight: 900;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          .log-tabs {
            display: flex;
            gap: 5px;
          }
          .log-tab {
            position: relative;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 5px 15px;
            border-radius: 4px;
            transition: all 0.3s ease;
            .alarm-badge {
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
          }
          .log-tab.active {
            color: #fff;
            background: rgba(10, 197, 168, 0.2);
          }
          .log-tab:hover:not(.active) {
            color: #0ac5a8;
          }
        }
        .scrollable-content {
          flex: 1;
          overflow-y: auto;
          padding: 10px 0;
          .log-list {
            padding: 0 10px;
            width: 100%;
            box-sizing: border-box;
            .log-item {
              background: rgba(255, 255, 255, 0.03);
              border-radius: 4px;
              padding: 10px;
              margin-bottom: 8px;
              cursor: pointer;
              width: 100%;
              box-sizing: border-box;
              .log-time {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.4);
                margin-bottom: 6px;
              }
              .log-item-content {
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
            }
            .log-item:hover {
              background: rgba(255, 255, 255, 0.05);
            }

            .log-item.alarm {
              background: rgba(245, 108, 108, 0.05);
            }

            .log-item.alarm.unread {
              background: rgba(245, 108, 108, 0.1);
              border-left: 2px solid #f56c6c;
            }
            /* 添加空状态样式 */
            .empty-state {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 40px 0;
              color: rgba(255, 255, 255, 0.6);
              i {
                font-size: 48px;
                margin-bottom: 16px;
                color: rgba(255, 255, 255, 0.3);
              }
              p {
                font-size: 14px;
                margin: 0 0 16px 0;
              }
              .el-button {
                color: #0ac5a8;
                font-size: 14px;
                i {
                  font-size: 14px;
                  margin-right: 4px;
                  color: inherit;
                }
              }
              .el-button:hover {
                color: #0db196;
              }
            }
          }
        }
        .scrollable-content::-webkit-scrollbar {
          width: 4px;
        }

        .scrollable-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollable-content::-webkit-scrollbar-thumb {
          background: rgba(10, 197, 168, 0.2);
          border-radius: 2px;
        }

        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: rgba(10, 197, 168, 0.4);
        }
      }
      .operation-panel {
        .operation-buttons {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-top: 5px;
          padding: 5px;
          button {
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
            i {
              font-size: 1.8em;
            }
            span {
              font-size: 12px;
              margin-top: 4px;
            }
          }
          button:hover {
            background: linear-gradient(135deg, #4caf50, #0f6b58);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          }
          button.pressed {
            background: linear-gradient(135deg, #4caf50, #2e8b57);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
            transform: scale(0.95);
          }
        }
      }
    }
    .main-content {
      flex: 1;
      display: flex;
      padding: 5px 5px 5px 0px;
      box-sizing: border-box;
      overflow: hidden;
      height: 100%;
      .floor-container {
        display: flex;
        gap: 5px;
        height: 100%;
        width: 100%;
        min-height: 0;

        .floor-left,
        .floor-right > .floor-right-top,
        .floor-right-bottom {
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
            .image-wrapper {
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              .floor-image {
                display: block;
                max-width: 100%;
                max-height: 100%;
                width: auto;
                height: auto;
                object-fit: contain;
              }
              /* --- 光电点位样式 --- */
              .marker {
                position: absolute;
                width: 12px;
                height: 12px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 2;
                pointer-events: auto;
                .marker-label {
                  position: absolute;
                  white-space: nowrap;
                  background: #0ac5a8;
                  color: #fff;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  /* 默认定位在下方 */
                  top: calc(100% + 5px);
                  left: 50%;
                  transform: translateX(-50%);
                  opacity: 0;
                  transition: opacity 0.3s;
                  pointer-events: none; /* 添加此行 */
                  z-index: 10; /* 确保标签在点位之上 */
                }
              }
              .marker::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: rgba(128, 128, 128, 0.8); /* 默认灰色核心 */
              }
              /* 扫描状态 (红色) */
              .marker.scanning::before {
                background: rgba(255, 0, 0, 0.8); /* 红色核心 */
              }

              /* 默认隐藏标签，hover时显示 */
              .marker:hover .marker-label {
                opacity: 1;
                box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); /* 灰色辉光 */
              }

              /* --- 门状态元素样式 --- */
              .door-status-marker {
                position: absolute;
                width: 40px;
                height: 20px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 2;
                pointer-events: auto;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;

                .door-status-label {
                  font-size: 10px;
                  color: #fff;
                  background: rgba(0, 0, 0, 0.7);
                  padding: 2px 4px;
                  border-radius: 2px;
                  white-space: nowrap;
                  opacity: 0;
                  transition: opacity 0.3s;
                  pointer-events: none;
                  z-index: 10;
                }

                .door-status-indicator {
                  width: 40px;
                  height: 12px;
                  border-radius: 6px;
                  transition: all 0.3s ease;
                  border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .door-status-indicator.door-open {
                  background: #67c23a; /* 绿色 - 门开启 */
                  box-shadow: 0 0 8px rgba(103, 194, 58, 0.6);
                }

                .door-status-indicator.door-closed {
                  background: #f56c6c; /* 红色 - 门关闭 */
                  box-shadow: 0 0 8px rgba(245, 108, 108, 0.6);
                }
              }

              /* hover时显示标签 */
              .door-status-marker:hover .door-status-label {
                opacity: 1;
              }
              /* 始终显示标签的点位 */
              .marker-show-label .marker-label {
                opacity: 1;
              }
              /* 控制标签位置的样式 */
              .marker.label-top .marker-label {
                top: auto; /* 重置默认 top */
                bottom: calc(100% + 5px); /* 定位到上方 */
                left: 50%;
                transform: translateX(-50%);
              }
              .marker.label-left .marker-label {
                top: 50%; /* 垂直居中 */
                left: auto; /* 重置默认 left */
                right: calc(100% + 5px); /* 定位到左方 */
                transform: translateY(-50%); /* 垂直居中 */
              }
              .marker.label-right .marker-label {
                top: 50%; /* 垂直居中 */
                left: calc(100% + 5px); /* 定位到右方 */
                transform: translateY(-50%); /* 垂直居中 */
              }
              /* --- 光电点位样式结束 --- */

              /* --- 新增电机点位样式 --- */
              .motor-marker {
                position: absolute;
                width: 12px;
                height: 12px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 2;
                pointer-events: auto;
                .marker-label {
                  position: absolute;
                  white-space: nowrap;
                  background: rgba(0, 0, 0, 0.8);
                  color: #fff;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  /* 默认定位在下方 */
                  top: calc(100% + 5px);
                  left: 50%;
                  transform: translateX(-50%);
                  opacity: 0; /* 默认隐藏 */
                  transition: opacity 0.3s;
                  pointer-events: none; /* 添加此行 */
                  z-index: 10; /* 确保标签在点位之上 */
                }
              }

              .motor-marker::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(128, 128, 128, 0.8); /* 默认灰色方块 */
                /* 无 border-radius，保持方形 */
              }

              .motor-marker.running::before {
                background: #00ff3f; /* 运行状态绿色方块 */
              }

              /* 默认隐藏标签，hover时显示 */
              .motor-marker:hover .marker-label {
                opacity: 1;
              }
              /* 始终显示标签的点位 */
              .motor-marker.marker-show-label .marker-label {
                opacity: 1;
              }

              /* 控制电机标签位置的样式 (复制并适配) */
              .motor-marker.label-top .marker-label {
                top: auto;
                bottom: calc(100% + 5px);
                left: 50%;
                transform: translateX(-50%);
              }
              .motor-marker.label-left .marker-label {
                top: 50%;
                left: auto;
                right: calc(100% + 5px);
                transform: translateY(-50%);
              }
              .motor-marker.label-right .marker-label {
                top: 50%;
                left: calc(100% + 5px);
                transform: translateY(-50%);
              }
              /* --- 电机点位样式结束 --- */

              /* 带数据面板的标识点样式 */
              .marker-with-panel {
                position: absolute;
                width: 16px;
                height: 16px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 2;
                .data-panel {
                  position: absolute;
                  background: linear-gradient(135deg, #0e1a27, #3c4c63);
                  border: 1px solid rgba(64, 158, 255, 0.3);
                  border-radius: 8px;
                  padding: 12px;
                  width: 200px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                  opacity: 0;
                  transition: all 0.3s ease;
                  pointer-events: none;
                  z-index: 10; /* 确保数据面板在点位之上 */
                  .data-panel-header {
                    font-size: 14px;
                    color: #409eff;
                    margin-bottom: 6px;
                    padding-bottom: 6px;
                    border-bottom: 1px solid rgba(64, 158, 255, 0.2);
                  }
                  .data-panel-content {
                    font-size: 12px;
                    .data-panel-row {
                      display: flex;
                      justify-content: space-between;
                      color: rgba(255, 255, 255, 0.9);
                      .data-panel-label {
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 12px;
                      }
                    }
                  }
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
                /* 始终显示的面板 */
                .data-panel.always-show {
                  opacity: 1;
                  pointer-events: auto; /* 重新启用指针事件 */
                }
                /* 竖向布局样式 */
                .data-panel.vertical-layout {
                  width: 110px;
                  padding: 8px;
                  .data-panel-row {
                    flex-direction: column;
                    gap: 4px;
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                  }
                  /* 无码模式复选框样式 */
                  .nocode-checkbox-row {
                    display: flex;
                    justify-content: space-between;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                  }
                  .nocode-checkbox-row :deep(.el-checkbox) {
                    color: rgba(255, 255, 255, 0.9);
                  }
                  .nocode-checkbox-row :deep(.el-checkbox__label) {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 12px;
                  }
                  .nocode-checkbox-row
                    :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
                    background-color: #0ac5a8;
                    border-color: #0ac5a8;
                  }
                  .nocode-checkbox-row
                    :deep(
                      .el-checkbox__input.is-checked + .el-checkbox__label
                    ) {
                    color: #0ac5a8;
                  }
                  .data-panel-label {
                    margin-bottom: 2px;
                  }
                }
              }
              /* 悬停时显示面板 */
              .marker-with-panel:hover .data-panel:not(.always-show) {
                opacity: 1;
              }
              /* 预热房选择样式 */
              .preheating-room-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                z-index: 10;
                background: linear-gradient(135deg, #005aff 0%, #000000 100%);
                border-radius: 5px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                width: 80px;
                .preheating-room-content {
                  display: flex;
                  flex-direction: column;
                  width: 100%;
                  .preheating-room-header {
                    width: 100%;
                    text-align: center;
                    padding: 4px 0;
                    font-size: 11px;
                    color: white;
                    background-color: rgba(0, 0, 0, 0.2);
                    font-weight: bold;
                  }
                  .preheating-room-body {
                    padding: 6px 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 6px;
                  }
                }
              }
              .preheating-room-marker :deep(.el-select) {
                width: 100%;
              }
              .preheating-room-marker :deep(.el-input__inner) {
                background-color: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.2);
                color: #fff;
                height: 24px;
                line-height: 24px;
                font-size: 11px;
                border-radius: 3px;
                padding: 0 8px;
              }
              .preheating-room-marker :deep(.el-button) {
                font-size: 11px;
                height: 24px;
                width: 100%;
                padding: 4px 8px;
              }
              .nocode-outbound-checkbox {
                margin-top: 4px;
                width: 100%;
                display: flex;
                justify-content: center;
              }
              .nocode-outbound-checkbox :deep(.el-checkbox) {
                color: white;
                font-size: 10px;
              }
              .nocode-outbound-checkbox :deep(.el-checkbox__label) {
                color: white;
                font-size: 10px;
              }
            }
          }
        }
        .floor-left {
          flex: 1;
          background: #07293e;
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
          .floor-title {
            font-size: 22px;
            color: #0ac5a8;
            font-weight: 900;
            padding-bottom: 10px;
            flex-shrink: 0;
          }
          .floor-image-container {
            .image-wrapper {
              // 模式选择卡片样式
              .mode-control-card {
                position: absolute;
                z-index: 100;

                .mode-card-content {
                  background: rgba(30, 42, 56);
                  border: 1px solid rgba(10, 197, 168, 0.5);
                  border-radius: 8px;
                  padding: 8px;
                  width: 130px;

                  .mode-card-header {
                    font-size: 14px;
                    font-weight: bold;
                    color: #0ac5a8;
                    margin-bottom: 12px;
                    text-align: center;
                    border-bottom: 1px solid rgba(10, 197, 168, 0.3);
                    padding-bottom: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;

                    i {
                      font-size: 16px;
                    }
                  }

                  .mode-card-body {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;

                    .mode-select-row {
                      width: 100%;
                    }

                    .nocode-config-row {
                      display: flex;
                      flex-direction: column;
                      gap: 8px;
                      padding: 8px;
                      background: rgba(10, 197, 168, 0.1);
                      border-radius: 4px;
                      border: 1px solid rgba(10, 197, 168, 0.3);

                      .config-item {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;

                        .config-label {
                          color: #bbb;
                          font-size: 12px;
                          white-space: nowrap;
                        }
                      }

                      .nocode-progress {
                        text-align: center;
                        color: #67c23a;
                        font-size: 13px;
                        font-weight: bold;
                        padding: 4px 0;
                        border-top: 1px solid rgba(10, 197, 168, 0.2);
                        margin-top: 4px;
                      }
                    }

                    .mode-actions-row {
                      width: 100%;
                      display: flex;
                      align-items: center;
                      gap: 8px;

                      .executing-state {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        width: 100%;

                        .executing-info {
                          display: flex;
                          align-items: center;
                          gap: 4px;
                          color: #67c23a;
                          font-size: 12px;
                          flex: 1;

                          i {
                            animation: rotate 1s linear infinite;
                          }
                        }
                      }
                    }
                  }
                }
              }

              .queue-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 10;
                background: rgba(10, 30, 50, 0.85);
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid rgba(64, 158, 255, 0.5);
                transition: all 0.3s ease;
                min-width: 40px;
                text-align: center;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                color: #ffffff;
                .queue-marker-content {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  color: #fff;
                  font-size: 12px;
                  .queue-marker-name {
                    color: #fff;
                  }

                  .queue-marker-count {
                    font-size: 14px;
                    font-weight: bold;
                    color: #409eff;
                  }
                }
              }
              .queue-marker:hover {
                background: rgba(24, 61, 97, 0.9);
                border-color: rgba(64, 158, 255, 0.6);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
              }
              /* 状态卡片样式 - 只在完成时显示，直接使用完成样式 */
              .status-card {
                position: absolute;
                transform: translate(-50%, -50%);
                background-color: #00cc44;
                padding: 3px 6px;
                border-radius: 4px;
                border: 1px solid #00aa33;
                width: 40px;
                text-align: center;
                transition: all 0.3s ease;
                pointer-events: none;
              }
              .status-card-title {
                font-size: 10px;
                font-weight: bold;
                color: #ffffff;
                margin-bottom: 1px;
              }
              .status-card-destination {
                font-size: 8px;
                color: #ffffff;
                font-weight: bold;
                white-space: nowrap;
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
            }
          }
        }

        .floor-right {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-height: 0;
          height: 100%;
          .floor-right-top,
          .floor-right-bottom {
            flex: 1;
            background: #07293e;
            padding: 10px;
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
            color: #f5f5f5;
            display: flex;
            flex-direction: column;
            min-height: 0;
            height: calc(50% - 5px);
            overflow: hidden;
            .floor-title {
              font-size: 22px;
              color: #0ac5a8;
              font-weight: 900;
              padding-bottom: 10px;
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }
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
    /* 基础样式 */
    .queue-section {
      background: rgba(30, 42, 56, 0.95);
      border-radius: 15px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
      color: #f5f5f5;
      box-sizing: border-box;
      border: 1px solid rgba(255, 255, 255, 0.1);
      .section-header {
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
        .queue-container {
          flex: 1;
          display: flex;
          background: rgba(30, 42, 56, 0.9);
          border-radius: 12px;
          padding: 15px;
          gap: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: 100%;
          min-height: 0;
          box-sizing: border-box;
          .queue-container-left {
            width: 280px;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            padding-right: 15px;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            height: 100%;
            min-height: 0;
            /* 队列项样式 */
            .queue {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: rgba(48, 65, 85, 0.9);
              border-radius: 8px;
              padding: 12px 15px;
              margin-bottom: 8px;
              cursor: pointer;
              transition: all 0.3s ease;
              border: 1px solid rgba(255, 255, 255, 0.15);
              .tray-count {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                padding: 2px 8px;
                border-radius: 10px;
                min-width: 24px;
                text-align: center;
              }
            }

            .queue:hover {
              background: rgba(48, 65, 85, 1);
              border-color: rgba(10, 197, 168, 0.5);
              transform: translateX(2px);
            }

            .queue.active {
              background: rgba(10, 197, 168, 0.15);
              border-color: rgba(10, 197, 168, 0.5);
            }
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
          .queue-container-right {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 0 15px;
            height: 100%;
            min-height: 0;
            .selected-queue-header {
              flex-shrink: 0;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              display: flex;
              justify-content: space-between;
              align-items: center;
              h3 {
                margin: 0;
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
              }
              .queue-header-actions {
                display: flex;
                align-items: center;
                gap: 12px;
                .el-button {
                  background: rgba(10, 197, 168, 0.2);
                  border: 1px solid rgba(10, 197, 168, 0.3);
                  color: #0ac5a8;
                }
                .el-button:hover:not(:disabled) {
                  background: rgba(10, 197, 168, 0.3);
                  border-color: rgba(10, 197, 168, 0.5);
                  color: #fff;
                }
                .tray-total {
                  background: rgba(255, 255, 255, 0.1);
                  color: rgba(255, 255, 255, 0.7);
                  font-size: 13px;
                  padding: 4px 12px;
                  border-radius: 15px;
                  cursor: pointer;
                }
              }
            }
            .tray-list {
              flex: 1;
              overflow-y: auto;
              min-height: 0;
              padding-right: 5px;

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
                position: relative;

                .tray-info {
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                  width: 100%;
                  .tray-info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;

                    .tray-name {
                      font-weight: 700;
                      color: rgba(255, 255, 255, 0.9);
                      font-size: 12px;
                      flex-shrink: 0;
                    }

                    .tray-batch {
                      font-size: 11px;
                      color: #0ac5a8;
                      background: rgba(10, 197, 168, 0.1);
                      padding: 2px 6px;
                      border-radius: 3px;
                      white-space: nowrap;
                      flex-shrink: 0;
                      margin-left: auto;
                    }

                    // 名称和规格在同一行的样式
                    &.name-spec-row {
                      display: flex;
                      gap: 12px;

                      .name-spec-item {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        min-width: 0; // 允许内容收缩
                      }
                    }

                    span {
                      font-size: 11px;
                      color: rgba(255, 255, 255, 0.7);
                      white-space: nowrap;
                    }

                    &.status-row {
                      justify-content: flex-start;
                      gap: 15px;
                    }
                  }
                  .tray-time {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                  }
                }
                .el-button {
                  position: absolute;
                  right: 0px;
                  top: 0px;
                  opacity: 0;
                  transition: opacity 0.3s ease;
                  z-index: 10;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }
              }
              .tray-item:hover {
                background: rgba(48, 65, 85, 1);
                border-color: rgba(10, 197, 168, 0.5);
                transform: translateX(2px);
                .el-button {
                  opacity: 1;
                }
              }
              .tray-item:last-child {
                margin-bottom: 0;
              }
              .tray-item.dragging {
                opacity: 0.6;
                transform: scale(0.98);
                border: 1px dashed rgba(255, 255, 255, 0.3);
              }
              /* 添加空状态样式 */
              .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 0;
                color: rgba(255, 255, 255, 0.6);
                i {
                  font-size: 48px;
                  margin-bottom: 16px;
                  color: rgba(255, 255, 255, 0.3);
                }
                p {
                  font-size: 14px;
                  margin: 0 0 16px 0;
                }
                .el-button {
                  color: #0ac5a8;
                  font-size: 14px;
                  i {
                    font-size: 14px;
                    margin-right: 4px;
                    color: inherit;
                  }
                }
                .el-button:hover {
                  color: #0db196;
                }
              }
            }
          }
        }
      }
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
    /* 收起状态的样式 */
    .queue-section:not(.expanded) {
      width: 40px;
      height: 40px;
      padding: 0;
      background: none;
      box-shadow: none;
      border: none;
      .section-header {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #0ac5a8;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
        /* 简化过渡效果，减少GPU负担 */
        transition: background-color 0.3s ease;
        padding: 0;
        span {
          display: none;
        }
        i {
          color: #fff;
          font-size: 20px;
        }
      }
      .section-header:hover {
        transform: scale(1.1);
        background: #0db196;
      }
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}

/* 添加新的测试面板样式 */
.test-panel {
  position: absolute;
  right: 50px;
  top: 0;
  width: 300px;
  max-height: 80vh; /* 限制最大高度为视窗高度的80% */
  background: rgba(30, 42, 56, 0.98);
  border: 1px solid rgba(10, 197, 168, 0.3);
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  /* 简化过渡效果，减少GPU负担 */
  transition: opacity 0.3s ease;
  transform-origin: top right;
  opacity: 1;
  transform: scale(1);
  display: flex;
  flex-direction: column;
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
  flex-shrink: 0;
}

/* 添加滚动条样式 */
.test-panel-content::-webkit-scrollbar {
  width: 4px;
}

.test-panel-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.test-panel-content::-webkit-scrollbar-thumb {
  background: rgba(10, 197, 168, 0.3);
  border-radius: 2px;
}

.test-panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(10, 197, 168, 0.5);
}

.test-panel-header i.rotated {
  transform: rotate(180deg);
}

.test-panel-container {
  position: absolute; /* 修改位置，为测试按钮留出空间 */
  right: 80px; /* 修改位置，为队列按钮留出空间 */
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
  /* 简化过渡效果，减少GPU负担 */
  transition: background-color 0.3s ease;
}

.test-toggle-btn:hover {
  transform: scale(1.1);
  background: #0db196;
}

.test-toggle-btn i {
  color: #fff;
  font-size: 20px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.test-panel.collapsed {
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
}

.test-panel-content {
  padding: 15px;
  overflow-y: auto;
  pointer-events: auto;
  flex: 1;
}

.test-panel-header i {
  cursor: pointer;
  /* 只对必要的属性使用过渡，减少GPU负担 */
  transition: color 0.3s ease;
}

.test-panel-header i:hover {
  color: #ff4d4f;
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
/* 测试添加结束 */

.qrcode-test-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.qrcode-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qrcode-label {
  width: 80px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.qrcode-input {
  flex: 1;
}

.qrcode-input :deep(.el-input__inner) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(10, 197, 168, 0.3);
  color: #fff;
}

.qrcode-input :deep(.el-input__inner:hover),
.qrcode-input :deep(.el-input__inner:focus) {
  border-color: #0ac5a8;
}

.qrcode-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
}

.qrcode-actions .el-button {
  background: rgba(10, 197, 168, 0.2);
  border: 1px solid rgba(10, 197, 168, 0.3);
  color: #0ac5a8;
}

.qrcode-actions .el-button:hover {
  background: rgba(10, 197, 168, 0.3);
  border-color: rgba(10, 197, 168, 0.5);
  color: #fff;
}

.cart-position-test-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

/* 光电信号测试面板样式 */
.photoelectric-test-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.photoelectric-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

/* 完成信号测试面板样式 */
.signal-test-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.signal-test-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.photoelectric-buttons .el-button {
  background: rgba(10, 197, 168, 0.2);
  border: 1px solid rgba(10, 197, 168, 0.3);
  color: #0ac5a8;
  font-size: 12px;
  padding: 8px 12px;
  height: auto;
  line-height: 1.2;
  white-space: normal;
  word-break: break-word;
}

.photoelectric-buttons .el-button:hover {
  background: rgba(10, 197, 168, 0.3);
  border-color: rgba(10, 197, 168, 0.5);
  color: #fff;
}

.photoelectric-buttons .el-button:active {
  background: rgba(10, 197, 168, 0.4);
  transform: scale(0.98);
}

.cart-position-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-position-label {
  width: 120px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.cart-position-slider-container {
  flex: 1;
}

.cart-position-slider {
  width: 100%;
}

.cart-value {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* 队列数量测试面板样式 */
.queue-quantity-test-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.queue-quantity-group {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(10, 197, 168, 0.1);
}

.queue-quantity-label {
  width: 100px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
  font-weight: 500;
}

.queue-quantity-controls {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
}

.quantity-display {
  display: inline-block;
  width: 60px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(10, 197, 168, 0.3);
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  margin-right: 5px;
}

.queue-quantity-controls .el-button {
  background: rgba(10, 197, 168, 0.2);
  border: 1px solid rgba(10, 197, 168, 0.3);
  color: #0ac5a8;
  font-size: 12px;
  padding: 8px 12px;
  height: 32px;
  line-height: 1;
  min-width: 32px;
}

.queue-quantity-controls .el-button:hover {
  background: rgba(10, 197, 168, 0.3);
  border-color: rgba(10, 197, 168, 0.5);
  color: #fff;
}

.queue-quantity-controls .el-button.el-button--danger {
  background: rgba(245, 108, 108, 0.2);
  border: 1px solid rgba(245, 108, 108, 0.3);
  color: #f56c6c;
}

.queue-quantity-controls .el-button.el-button--danger:hover {
  background: rgba(245, 108, 108, 0.3);
  border-color: rgba(245, 108, 108, 0.5);
  color: #fff;
}

.queue-quantity-actions {
  display: flex;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
}

.queue-quantity-actions .el-button {
  background: rgba(10, 197, 168, 0.2);
  border: 1px solid rgba(10, 197, 168, 0.3);
  color: #0ac5a8;
  font-size: 13px;
  padding: 8px 16px;
}

.queue-quantity-actions .el-button:hover {
  background: rgba(10, 197, 168, 0.3);
  border-color: rgba(10, 197, 168, 0.5);
  color: #fff;
}
/* 移动端连接状态对话框样式 */
:deep(.mobile-connection-dialog) {
  .connection-status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
  }

  .server-status {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .server-info {
    color: #606266;
    font-size: 14px;
    padding: 4px 8px;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
  }
}

/* 新建订单弹窗样式 */
.add-order-dialog {
  .form-container {
    max-height: 70vh;
    overflow-y: auto;
    padding-right: 10px;
  }

  .form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .form-item {
      flex: 1;
      margin-bottom: 0;
    }
  }

  .tray-codes-section {
    .tray-codes-container {
      .tray-input-section {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
        align-items: center;

        .el-input {
          flex: 1;
        }
      }

      .tray-codes-display {
        .tray-codes-list {
          max-height: 150px;
          overflow-y: auto;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          padding: 10px;
          background-color: #fafafa;

          .tray-code-tag {
            display: inline-flex;
            align-items: center;
            background-color: #409eff;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            margin: 2px;
            font-size: 12px;
            position: relative;

            .tray-code-text {
              margin-right: 8px;
            }

            .remove-btn {
              color: white;
              padding: 0;
              margin: 0;
              font-size: 12px;
              width: 16px;
              height: 16px;
              min-height: 16px;
              line-height: 1;

              &:hover {
                color: #ff4757;
              }
            }
          }
        }
      }
    }
  }
}
</style>
