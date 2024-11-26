<template>
  <div style="width: 100%;height: 100%;">
    <div class="header">
      <h1>智慧工厂实时监控</h1>
      <div>当前时间：<span>{{ currentTime }}</span></div>
    </div>
    <div class="canvas-container">
      <canvas ref="factoryCanvas"></canvas>
    </div>
  </div>
</template>
<script>
import * as THREE from "three";
export default {
  name: "SmartFactory",
  components: {},
  props: {},
  data() {
    return {
      currentTime: '', // 实时时间
      renderer: null,  // 渲染器
      scene: null,     // Three.js 场景
      camera: null,    // 相机
    };
  },
  created() {},
  mounted() {
    this.initScene();       // 初始化 Three.js 场景
    this.startAnimation();  // 启动动画循环
    this.updateTime();      // 启动时间更新
    window.addEventListener("resize", this.onWindowResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onWindowResize);
  },
  methods: {
    initScene(){
      // 初始化Three.js场景
      // 获取 canvas 元素
      const canvas = this.$refs.factoryCanvas;
      const canvasContainer = this.$el.querySelector('.canvas-container');
      // 创建 WebGLRenderer 渲染器
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      this.renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
      this.renderer.setClearColor(0x1a1a1a); // 更加工业化风格的背景色
      this.renderer.setPixelRatio(window.devicePixelRatio);
      // 创建场景和相机
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(55, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 90, 100); // 相机初始位置
      this.camera.lookAt(0, 0, 0); // 相机看向原点

      // 添加光源
      const ambientLight = new THREE.AmbientLight(0x666666, 2.5); // 非常强的环境光
      this.scene.add(ambientLight);

      // 定向光（用于模拟太阳光）
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2.8);
      directionalLight.position.set(20, 50, 30); // 光源位置
      directionalLight.castShadow = true; // 开启阴影
      this.scene.add(directionalLight);

      // 工厂基础
      const factoryBaseGeometry = new THREE.PlaneGeometry(190, 190);
      const factoryBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x2e2e38, metalness: 0.3, roughness: 0.8 });
      const factoryBase = new THREE.Mesh(factoryBaseGeometry, factoryBaseMaterial);
      factoryBase.rotation.x = -Math.PI / 2;
      this.scene.add(factoryBase);

      // 添加传送带和功能区块
      this.addConveyorBelts();
      this.addFunctionalBlocks();
    },
    // 创建传送带路径
    // position 位置（x,y,z）
    // length 长度
    // width 宽度
    // height 高度
    // rotation = [0, 0, 0] 旋转
    // beltSegments 滚轮数
    createConveyorBelt(position, length, width, height, rotation = [0, 0, 0], beltSegments) {
        const conveyorBeltGroup = new THREE.Group();

        const beltGeometry = new THREE.BoxGeometry(length, height / 2, width);
        const beltMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.4 });
        const conveyorBelt = new THREE.Mesh(beltGeometry, beltMaterial);
        conveyorBelt.position.set(0, height / 4, 0);
        conveyorBeltGroup.add(conveyorBelt);

        const segmentLength = length / beltSegments;
        const chainMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.4 });
        for (let i = 0; i < beltSegments; i++) {
            const segmentGeometry = new THREE.BoxGeometry(segmentLength - 0.2, height / 10, width + 0.5);
            const segment = new THREE.Mesh(segmentGeometry, chainMaterial);
            const offset = -length / 2 + segmentLength * i + segmentLength / 2;
            segment.position.set(offset, height / 2 + 0.5, 0);
            conveyorBeltGroup.add(segment);
        }

        conveyorBeltGroup.position.set(...position);
        conveyorBeltGroup.rotation.x = rotation[0] * Math.PI / 180;
        conveyorBeltGroup.rotation.y = rotation[1] * Math.PI / 180;
        conveyorBeltGroup.rotation.z = rotation[2] * Math.PI / 180;

        this.scene.add(conveyorBeltGroup);
    },
    // 创建功能区块（预热区和消毒区）
    createFunctionalBlock(position, length, width, height, color, label) {
      // 创建功能性方块
      const blockGeometry = new THREE.BoxGeometry(length, height, width);
        const blockMaterial = new THREE.MeshStandardMaterial({ color: color, metalness: 0.5, roughness: 0.6 });
        const functionalBlock = new THREE.Mesh(blockGeometry, blockMaterial);
        functionalBlock.position.set(...position);
        this.scene.add(functionalBlock);

        // 创建标签 (使用动态大小的平面)
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // 设置画布大小，根据传入的长和宽调整
        canvas.width = length * 20;  // 使用适当的比例来转换长和宽，这里用 20 作为比例因子，您可以根据需要进行调整
        canvas.height = width * 10;  // 使用适当的比例来转换长和宽

        // 设置背景颜色
        // context.fillStyle = 'rgba(0, 0, 0, 0.5)'; // 设置背景颜色为半透明的黑色 (您可以更改颜色和透明度)
        // context.fillRect(0, 0, canvas.width, canvas.height); // 绘制矩形，覆盖整个画布

        // 设置文本样式
        context.font = 'Bold 150px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(label, canvas.width / 2, canvas.height / 2);

        // 创建纹理并用于材质
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true, // 使背景透明
            side: THREE.DoubleSide, // 让标签的两面都可见
        });

        // 创建平面几何体作为标签
        const planeGeometry = new THREE.PlaneGeometry(length, width / 2); // 使用与立方体相匹配的长和适当比例的宽
        const plane = new THREE.Mesh(planeGeometry, material);

        // 让平面躺下
        plane.rotation.x = -Math.PI / 2; // 沿 X 轴旋转 90 度，使其平躺

        // 设置平面的位置
        plane.position.set(position[0], position[1] + height / 2 + 0.1, position[2]); // 标签在立方体顶部稍微偏移一点高度

        // 将标签添加到场景中
        this.scene.add(plane);
    },
    addConveyorBelts() {
      // 添加传送带-最下方
      this.createConveyorBelt([0, 5, 60], 100, 6, 3, [0, 0, 0], 30);
      // 中间
      this.createConveyorBelt([-1, 5, 10], 100, 8, 3, [0, 0, 0], 30);
      // 最上方
      this.createConveyorBelt([-2, 5, -60], 102.2, 11, 3, [0, 0, 0], 30);
      // 右侧竖着的
      this.createConveyorBelt([54, 5, 43], 40, 7, 3, [90, -90, 90], 18);
      // 右侧上货区
      this.createConveyorBelt([64.5, 5, 27], 13, 7, 3, [0, 0, 0], 4);
      // 下货区竖着的
      this.createConveyorBelt([54, 5, -51], 30, 9, 3, [90, -90, 90], 10);
    },
    addFunctionalBlocks() {
      const wordArr = ['G', 'F', 'E', 'D', 'C', 'B', 'A']
      // 添加预热区（蓝色-下区域块）
      const preheatBlocksCount = 7;
        const preheatBlockWidth = 20;
        const preheatBlockHeight = 1.7;
        const preheatBlockLength = 12;
        for (let i = 0; i < preheatBlocksCount; i++) {
            const xOffset = -46 + i * (preheatBlockLength + 3); // 调整偏移量使其更加整齐
            this.createFunctionalBlock([xOffset, preheatBlockHeight / 2 + 1.5, 44], preheatBlockLength, preheatBlockWidth, preheatBlockHeight, 0x0000ff, wordArr[i] + "1");
        }

        // 添加预热区（蓝色-上区域块）
        const preheatBlocksCount2 = 7;
        const preheatBlockWidth2 = 20;
        const preheatBlockHeight2 = 1.7;
        const preheatBlockLength2 = 12;
        for (let i = 0; i < preheatBlocksCount2; i++) {
            const xOffset = -46 + i * (preheatBlockLength2 + 3); // 调整偏移量使其更加整齐
            this.createFunctionalBlock([xOffset, preheatBlockHeight2 / 2 + 1.5, 23], preheatBlockLength2, preheatBlockWidth2, preheatBlockHeight2, 0x0000ff, wordArr[i] + "2");
        }

        // 添加消毒区（黄色区域-下块）
        const disinfectionBlocksCount = 7;
        const disinfectionBlockWidth = 28;
        const disinfectionBlockHeight = 1;
        const disinfectionBlockLength = 12;
        for (let i = 0; i < disinfectionBlocksCount; i++) {
            const xOffset = -47 + i * (disinfectionBlockLength + 3); // 调整偏移量使其更加整齐
            this.createFunctionalBlock([xOffset, disinfectionBlockHeight / 2 + 1.5, -45], disinfectionBlockLength, disinfectionBlockWidth, disinfectionBlockHeight, 0xffff00, wordArr[i] + "1");
        }

        // 添加消毒区（黄色区域-上块）
        const disinfectionBlocksCount2 = 7;
        const disinfectionBlockWidth2 = 28;
        const disinfectionBlockHeight2 = 1;
        const disinfectionBlockLength2 = 12;
        for (let i = 0; i < disinfectionBlocksCount2; i++) {
            const xOffset = -47 + i * (disinfectionBlockLength2 + 3); // 调整偏移量使其更加整齐
            this.createFunctionalBlock([xOffset, disinfectionBlockHeight2 / 2 + 1.5, -15], disinfectionBlockLength2, disinfectionBlockWidth2, disinfectionBlockHeight2, 0xffff00, wordArr[i] + "2");
        }
    },
    updateTime() {
      // 初始化当前时间并设置定时器更新
      this.currentTime = new Date().toLocaleTimeString();
      setInterval(() => {
        this.currentTime = new Date().toLocaleTimeString();
      }, 1000);
    },
    onWindowResize() {
      const canvasContainer = this.$el.querySelector('.canvas-container');
      // 处理窗口大小调整
      if (this.renderer && this.camera) {
        this.renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        this.camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
        this.camera.updateProjectionMatrix();
      }
    },
    // 动画渲染
    startAnimation() {
      const animate = () => {
        requestAnimationFrame(animate); // 循环动画
        this.renderer.render(this.scene, this.camera); // 渲染场景
      };
      animate();
    }
  }
};
</script>
<style lang="less" scoped>
body {
  margin: 0;
  font-family: "Roboto", sans-serif;
  background-color: #1a1a1a;
  overflow: hidden;
  color: #e0e0e0;
}
.header {
  height: 60px;
  background-color: blue;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  color: #f0f0f0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
}
.canvas-container {
  height: calc(100% - 60px);
  width: 100%;
}
</style>