<template>
  <div class="smart-workshop">
    <!-- 流水线动画区，占整个主区域 -->
    <div class="conveyor-section">
      <SmartFactory class="conveyor-animation" ref="smartref"/>
      <el-button type="primary" v-for="tag in tags" :key="tag.id" class="tag" :style="tagComputedStyle(tag)">
        {{ tag.text }}
      </el-button>
    </div>

    <!-- 左右状态与其他信息区域，悬浮在流水线之上，不遮挡中间 -->
    <div class="side-info-panel left-panel">
      <!-- PLC状态与订单信息区域 -->
      <div class="plc-info-section">
        <div class="section-header">
          订单信息与PLC状态
        </div>
        <div class="scrollable-content" style="margin-top: 5px;">
          <div class="status-overview">
            <div class="data-card">
              <div class="data-card-border">
                <div class="data-card-border-borderTop granient-text">灭菌批号</div>
                <div class="data-card-border-borderDown" style="font-size: 1.3vw;">123456678</div>
              </div>
            </div>
            <div class="data-card">
              <div class="data-card-border">
                <div class="data-card-border-borderTop">箱子长度</div>
                <div class="data-card-border-borderDown">100mm</div>
              </div>
            </div>
            <div class="data-card">
              <div class="data-card-border">
                <div class="data-card-border-borderTop">箱子宽度</div>
                <div class="data-card-border-borderDown">300mm</div>
              </div>
            </div>
            <div class="data-card">
              <div class="data-card-border">
                <div class="data-card-border-borderTop">箱子高度</div>
                <div class="data-card-border-borderDown">200mm</div>
              </div>
            </div>
            <div class="data-card">
              <div class="data-card-border">
                <div class="data-card-border-borderTop">束下设置速度</div>
                <div class="data-card-border-borderDown">10540mm/分钟</div>
              </div>
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
        </div>
        <div class="scrollable-content">
          <ul>
            <li v-for="log in logs" :key="log.id">{{ log.message }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 右侧队列信息区域 -->
    <div class="side-info-panel-queue right-panel" :style="{'width' : isQueueExpanded? '800px': '20%'}">
      <!-- 队列信息区域 -->
      <div class="queue-section" :class="{ 'expanded': isQueueExpanded }">
        <div class="section-header" @click="isQueueExpanded = !isQueueExpanded">
          队列信息
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
import debounce from 'lodash/debounce';
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
      nowTrays: [],
      buttonStates: {
        start: false,
        stop: false,
        reset: false,
        fault_reset: false,
        clear: false
      },
      orderNumber: 'ORD-12345',  // 新增订单号
      orderQuantity: 500,        // 新增订单数量
      currentLoadQuantity: 100,  // 新增当前上货数量
      tags: [
        { id: 'tag1', text: 'Tag 1', relativeX: 0.5, relativeY: -0.5 },
        { id: 'tag2', text: 'Tag 2', relativeX: 0.5, relativeY: -0.5 }
      ]
    };
  },
  mounted() {
    this.updateLayout();
    window.addEventListener('resize', this.debouncedUpdateLayout);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.debouncedUpdateLayout);
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
    },
    toggleButtonState(button) {
      this.buttonStates = {
        start: false,
        stop: false,
        reset: false,
        fault_reset: false,
        clear: false
      }
      this.buttonStates[button] = !this.buttonStates[button]; // 切换按钮的按下/恢复状态
      if (button === 'start') {
        this.$refs.smartref.runbelt(true)
      }
      if (button === 'stop') {
        this.$refs.smartref.runbelt(false)
      }
    },
    handleOperation(action) {
      console.log(`执行操作: ${action}`);
      // 在这里处理操作逻辑
    },
    updateLayout() {
      // Update tags based on the new dimensions
      const canvasContainer = this.$el.querySelector('.conveyor-animation');
      const screenWidth = canvasContainer.clientWidth;
      const screenHeight = canvasContainer.clientWidth;
      this.tags.forEach(tag => {
        const x = tag.relativeX * screenWidth;
        const y = tag.relativeY * screenHeight;
        this.$set(tag, 'style', this.calculateTagStyle(x, y)); // Use Vue.set for reactivity
      });
    },
    calculateTagStyle(x, y) {
      return {
        position: 'absolute',
        transform: `translate(${x}px, ${y}px)`,
        transformOrigin: 'top left'
      };
    },
    tagComputedStyle(tag) {
      return tag.style || {};
    }
  },
  computed: {
    debouncedUpdateLayout() {
      return debounce(this.updateLayout, 100);
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
}

.conveyor-animation {
  height: 100%;
  width: 100%;
  border-radius: 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
}

.side-info-panel {
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px;
  box-sizing: border-box;
}

.side-info-panel-queue {
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  transition: width 0.3s ease-in-out;
}

.left-panel {
  left: 0;
}

.right-panel {
  right: 0;
}

.plc-info-section,
.log-section,
.queue-section,
.operation-panel {
  background: rgba(30, 42, 56, 0.8); /* 透明度略小，保持背景效果 */
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

h3 {
  margin: 0;
  font-size: 1.6em;
  color: #0ac5a8;
}

.arrow-icon {
  transition: transform 0.3s ease, color 0.3s ease;
}

.arrow-icon:hover {
  color: #0ac5a8;
}

.expanded-arrow {
  transform: rotate(180deg);
}

.expandable-content-queue {
  height: 800px;
  width: 100%;
  display: flex;
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

.queue-contaier-left {
  flex: 1;
  height: 100%;
  padding-right: 10px; /* 给右侧和左侧之间留出间隔 */
  overflow-y: auto;
  box-sizing: border-box;
  border-right: 2px solid #2a3a46; /* 添加右侧边界 */
}

.queue-contaier-right {
  width: 280px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 居中对齐 */
  align-items: center; /* 居中对齐 */
  gap: 15px; /* 卡片间距 */
  padding-left: 10px; /* 给左侧和右侧之间留出间隔 */
  box-sizing: border-box;
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

.operation-buttons {
  display: flex;
  justify-content: space-between;  /* 横向排列按钮 */
  gap: 10px;
  margin-top: 5px;
}

.operation-buttons button {
  width: 80px;  /* 保持正方形 */
  height: 80px; /* 保持正方形 */
  font-size: 0.8em; /* 调整字体大小 */
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
  padding: 0;
  gap: 5px; /* 图标和文字之间的间距 */
}

.operation-buttons button i {
  font-size: 2em; /* 图标的大小 */
}

.operation-buttons button span {
  font-size: 1.1em; /* 文字大小，保持合适 */
  line-height: 1.5; /* 适当的行高，防止文字过于紧凑 */
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

.operation-buttons button:active {
  transform: scale(0.95);
}

.status-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* 两列布局 */
  gap: 10px;
  .data-card {
      box-sizing: border-box;
      height: 80px;
      width: 225px;
      &-border {
        width: 100%;
        height: 100%;
        border-radius: 20px;
        background: linear-gradient(135deg, #2b3d51, #3c4c63);  /* 新增渐变背景 */
        // box-shadow: 0px 20px 50px 0px rgba(0, 0, 0, 0.25);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);  /* 更柔和的阴影 */
        &-borderTop {
          font-weight: 400;
          letter-spacing: 0px;
          color: rgba(189, 189, 189, 1);
          text-align: left;
          vertical-align: top;
          font-size: 14px;
          line-height: 38px;
          padding-left: 14px;
        }
        .granient-text {
          background-image: linear-gradient(to right, rgba(72, 146, 254, 1) , rgba(71, 207, 245, 1));
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
        .granient-text-order {
          background-image: linear-gradient(to right, rgba(112, 225, 245, 1) , rgba(255, 209, 148, 1));
          // background-image: linear-gradient(to right, rgba(255, 95, 109, 1) , rgba(255, 195, 113, 1));
          
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
        &-borderDown {
          font-weight: 700;
          letter-spacing: 0px;
          color: rgba(255, 255, 255, 1);
          text-align: left;
          vertical-align: top;
          font-size: 28px;
          line-height: 32px;
          padding-left: 14px;
        }
      }
    }
}
.tag {
  transition: transform 0.2s ease-in-out; // Smooth transitions for moving tags
}
</style>
