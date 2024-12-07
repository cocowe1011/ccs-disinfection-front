<template>
  <div class="smart-workshop">
    <!-- 流水线动画区，占整个主区域 -->
    <div class="conveyor-section">
      <SmartFactory class="conveyor-animation"/>
    </div>

    <!-- 左右状态与其他信息区域，悬浮在流水线之上，不遮挡中间 -->
    <div class="side-info-panel left-panel">
      <!-- 日志区域 -->
      <div class="log-section">
        <div class="section-header">
          <h3>日志区</h3>
        </div>
        <div class="expandable-content scrollable-content">
          <ul>
            <li v-for="log in logs" :key="log.id">{{ log.message }}</li>
          </ul>
        </div>
      </div>

      <!-- PLC状态与订单信息区域 -->
      <div class="plc-info-section">
        <div class="section-header">
          <h3>订单信息与PLC状态</h3>
        </div>
        <div class="expandable-content scrollable-content">
          <div class="status-overview">
            <div class="status-item">
              <span class="status-label">PLC状态：</span>
              <span class="status-value" :class="{'connected': plcStatus === '连接中', 'disconnected': plcStatus !== '连接中'}">{{ plcStatus }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">当前上货信息：</span>
              <span class="status-value">{{ currentLoadInfo }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧队列信息区域 -->
    <div class="side-info-panel-queue right-panel" :style="{'width' : isQueueExpanded? '800px': '20%'}">
      <!-- 队列信息区域 -->
      <div class="queue-section" :class="{ 'expanded': isQueueExpanded }">
        <div class="section-header" @click="isQueueExpanded = !isQueueExpanded">
          <h3>队列信息</h3>
          <span class="arrow-icon" :class="{'expanded-arrow': isQueueExpanded}">▼</span>
        </div>
        <div v-if="isQueueExpanded" class="expandable-content-queue">
          <div class="queue-container">
            <div class="queue-contaier-left">
                <div
                  v-for="(tray, trayIndex) in nowTrays"
                  :key="tray.id"
                  class="tray"
                  draggable="true"
                  @dragstart="handleDrag(tray, index, trayIndex)"
                >
                  {{ tray.name }}
                </div>
            </div>
            <div class="queue-contaier-right">
              <div
                v-for="(queue, index) in queues"
                :key="index"
                class="queue"
                @dragover.prevent
                @drop="handleDrop(index)"
                @click="showTrays(index)"
              >
                <h4>{{ queue.name }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SmartFactory from './SmartFactory.vue';
export default {
  name: "MainPage",
  components: {
    SmartFactory
  },
  data() {
    return {
      logs: [{'id':1, 'message': '托盘B 移动到 缓冲1区'}, {'id':2, 'message': '托盘B 移动到 预热区 A1-G2'}, {'id':3, 'message': '托盘B 移动到 缓冲2区'}, {'id':4, 'message': '托盘B 移动到 预热区 A1-G2'}, {'id':5, 'message': '托盘B 移动到 缓冲1区'}],
      plcStatus: '连接中',
      currentLoadInfo: '暂无',
      draggedTray: null,
      isQueueExpanded: false,
      queues: [
        { name: '上货区', trays: [{ id: 1, name: '托盘A' }, { id: 2, name: '托盘B' }] },
        { name: '缓冲1区', trays: [] },
        { name: 'A1', trays: [] },
        { name: 'B1', trays: [] },
        { name: 'C1', trays: [] },
        { name: 'D1', trays: [] },
        { name: 'E1', trays: [] },
        { name: 'F1', trays: [] },
        { name: 'G1', trays: [] },
        { name: 'A2', trays: [] },
        { name: 'B2', trays: [] },
        { name: 'C2', trays: [] },
        { name: 'D2', trays: [] },
        { name: 'E2', trays: [] },
        { name: 'F2', trays: [] },
        { name: 'G2', trays: [] },
        { name: '缓冲2区', trays: [] },
        { name: '消毒区 1#-7#', trays: [] },
        { name: '缓冲3区', trays: [] },
        { name: '下货区', trays: [] },
        { name: '下货区', trays: [] },
        { name: '下货区', trays: [] },
        { name: '下货区', trays: [] },
        { name: '下货区', trays: [] },
        { name: '下货区', trays: [] }
      ],
      nowTrays: []
    };
  },
  methods: {
    showTrays(index) {
      this.nowTrays = this.queues[index].trays
    },
    handleDrag(tray, queueIndex, trayIndex) {
      this.draggedTray = { tray, queueIndex, trayIndex };
    },
    handleDrop(targetQueueIndex) {
      if (this.draggedTray) {
        const { tray, queueIndex, trayIndex } = this.draggedTray;
        // 移除托盘从原始队列
        this.queues[queueIndex].trays.splice(trayIndex, 1);
        // 添加托盘到目标队列
        this.queues[targetQueueIndex].trays.push(tray);
        // 添加日志记录
        this.logs.push({ id: Date.now(), message: `${tray.name} 移动到 ${this.queues[targetQueueIndex].name}` });
        // 清空拖拽状态
        this.draggedTray = null;
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
  align-items: center;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.85), rgba(15, 32, 39, 0.95));
  padding: 0;
  font-family: 'Roboto', sans-serif;
  overflow: hidden;
  box-sizing: border-box;
}

.conveyor-section {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #2a3a46;
  box-sizing: border-box;
  overflow: hidden;
  z-index: 1;
}

.conveyor-animation {
  height: 100%;
  width: 100%;
  border-radius: 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
}

.side-info-panel {
  width: 22%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
}

.side-info-panel-queue {
  width: 22%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
}

.left-panel {
  left: 0;
}

.right-panel {
  right: 0;
}

.log-section,
.plc-info-section,
.queue-section {
  background: rgba(30, 42, 56, 0.8); /* 透明度略小，保持背景效果 */
  padding: 15px;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  color: #f5f5f5;
  box-sizing: border-box;
}

.log-section,
.plc-info-section {
  height: 220px;
  overflow-y: auto;
}

.scrollable-content {
  overflow-y: auto;
  max-height: 180px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: color 0.3s ease;
}

h3 {
  margin: 0;
  font-size: 1.6em;
  color: #0ac5a8;
}

.arrow-icon {
  font-size: 1.8em;
  transition: transform 0.3s ease, color 0.3s ease;
}

.arrow-icon:hover {
  color: #0ac5a8;
}

.expanded-arrow {
  transform: rotate(180deg);
}

.expandable-content {
  max-height: calc(100vh - 100px);
  transition: max-height 0.3s ease-in-out;
}

.expandable-content-queue {
  height: 800px;
  width: 100%;
  display: flex;
}

.status-overview {
  display: flex;
  gap: 25px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.status-label {
  font-weight: bold;
  font-size: 1.2em;
  color: #0ac5a8;
}

.status-value {
  font-size: 1.6em;
  color: #ffffff;
}

.status-value.connected {
  color: #4caf50;
}

.status-value.disconnected {
  color: #f44336;
}

.queue-container {
  display: flex;
  height: 100%;
  width: 100%;
}

.queue-contaier-right {
  width: 280px;
  height: 100%;
  overflow: auto;
}

.queue-contaier-left {
  float: left;
  width: calc(100% - 280px);
  height: 100%;
}

.queue {
  background: #304155;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  width: 240px;
  height: 90px;
  line-height: 90px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  color: #ffffff;
  margin-bottom: 15px;
  cursor: pointer;
  position: relative;
}

.queue:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6);
  background: #4e6d85; /* Hover effect with slight color change */
}

.tray {
  background: linear-gradient(135deg, #4c6a82, #2c3e50);
  color: #ffffff;
  padding: 12px;
  margin: 12px 0;
  border-radius: 12px;
  text-align: center;
  cursor: grab;
  width: 220px;
  height: 55px;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  float: left;
}

.tray:hover {
  background: linear-gradient(135deg, #2e5a8d, #2c3e50);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.5);
}

.tray:active {
  transform: scale(0.98);
}

.queue, .tray {
  transition: transform 0.2s ease;
}

.queue, .tray {
  transition: transform 0.3s ease;
}

.tray:active {
  transform: scale(0.98);
}

/* 自定义滚动条 */
.queue-contaier-right::-webkit-scrollbar {
  width: 12px; /* 设置滚动条的宽度 */
}

.queue-contaier-right::-webkit-scrollbar-thumb {
  background-color: #0ac5a8; /* 滚动条的颜色 */
  border-radius: 10px; /* 滚动条的圆角 */
  border: 3px solid #2a3a46; /* 滚动条的边框颜色 */
  transition: background-color 0.3s ease;
}

.queue-contaier-right::-webkit-scrollbar-thumb:hover {
  background-color: #4caf50; /* 滚动条的悬停颜色 */
}

.queue-contaier-right::-webkit-scrollbar-track {
  background-color: #2a3a46; /* 滚动条轨道背景颜色 */
  border-radius: 10px;
}

.queue-contaier-left::-webkit-scrollbar {
  width: 12px; /* 设置滚动条的宽度 */
}

.queue-contaier-left::-webkit-scrollbar-thumb {
  background-color: #0ac5a8; /* 滚动条的颜色 */
  border-radius: 10px; /* 滚动条的圆角 */
  border: 3px solid #2a3a46; /* 滚动条的边框颜色 */
  transition: background-color 0.3s ease;
}

.queue-contaier-left::-webkit-scrollbar-thumb:hover {
  background-color: #4caf50; /* 滚动条的悬停颜色 */
}

.queue-contaier-left::-webkit-scrollbar-track {
  background-color: #2a3a46; /* 滚动条轨道背景颜色 */
  border-radius: 10px;
}
</style>