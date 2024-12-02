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
    <div class="side-info-panel right-panel">
      <!-- 队列信息区域 -->
      <div class="queue-section" :class="{ 'expanded': isQueueExpanded }">
        <div class="section-header" @click="isQueueExpanded = !isQueueExpanded">
          <h3>队列信息</h3>
          <span class="arrow-icon" :class="{'expanded-arrow': isQueueExpanded}">▼</span>
        </div>
        <div v-if="isQueueExpanded" class="expandable-content full-height">
          <div class="queue-container">
            <div
              v-for="(queue, index) in queues"
              :key="index"
              class="queue"
              @dragover.prevent
              @drop="handleDrop(index)"
            >
              <h4>{{ queue.name }}</h4>
              <div
                v-for="(tray, trayIndex) in queue.trays"
                :key="tray.id"
                class="tray"
                draggable="true"
                @dragstart="handleDrag(tray, index, trayIndex)"
              >
                {{ tray.name }}
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
      logs: ['托盘B 移动到 缓冲1区', '托盘B 移动到 预热区 A1-G2', '托盘B 移动到 缓冲2区', '托盘B 移动到 预热区 A1-G2', '托盘B 移动到 缓冲1区'],
      plcStatus: '连接中',
      currentLoadInfo: '暂无',
      draggedTray: null,
      isQueueExpanded: false,
      queues: [
        { name: '上货区', trays: [{ id: 1, name: '托盘A' }, { id: 2, name: '托盘B' }] },
        { name: '缓冲1区', trays: [] },
        { name: '预热区 A1-G2', trays: [] },
        { name: '缓冲2区', trays: [] },
        { name: '消毒区 1#-7#', trays: [] },
        { name: '缓冲3区', trays: [] },
        { name: '下货区', trays: [] }
      ]
    };
  },
  methods: {
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
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
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
  background: #203a43;
  box-sizing: border-box;
  overflow: hidden;
  z-index: 1;
}

.conveyor-animation {
  height: 100%;
  width: 100%;
  border-radius: 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
}

.side-info-panel {
  width: 20%;
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
  background: rgba(30, 42, 56, 0.8);
  padding: 10px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  color: #ffffff;
  box-sizing: border-box;
}

.log-section,
.plc-info-section {
  height: 200px;
  overflow-y: auto;
}

.scrollable-content {
  overflow-y: auto;
  max-height: 160px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

h3 {
  margin: 0;
  font-size: 1.5em;
  color: #a8d0e6;
}

.arrow-icon {
  font-size: 1.5em;
  transition: transform 0.2s ease;
}

.expanded-arrow {
  transform: rotate(180deg);
}

.expandable-content.full-height {
  max-height: calc(100vh - 80px);
}

.status-overview {
  display: flex;
  gap: 20px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.status-label {
  font-weight: bold;
  font-size: 1.1em;
  color: #a8d0e6;
}

.status-value {
  font-size: 1.5em;
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
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.queue {
  background: #394867;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  width: 200px;
  min-height: 100px;
  transition: transform 0.4s, box-shadow 0.4s;
  color: #ffffff;
}

.queue:hover {
  transform: scale(1.08);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
}

.tray {
  background: linear-gradient(135deg, #3a6073, #16222a);
  color: #ffffff;
  padding: 10px;
  margin: 10px 0;
  border-radius: 10px;
  text-align: center;
  cursor: grab;
  transition: background 0.3s, box-shadow 0.3s;
}

.tray:hover {
  background: linear-gradient(135deg, #5069d6, #2e3c78);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.5);
}
</style>
