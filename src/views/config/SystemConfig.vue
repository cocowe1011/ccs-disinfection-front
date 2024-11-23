<template>
  <div class="config">
    <div>
      <div class="formDiv">
        <div class="card-title">配置列表</div>
        <div class="card-content">
          <el-form label-position="right" label-width="150px" :model="cssConfig" v-loading="loading">
            <el-divider content-position="left">PLC</el-divider>
            <el-form-item label="ip地址：">
              <el-input v-model="cssConfig.plcIp" style="width: 250px;"></el-input>
            </el-form-item>
            <el-form-item label="端口：">
              <el-input v-model="cssConfig.plcPort" style="width: 250px;"></el-input>
            </el-form-item>
            <el-divider content-position="left">束前传送带长度</el-divider>
            <el-form-item label="L1-1长度(mm)：">
              <el-input v-model="cssConfig.oneOneLength" style="width: 250px;"></el-input>
            </el-form-item>
            <el-form-item label="L2长度(mm)：">
              <el-input v-model="cssConfig.twoLength" style="width: 250px;"></el-input>
            </el-form-item>
            <el-divider content-position="left">H-A点传送带长度</el-divider>
            <el-form-item label="J长度(mm)：">
              <el-input v-model="cssConfig.pointjLength" style="width: 250px;" type="number"></el-input>
            </el-form-item>
            <el-form-item label="K长度(mm)：">
              <el-input v-model="cssConfig.pointkLength" style="width: 250px;" type="number"></el-input>
            </el-form-item>
            <el-form-item label="L长度(mm)：">
              <el-input v-model="cssConfig.pointlLength" style="width: 250px;" type="number"></el-input>
            </el-form-item>
            <el-divider content-position="left">点位</el-divider>
            <el-form-item label="判断禁止上货点位：">
              <el-select v-model="cssConfig.judgeLoadPoint" style="width: 250px;">
                <el-option label="光电D" value="D"></el-option>
                <el-option label="光电E" value="E"></el-option>
                <el-option label="光电F" value="F"></el-option>
                <el-option label="光电H" value="H"></el-option>
              </el-select>
            </el-form-item>
            <el-divider content-position="left">G-H光电配置</el-divider>
            <el-form-item label="X1长度(mm)：">
              <el-input v-model="cssConfig.lengthOne" style="width: 250px;" type="number"></el-input>
            </el-form-item>
            <el-form-item label="X2长度(mm)：">
              <el-input v-model="cssConfig.lengthTwo" style="width: 250px;" type="number"></el-input>
            </el-form-item>
            <el-form-item label="V1系数比：">
              <el-input v-model="cssConfig.speedOne" style="width: 250px;" type="number"></el-input>
            </el-form-item>
            <el-form-item label="V2系数比：">
              <el-input v-model="cssConfig.speedTwo" style="width: 250px;" type="number"></el-input>
            </el-form-item>
            <el-form-item label="G点延迟时间(ms)：">
              <el-input v-model="cssConfig.newDelayPointTime" style="width: 250px;" type="number"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="footer">
        <el-button type="info" plain @click="allowEdit=true" v-show="!allowEdit">页面已锁定，点击修改配置</el-button>
        <el-button type="primary" @click="update" v-show="allowEdit">保存</el-button>
        <el-button @click="allowEdit=false" v-show="allowEdit">取消</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { ipcRenderer } from 'electron'
import HttpUtil from '@/utils/HttpUtil'
import { EventBus } from '@/utils/EventBus'
export default {
  name: "SystemConfig",
  components: {},
  props: {},
  data() {
    return {
      cssConfig: {
        plcIp: '',
        plcPort: '',
        oneOneLength: '',
        twoLength: '',
        judgeLoadPoint: '',
        pointjLength: 0,
        pointkLength: 0,
        pointlLength: 0
      },
      configId: '',
      loading: false,
      allowEdit: false
    };
  },
  watch: {},
  computed: {},
  methods: {
    getConfig() {
      this.loading = true
      // 查询配置
      HttpUtil.get('/cssConfig/getConfig').then((res)=> {
        this.cssConfig = res.data;
        this.configId = res.data.configId;
        this.loading = false
      }).catch((err)=> {
        this.loading = false
        console.log('config error!')
      });
    },
    update() {
      // 先判空处理
      if(this.cssConfig.plcIp === '' || this.cssConfig.plcIp === null || this.cssConfig.plcIp === undefined) {
        this.$message.error('PLC地址不可保存为空值！');
        return false
      }
      if(this.cssConfig.plcPort === '' || this.cssConfig.plcPort === null || this.cssConfig.plcPort === undefined) {
        this.$message.error('PLC端口不可保存为空值！');
        return false
      }
      if(this.cssConfig.oneOneLength === '' || this.cssConfig.oneOneLength === null || this.cssConfig.oneOneLength === undefined) {
        this.$message.error('L1-1长度不可保存为空值！');
        return false
      }
      if(this.cssConfig.twoLength === '' || this.cssConfig.twoLength === null || this.cssConfig.twoLength === undefined) {
        this.$message.error('L2长度不可保存为空值！');
        return false
      }
      if(this.cssConfig.judgeLoadPoint === '' || this.cssConfig.judgeLoadPoint === null || this.cssConfig.judgeLoadPoint === undefined) {
        this.$message.error('禁止上货判断点不可保存为空值！');
        return false
      }
      this.cssConfig.configId = this.configId;
      this.loading = true
      // 修改配置
      HttpUtil.post('/cssConfig/update', this.cssConfig).then((res)=> {
        if(res.data > 0) {
          this.$message.success('修改成功！')
          this.getConfig();
          // 通知其他页面刷新配置
          EventBus.$emit('reFlushConfig')
        }
        this.loading = false
      }).catch((err)=> {
        this.loading = false
        console.log('config error!')
      });
    }
  },
  created() {
    this.getConfig();
  },
  mounted() {
  }
};
</script>
<style lang="less" scoped>
.config {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  > div {
    width: 100%;
    height: 100%;
    opacity: 1;
    border-radius: 20px;
    background: rgb(255, 255, 255);
    box-shadow: 0px 60px 90px 0px rgba(0, 0, 0, 0.2);
    position: relative;
    .formDiv {
      height: 100%;
      .card-title {
        height: 30px;
        width: 100%;
        font-weight: 550;
        letter-spacing: 0px;
        color: rgba(0, 0, 0, 1);
        text-align: left;
        vertical-align: top;
        display: flex;
        align-items: flex-end;
        padding-left: 23px;
      }
      .card-content {
        height: calc(100% - 103px);
        width: 100%;
        padding: 0px 32px;
        box-sizing: border-box;
        overflow: auto;
        > div {
          height: 43px;
          width: 100%;
          display: flex;
          align-items: center;
          font-size: 14px;
        }
      }
    }
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: #f2f6fc;
      padding: 12px;
      text-align: center;
      box-sizing: border-box;
    }
  }
}
</style>