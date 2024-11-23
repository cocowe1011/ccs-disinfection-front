<template>
  <div style="width: 100%;height: 100%;">
    <div class="orderlist">
      <div>
        <div class="formDiv">
          <div class="card-title">报表设计</div>
          <div class="card-content">
            <div>箱报告模板<el-input placeholder="文件路径" v-model="boxReportPath" style="width: 300px;margin-left: 10px;" size="small" readonly></el-input><el-button style="margin-left: 10px;" size="small" @click="openReport(boxReportPath)" :loading="openBoxLoading">箱设计</el-button></div>
            <div>批报告模板<el-input placeholder="文件路径" v-model="orderReportPath" style="width: 300px;margin-left: 10px;" size="small" readonly></el-input><el-button style="margin-left: 10px;" size="small" @click="openReport(orderReportPath)" :loading="openOrderLoading">批设计</el-button></div>
          </div>
        </div>
        <el-divider></el-divider>
        <div class="listDiv">
          <div class="search">
            <span>订单编号</span>
            <el-input placeholder="请输入订单编号" v-model="orderNoInput" style="width: 200px;margin-left: 10px;" size="small"></el-input>
            <span style="margin-left: 10px;">灭菌批号</span>
            <el-input placeholder="请输入灭菌批号" v-model="batchIdInput" style="width: 200px;margin-left: 10px;" size="small"></el-input>
            <span style="margin-left: 10px;">箱编号</span>
            <el-input placeholder="请输入箱编号" v-model="boxImitateIdInput" style="width: 200px;margin-left: 10px;" size="small"></el-input>
            <el-button style="margin-left: 10px;" size="small" type="primary" @click="getReportSearch">查询</el-button>
            <el-link style="position: absolute; right: 40px;" icon="el-icon-edit" type="primary" @click="showViewOrderList">修改已完成订单</el-link>
          </div>
          <div class="tableDiv">
            <el-table
              :data="tableData"
              border
              height="100%"
              style="width: 100%">
              <el-table-column type="index" width="80" :index="indexMethod" fixed="left" label="序号">
              </el-table-column>
              <el-table-column
                prop="orderId"
                label="任务编号"
                width="180">
              </el-table-column>
              <el-table-column
                prop="createTime"
                label="订单日期"
                width="180">
              </el-table-column>
              <el-table-column
                prop="orderNo"
                label="订单编号">
              </el-table-column>
              <el-table-column
                prop="batchId"
                label="灭菌批号">
              </el-table-column>
              <el-table-column
                prop="orderName"
                label="订单名称">
              </el-table-column>
              <el-table-column
                prop="boxImitateId"
                label="箱编号">
              </el-table-column>
              <el-table-column
                prop="productName"
                label="产品名称">
              </el-table-column>
              <el-table-column
                prop="artName"
                label="工艺名称">
              </el-table-column>
              <el-table-column
                prop="loadMethod"
                label="装载方式">
              </el-table-column>
              <el-table-column
                prop="pathName"
                label="路径名称">
              </el-table-column>
              <el-table-column
                fixed="right"
                label="操作"
                width="180">
                <template slot-scope="scope">
                  <el-link type="primary" icon="el-icon-tickets" @click="getOrderReportData(scope.row)">批报告</el-link>
                  <el-link type="primary" icon="el-icon-receiving" @click="getBoxReportData(scope.row)" style="margin-left: 15px;">箱报告</el-link>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="fenye">
            <el-pagination
              style="margin-right: 2px;"
              background
              layout="prev, pager, next"
              :page-size="pageSize"
              @current-change="currentChange"
              :total="pageTotal"
              :current-page.sync="pageNum">
            </el-pagination>
          </div>
          <!-- <div @click="getData">打印预览箱报告</div>
          <div @click="getDataPi">打印预览批报告</div> -->
        </div>
      </div>
    </div>
    <el-dialog
      title="修改已完成订单"
      :visible.sync="dialogVisible"
      width="1400px"
      :before-close="handleClose"
      append-to-body
      destroy-on-close>
      <ViewOrderList/>
    </el-dialog>
  </div>
  
</template>

<script>
import HttpUtil from '@/utils/HttpUtil'
import { Debugger, ipcRenderer } from 'electron'
import grwebapp from '@/utils/grwebapp'
const { exec } = require('child_process');
const os = require('os');
import ViewOrderList from '../orderlist/ViewOrderList.vue'
export default {
  name: "Report",
  components: {
    ViewOrderList
  },
  props: {},
  data() {
    return {
      printObj: {recordset:[]},
      boxReportPath: 'D://css_temp_data/report/boxreport.grf',
      orderReportPath: 'D://css_temp_data/report/batchReport.grf',
      tableData: [],
      orderNoInput: '',
      boxImitateIdInput: '',
      batchIdInput: '',
      openBoxLoading: false,
      openOrderLoading: false,
      pageSize: 12,
      pageNum: 1,
      pageTotal: 0,
      dialogVisible: false
    };
  },
  watch: {},
  computed: {},
  methods: {
    showViewOrderList() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    openReport(filePath) {
      if (filePath == this.orderReportPath) {
        this.openOrderLoading = true
      } else {
        this.openBoxLoading = true
      }
      let command;
      switch (os.platform()) {
        case 'win32': // Windows
          command = `start "" "${filePath}"`;
          break;
        case 'darwin': // macOS
          command = `open "${filePath}"`;
          break;
        case 'linux': // Linux
          command = `xdg-open "${filePath}"`;
          break;
        default:
          this.$message.error('不支持的操作系统！');
          return;
      }

      // 执行打开文件的命令
      exec(command, (error, stdout, stderr) => {
        if (error) {
          this.$message.error(`无法打开文件：${filePath}`);
          console.error(error);
          this.openBoxLoading = false
          this.openOrderLoading = false
          return;
        }
        this.openBoxLoading = false
        this.openOrderLoading = false
        this.$message.success('文件已成功打开！');
      });
    },
    currentChange(pageNum) {
      if(pageNum != undefined) {
        this.pageNum = pageNum
        this.getReportList();
      }
    },
    async getReportSearch() {
      this.pageNum = 1
      this.tableData = [];
      this.pageTotal = 0;
      const param = {
        boxImitateId: this.boxImitateIdInput,
        orderNo: this.orderNoInput,
        batchId: this.batchIdInput,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      await HttpUtil.post('/order/getReportList', param).then((res)=> {
        if(res.data.list.length > 0) {
          this.pageTotal = res.data.total;
          this.tableData = res.data.list;
        }
      }).catch((err)=> {
        // 网络异常 稍后再试
        this.$message.error('查询失败！' + err);
      });
    },
    async getReportList() {
      const param = {
        boxImitateId: this.boxImitateIdInput,
        orderNo: this.orderNoInput,
        batchId: this.batchIdInput,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      await HttpUtil.post('/order/getReportList', param).then((res)=> {
        if(res.data.list.length > 0) {
          this.pageTotal = res.data.total;
          this.tableData = res.data.list;
          if(res.data.pages < this.pageNum) {
            this.pageNum = 1
          }
        } else {
          this.pageTotal = 0;
          this.tableData = [];
          this.pageNum = 1
        }
      }).catch((err)=> {
        // 网络异常 稍后再试
        this.$message.error('查询失败！' + err);
      });
    },
    async getOrderReportData(row) {
      const param = {orderId: row.orderId}
      await HttpUtil.post('/order/getOrderMainReport', param).then((res)=> {
        this.printObj.recordset = res.data
        this.printView(this.printObj, this.orderReportPath)
      }).catch((err)=> {
        // 网络异常 稍后再试
        this.$message.error('查询失败！' + err);
      });
    },
    async getBoxReportData(row) {
      const param = {boxImitateId: row.boxImitateId}
      await HttpUtil.post('/box/getBoxReport', param).then((res)=> {
        this.printObj.recordset = res.data
        this.printView(this.printObj, this.boxReportPath)
      }).catch((err)=> {
        // 网络异常 稍后再试
        this.$message.error('查询失败！' + err);
      });
    },
    printView(printObj, reportPath) {
      console.log(printObj)
      var args = {
        type: "preview", //设置不同的属性可以执行不同的任务，如：preview print pdf xls csv txt rtf img grd
        // type: "pdf",
        report: grwebapp.urlAddRandomNo(reportPath),
        PrinterName: "XP-58", //指定要输出的打印机名称
        //实际应用中，data应该为程序中通过各种途径获取到的数据，最后要将数据转换为报表需要的XML或JSON格式的字符串数据
        data: printObj,
        showOptionDlg: false  //指定不显示导出选项对话框
        // filename: "d:\\test.pdf", //指定导出的文件路径与文件名
        // open: false  //指定导出后不自动打开文件
      };
      grwebapp.webapp_ws_ajax_run(args);
    },
    indexMethod(index) {
      return index + 1;
    }
  },
  created() {
    grwebapp.webapp_urlprotocol_startup();
    this.getReportList();
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
.orderlist {
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
    // backdrop-filter: blur(88px);
    .formDiv {
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
        height: calc(100% - 37px);
        width: 100%;
        padding: 0px 32px;
        box-sizing: border-box;
        > div {
          height: 43px;
          width: 100%;
          display: flex;
          align-items: center;
          font-size: 14px;
        }
      }
    }
    ::v-deep .el-divider--horizontal{
      margin: 5px;
    }
    .listDiv {
      box-sizing: border-box;
      padding: 0px 16px;
      height: calc(100% - 190px);
      .search {
        height: 43px;
        width: 100%;
        display: flex;
        align-items: center;
        font-size: 14px;
        box-sizing: border-box;
        padding: 0px 16px;
        margin-bottom: 5px;
      }
      .tableDiv {
        height: calc(100% - 110px);
        width: 100%;
      }
      .fenye {
        height: 50px;
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
      }
    }
  }
}
::v-deep .el-dialog__body {
  padding: 8px 20px;
}
</style>