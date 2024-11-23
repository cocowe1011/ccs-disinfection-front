<template>
  <div style="width: 100%; height: 600px;">
    <div class="search">
      <span>订单编号</span>
      <el-input placeholder="请输入订单编号" v-model="orderNoInput" style="width: 200px;margin-left: 10px;" size="small"></el-input>
      <span style="margin-left: 10px;">灭菌批号</span>
      <el-input placeholder="请输入灭菌批号" v-model="batchIdInput" style="width: 200px;margin-left: 10px;" size="small"></el-input>
      <el-button style="margin-left: 10px;" size="small" type="primary" @click="getOrderListSearch">查询</el-button>
    </div>
    <div class="tableDiv">
      <el-table
        :data="tableData"
        border
        height="100%"
        style="width: 100%">
        <el-table-column type="index" width="60" :index="indexMethod" label="序号">
        </el-table-column>
        <el-table-column
          prop="orderId"
          label="任务编号"
          width="180">
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="订单日期"
          width="160">
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
          prop="productName"
          label="产品名称">
        </el-table-column>
        <el-table-column
          prop="artName"
          label="工艺名称">
        </el-table-column>
        <el-table-column
          label="操作"
          width="130">
          <template slot-scope="scope">
            <el-link type="primary" @click="updateBoxReportData(scope.row)">修改</el-link>
            <el-link type="primary" @click="showBoxReportData(scope.row)" style="margin-left: 10px;">原始记录</el-link>
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
    <el-dialog
      title="订单详细信息"
      :visible.sync="dialogVisibleOrder"
      width="1400px"
      append-to-body
      :destroy-on-close="true">
      <div style="width: 100%;">
        <el-descriptions class="margin-top" :column="3" border>
          <el-descriptions-item style="width:150px;">
            <template slot="label">
              订单编号
            </template>
            {{ this.updateOrderInfo.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              灭菌批号
            </template>
            {{ this.updateOrderInfo.batchId }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              订单时间
            </template>
            {{ this.updateOrderInfo.createTime }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              订单名称
            </template>
            {{ this.updateOrderInfo.orderName }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              产品名称
            </template>
            {{ this.updateOrderInfo.productName }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              工艺名称
            </template>
            {{ this.updateOrderInfo.artName }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              圈数
            </template>
            {{ this.updateOrderInfo.numberTurns }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              操作员
            </template>
            {{ this.updateOrderInfo.creatorName }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              辐照数量
            </template>
            {{ this.boxList.length }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              箱信息
            </template>
            <div style="width: 1260px; height: 400px; overflow-y: auto;" v-loading="boxLoading">
              <div class="box-card add-card" style="border: 1px #000 dashed; display: flex; align-items:center; justify-content: center;cursor: pointer;background-color: white;" @click="addBox" v-show="!showHistory">
                <i class="el-icon-plus" style="font-size: 18px"></i><span style="font-size: 17px; margin-left: 2px;">添加箱子</span>
              </div>
              <div v-for="(item, index) in boxList" :key="index" class="box-card">
                <el-button type="danger" icon="el-icon-delete" circle size="mini" style="position: absolute;right:0px;top:0px;padding: 3px;" @click="deleteBox(item.orderId, item.boxImitateId)" :disabled="showHistory"></el-button>
                <div class="box-row">
                  <div class="box-row-left">箱编号：</div>
                  <div class="box-row-right"><el-button type="text" icon="el-icon-edit" @click="showUpdateBoxImitateId(item)" :disabled="showHistory"></el-button>{{ item.boxImitateId }}</div>
                </div>
                <div class="box-row">
                  <div class="box-row-left">扫码：</div>
                  <div class="box-row-right">{{ item.loadScanCode }}</div>
                </div>
                <div class="box-row">
                  <div class="box-row-left">圈数：</div>
                  <div class="box-row-right">{{ item.numberTurns }}</div>
                </div>
                <div class="box-row">
                  <div class="box-row-left">
                    <el-popover
                      v-if="item.qualified !== '1'"
                      placement="bottom"
                      width="300"
                      trigger="click"
                      :content="item.failReason==null?'疑似存在误触情况，未读取到加速器数据！':item.failReason">
                      <i class="el-icon-warning" style="color:#f56c6c; cursor:pointer; margin-right: 4px;" slot="reference" title="点击查看不合格原因"></i>
                    </el-popover>
                    质量：
                  </div>
                  <div class="box-row-right">
                    <el-switch
                      style="display: block"
                      v-model="item.qualified"
                      active-value="1"
                      inactive-value="0"
                      active-color="#13ce66"
                      inactive-color="#ff4949"
                      active-text="合格"
                      inactive-text="不合格"
                      :disabled="showHistory"
                      @change="updateBoxQualified(item)">
                    </el-switch>
                  </div>
                </div>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
    <el-dialog
      title="修改箱子模拟id："
      :visible.sync="updateBoxImitateIdPop"
      width="30%"
      append-to-body
      :close-on-click-modal="false"
      >
      <el-input v-model="updateBoxImitateIdStr" placeholder="请输入模拟id"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateBoxImitateIdPop = false">取 消</el-button>
        <el-button type="primary" @click="updateBoxImitateId" :loading="dialogEditLoading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import HttpUtil from '@/utils/HttpUtil'
export default {
  name: "ViewOrderList",
  components: {},
  props: {},
  data() {
    return {
      tableData: [],
      orderNoInput: '',
      batchIdInput: '',
      pageSize: 12,
      pageNum: 1,
      pageTotal: 0,
      dialogVisibleOrder: false,
      valuetest: true,
      updateOrderInfo: {},
      boxList: [],
      boxLoading: false,
      showHistory: false,
      updateBoxImitateIdPop: false,
      updateBoxImitateIdStr: '',
      dialogEditLoading: false,
      aBoxImitateId: ''
    };
  },
  watch: {},
  computed: {},
  methods: {
    updateBoxQualified(item) {
      const param = {
        boxId: item.boxId,
        qualified: item.qualified
      }
      HttpUtil.post('/box/update', param).then((res)=> {
        if(res&&res.data > 0) {
          this.$message.success('更新成功！');
        }
      }).catch((err)=> {
        // 网络异常 稍后再试
        this.$message.error('删除失败！' + err);
      });
    },
    deleteBox(orderId, boxImitateId) {
      this.$confirm('此操作将永久删除该箱子的数据，请谨慎删除！ 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const param = {
          orderId: orderId,
          boxImitateId: boxImitateId
        }
        HttpUtil.post('/box/deleteBox', param).then((res)=> {
          if(res&&res.data > 0) {
            this.$message.success('删除成功！');
            const param2 = {
              orderId: this.updateOrderInfo.orderId
            }
            // 通过订单id查询所有箱子信息
            HttpUtil.post('/box/getBoxReportByOrderId', param2).then((res)=> {
              if(res.data&&res.data.length > 0) {
                this.boxList = res.data
              }
            }).catch((err)=> {
              // 网络异常 稍后再试
              this.$message.error('查询失败！' + err);
            });
          }
        }).catch((err)=> {
          // 网络异常 稍后再试
          this.$message.error('删除失败！' + err);
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    async addBox() {
      this.boxLoading = true
      const param = {
        boxImitateId: this.boxList[0].boxImitateId,
        orderId: this.updateOrderInfo.orderId
      }
      await HttpUtil.post('/box/addBox', param).then((res)=> {
        if(res&&res.data > 0) {
          this.$message.success('添加成功！');
          const param2 = {
            orderId: this.updateOrderInfo.orderId
          }
          // 通过订单id查询所有箱子信息
          HttpUtil.post('/box/getBoxReportByOrderId', param2).then((res)=> {
            if(res.data&&res.data.length > 0) {
              this.boxList = res.data
            }
          }).catch((err)=> {
            // 网络异常 稍后再试
            this.$message.error('查询失败！' + err);
          });
        }
      }).catch((err)=> {
        // 网络异常 稍后再试
        this.$message.error('添加失败！' + err);
      });
      setTimeout(() => {
        this.boxLoading = false
      }, 500);
    },
    async getOrderList400() {
      const param = {
        orderNo: this.orderNoInput,
        batchId: this.batchIdInput,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      await HttpUtil.post('/order/getOrderList400', param).then((res)=> {
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
    async getOrderListSearch() {
      this.pageNum = 1
      this.tableData = [];
      this.pageTotal = 0;
      const param = {
        orderNo: this.orderNoInput,
        batchId: this.batchIdInput,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      await HttpUtil.post('/order/getOrderList400', param).then((res)=> {
        if(res.data.list.length > 0) {
          this.pageTotal = res.data.total;
          this.tableData = res.data.list;
        }
      }).catch((err)=> {
        // 网络异常 稍后再试
        this.$message.error('查询失败！' + err);
      });
    },
    async updateBoxReportData(data) {
      this.updateOrderInfo = data;
      this.dialogVisibleOrder = true;
      this.boxLoading = true;
      this.showHistory = false;
      this.boxList = [];
      const param = {
        orderId: data.orderId
      }
      // 通过订单id查询所有箱子信息
      await HttpUtil.post('/box/getBoxReportByOrderId', param).then((res)=> {
        if(res.data&&res.data.length > 0) {
          this.boxList = res.data
        }
      }).catch((err)=> {
        // 网络异常 稍后再试
        this.$message.error('查询失败！' + err);
      });
      this.boxLoading = false;
    },
    // 查询原始记录只查箱子即可
    async showBoxReportData(data) {
      this.updateOrderInfo = data;
      this.dialogVisibleOrder = true;
      this.showHistory = true;
      this.boxLoading = true;
      this.boxList = [];
      const param = {
        orderId: data.orderId
      }
      // 通过订单id查询所有箱子信息
      await HttpUtil.post('/box/getBoxOriginalReportByOrderId', param).then((res)=> {
        if(res.data&&res.data.length > 0) {
          this.boxList = res.data
        }
      }).catch((err)=> {
        // 网络异常 稍后再试
        this.$message.error('查询失败！' + err);
      });
      this.boxLoading = false;
    },
    currentChange(pageNum) {
      if(pageNum != undefined) {
        this.pageNum = pageNum
        this.getOrderList400();
      }
    },
    indexMethod(index) {
      return index + 1;
    },
    showUpdateBoxImitateId(item) {
      this.updateBoxImitateIdPop = true;
      this.updateBoxImitateIdStr = item.boxImitateId;
      this.aBoxImitateId = item.boxImitateId;
    },
    updateBoxImitateId() {
      this.dialogEditLoading = true;
      const param = {
        aboxImitateId: this.aBoxImitateId,
        boxImitateId: this.updateBoxImitateIdStr
      }
      HttpUtil.post('/box/updateBoxImitateId', param).then((res)=> {
        if(res&&res.data > 0) {
          this.$message.success('更新成功！');
          this.updateBoxImitateIdPop = false;
          this.dialogEditLoading = false;
          this.updateBoxImitateIdStr = '';
          this.aBoxImitateId = '';
          const param2 = {
            orderId: this.updateOrderInfo.orderId
          }
          // 通过订单id查询所有箱子信息
          HttpUtil.post('/box/getBoxReportByOrderId', param2).then((res)=> {
            if(res.data&&res.data.length > 0) {
              this.boxList = res.data
            }
          }).catch((err)=> {
            // 网络异常 稍后再试
            this.$message.error('查询失败！' + err);
          });
        }
      }).catch((err)=> {
        // 网络异常 稍后再试
        this.$message.error('删除失败！' + err);
      });
    }
  },
  created() {
    this.getOrderList400();
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
.search {
  height: 43px;
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 14px;
  box-sizing: border-box;
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
::v-deep .el-dialog__body {
  padding: 8px 20px;
}
.box-card {
  width: 200px;
  height: 120px;
  border: 1px solid #b3d8ff;
  background-color: #ecf5ff;
  transition: .3s;
  border-radius: 4px;
  float: left;
  margin-right: 8px;
  margin-bottom: 8px;
  position: relative;
}
.add-card:hover {
  border-color: #409EFF !important;
  color: #409EFF !important;
}
.box-row {
  width: 100%;
  height:30px;
  display: flex;
  .box-row-left {
    width: 65px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .box-row-right {
    width:135px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}
::-webkit-scrollbar {
  display: none;
}
</style>