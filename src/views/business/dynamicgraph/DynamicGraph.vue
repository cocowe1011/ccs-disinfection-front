<template>
  <div class="dynamic">
    <el-button type="danger" icon="el-icon-close" style="position: absolute;z-index: 999;right: 35px;top: 70px;" @click="closeDynamicGraphShow"></el-button>
    <el-button type="primary" plain style="position: absolute;z-index: 999;right: 130px;top: 75px;" @click="testAcc">测试加速器</el-button>
    <div class="dynamic-left">
      <div class="dynamic-left-top">
        <div>
          <div class="card-title">实时数据监控</div>
          <div class="card-content">
            <div class="data-card" style="padding:14px 10px 7px 20px">
              <div class="data-card-border">
                <div class="data-card-border-borderTop granient-text">灭菌批号</div>
                <div class="data-card-border-borderDown" style="font-size: 1.3vw;">{{ orderMainDy.batchId }}</div>
              </div>
            </div>
            <div class="data-card" style="padding: 14px 10px 7px 10px;">
              <div class="data-card-border">
                <div class="data-card-border-borderTop">箱子长度</div>
                <div class="data-card-border-borderDown">{{ orderMainDy.boxLength }}mm</div>
              </div>
            </div>
            <div class="data-card" style="padding: 14px 20px 7px 10px;">
              <div class="data-card-border">
                <div class="data-card-border-borderTop">箱子宽度</div>
                <div class="data-card-border-borderDown">{{ orderMainDy.boxWidth }}mm</div>
              </div>
            </div>
            <div class="data-card" style="padding: 7px 10px 7px 20px;">
              <div class="data-card-border">
                <div class="data-card-border-borderTop">箱子高度</div>
                <div class="data-card-border-borderDown">{{ orderMainDy.boxHeight }}mm</div>
              </div>
            </div>
            <div class="data-card" style="padding: 7px 10px 7px 10px;">
              <div class="data-card-border">
                <div class="data-card-border-borderTop">束下设置速度</div>
                <div class="data-card-border-borderDown">{{ orderMainDy.sxSpeedSet }}mm/分钟</div>
              </div>
            </div>
            <div class="data-card" style="padding: 7px 20px 7px 10px;">
              <div class="data-card-border">
                <div class="data-card-border-borderTop granient-text">束下实时速度</div>
                <div class="data-card-border-borderDown">{{ lightBeamRealTimeSpeed }}mm/分钟</div>
              </div>
            </div>
            <div class="data-card" style="padding: 7px 10px 14px 20px;">
              <div class="data-card-border">
                <div class="data-card-border-borderTop granient-text">订单圈数</div>
                <div class="data-card-border-borderDown">{{ orderMainDy.numberTurns }}</div>
              </div>
            </div>
            <div class="data-card" style="padding: 7px 10px 14px 10px;">
              <div class="data-card-border">
                <div class="data-card-border-borderTop">模式</div>
                <div class="data-card-border-borderDown">{{ orderMainDy.trayFlag === '1' ? '托盘模式': (orderMainDy.revertFlag === '翻转' ? '翻转模式' : '回流模式') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="dynamic-left-middle">
        <div>
          <div class="card-title">操作区</div>
          <div class="card-content" style="display: flex;align-items: center;">
            <!-- 操作按钮 -->
            <div :class="['img', fullPause?'img-active':'']" @click="operationConfirm('suspend')">
              全线<br/>暂停
            </div>
            <div :class="['img', fullRun?'img-active':'']" @click="operationConfirm('run')">
              全线<br/>启动
            </div>
            <div :class="['img', fullStop?'img-active':'']" @click="operationConfirm('stop')">
              全线<br/>停止
            </div>
            <div class="img" @click="operationConfirm('reset')">
              故障<br/>复位
            </div>
            <div class="img" @click="operationConfirm('clear')">
              全线<br/>清空
            </div>
            <div class="img" v-show="isCanChangeOrder" @click="getOrderList()">
              切换<br/>订单
            </div>
          </div>
        </div>
      </div>
      <div class="dynamic-left-down">
        <div>
          <div class="card-title">
            <el-badge :value="logNotReadNumber" :max="99" class="item" :hidden="logNotReadNumber==0">
              <div :class="['log-class', logPageFlag == 'log'?'log-class-active':'']" @click="showRunlog">操作日志</div>
            </el-badge>
            &nbsp;/&nbsp;
            <el-badge :value="errorLogNotReadNumber" :max="99" class="item" :hidden="errorLogNotReadNumber==0">
              <div :class="['log-class', logPageFlag == 'error-log'?'log-class-active':'']" @click="showErrorlog">报警日志</div>
            </el-badge>
          </div>
          <div class="card-content" ref="logContainer">
            <template v-if="logPageFlag == 'log'">
              <div class="log-text" v-for="(message, index) in logArr" :key="index">
                {{ message.text }}
              </div>
            </template>
            <template v-else>
              <div class="log-text" v-for="(message, index) in errorLogArr" :key="index">
                {{ message.text }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="dynamic-right">
      <div>
        <div class="card-title">实时状态监控</div>
        <div class="card-content" style="display: flex;justify-content: center;" ref="parent">
          <div class="dyscare chuansongpadding" style="width: 900px;height: 100%;position: relative;" ref="child">
            <img src="./img/fushe2x.png" class="fusheIcon"/>
            <transition name="el-fade-in-linear">
              <img src="./img/deng.png" class="fusheguang" v-show="dengShow"/>
            </transition>
            <img src="./img/chuansongdai.png" style="width: 889.67px;height: 682.66px;margin-top:60px" />
            <div class="show-data-area" style="position: absolute;right: 80px;top: 490px;">
              <div class="show-data-area-top">ID信息</div>
              <div class="show-data-area-content">
                <el-input readonly size="small" v-model="nowABoxImitateId"></el-input>
              </div>
            </div>
            <div class="show-data-area" style="position: absolute;right: 80px;top: 528px;">
              <div class="show-data-area-top">上货扫码信息</div>
              <div class="show-data-area-content">
                <el-input v-model="loadScanCode" readonly size="small"></el-input>
              </div>
            </div>
            <div class="show-data-area" style="position: absolute;right: 80px;top: 569px;">
              <div class="show-data-area-top">当前上货数量</div>
              <div class="show-data-area-content">
                <el-input v-model="nowInNum" readonly size="small"></el-input>
              </div>
            </div>
            <div class="show-data-area" style="position: absolute;left: 178px;top: 475px;">
              <div class="show-data-area-top">ID信息</div>
              <div class="show-data-area-content">
                <el-input readonly size="small" v-model="nowEBoxImitateId"></el-input>
              </div>
            </div>
            <div class="show-data-area" style="position: absolute;left: 178px;top: 513px;">
              <div class="show-data-area-top">下货扫码信息</div>
              <div class="show-data-area-content">
                <el-input v-model="labyrinthScanCode" readonly size="small"></el-input>
              </div>
            </div>
            <div class="show-data-area" style="position: absolute;left: 194px;top: 560px;">
              <div class="show-data-area-top">当前下货数量</div>
              <div class="show-data-area-content">
                <el-input v-model="nowOutNum" readonly size="small"></el-input>
              </div>
            </div>
            <div class="show-data-area" style="position: absolute;left: 436px;top: 185px;width: 150px;height: 58px;">
              <div class="show-data-area-top" style="width: 100%;height: 26px;">束下当前货物ID</div>
              <div class="show-data-area-content" style="width: 100%;height: 26px;">
                <el-input v-model="nowShuXiaid" readonly size="small"></el-input>
              </div>
            </div>
            <div class="show-data-area" style="position: absolute;left: -35px;top: 428px;width: 150px;height: 58px;">
              <div class="show-data-area-top" style="width: 100%;height: 26px;">当前剔除数量</div>
              <div class="show-data-area-content" style="width: 100%;height: 26px;">
                <el-input v-model="nowTiChuNum" readonly size="small"></el-input>
              </div>
            </div>
            <!-- 光电星星 -->
            <div class="guangdian" style="top: 447px;right: 86px;" @click="analogOptoelectronics('A')">
              <div class='star' v-show="pointA == '1'"></div>
              <div class="pointText">A</div>
            </div>
            <div class="guangdian" style="top: 185px;right: 140px;" @click="analogOptoelectronics('B')">
              <div class='star' v-show="pointB == '1'"></div>
              <div class="pointText">B</div>
            </div>
            <div class="guangdian" style="top: 185px;right: 612px;" @click="analogOptoelectronics('C')">
              <div class='star' v-show="pointC == '1'"></div>
              <div class="pointText">C</div>
            </div>
            <div class="guangdian" style="top: 331px;right: 654px;" @click="analogOptoelectronics('D')">
              <div class='star' v-show="pointD == '1'"></div>
              <div class="pointText">D</div>
            </div>
            <div class="guangdian" style="top: 434px;right: 674px;" @click="analogOptoelectronics('E')">
              <div class='star' v-show="pointE == '1'"></div>
              <div class="pointText">E</div>
            </div>
            <div class="guangdian" style="right: 827px;top: 551px;" @click="analogOptoelectronics('F')">
              <div class='star' v-show="pointF == '1'"></div>
              <div class="pointText">F</div>
            </div>
            <div class="guangdian" style="right: 792px;top: 600px;" @click="analogOptoelectronics('G')">
              <div class='star' v-show="pointG == '1'"></div>
              <div class="pointText">G</div>
            </div>
            <div class="guangdian" style="right: 446px;top: 683px;" @click="analogOptoelectronics('H')">
              <div class='star' v-show="pointH == '1'"></div>
              <div class="pointText">H</div>
            </div>
            <!-- 电机状态 -->
            <div :class="['dianji', dianJiStatusArr[7] == '1' ? 'dianji-active' : '']" style="top: 640px;right: 133px;">100#电机</div>
            <div :class="['dianji', dianJiStatusArr[6] == '1' ? 'dianji-active' : '']" style="top: 416px;right: 6px;">101#电机</div>
            <div :class="['dianji', dianJiStatusArr[5] == '1' ? 'dianji-active' : '']" style="top: 386px;right: 190px;">102#电机</div>
            <div :class="['dianji', dianJiStatusArr[4] == '1' ? 'dianji-active' : '']" style="top: 258px;right: 190px;">103#电机</div>
            <div :class="['dianji', dianJiStatusArr[3] == '1' ? 'dianji-active' : '']" style="top: 132px;right: 190px;">104#电机</div>
            <div :class="['dianji', dianJiStatusArr[2] == '1' ? 'dianji-active' : '']" style="top: 88px;right: 450px;">105#电机</div>
            <div :class="['dianji', dianJiStatusArr[1] == '1' ? 'dianji-active' : '']" style="top: 131px;right: 538px;">106#电机</div>
            <div :class="['dianji', dianJiStatusArr[0] == '1' ? 'dianji-active' : '']" style="top: 259px;right: 516px;">107#电机</div>
            <div :class="['dianji', dianJiStatusArr[15] == '1' ? 'dianji-active' : '']" style="top: 379px;right: 516px;">108#电机</div>
            <div :class="['dianji', dianJiStatusArr[14] == '1' ? 'dianji-active' : '']" style="top: 379px;right: 641px;">109#电机</div>
            <div :class="['dianji', dianJiStatusArr[13] == '1' ? 'dianji-active' : '']" style="top: 420px;right: 727px;">110#电机</div>
            <div :class="['dianji', dianJiStatusArr[12] == '1' ? 'dianji-active' : '']" style="top: 638px;right: 730px;">111#电机</div>
            <div :class="['dianji', dianJiStatusArr[11] == '1' ? 'dianji-active' : '']" style="top: 639px;right: 627px;">112#电机</div>
            <div :class="['dianji', dianJiStatusArr[10] == '1' ? 'dianji-active' : '']" style="top: 596px;right: 450px;">113#电机</div>
            <div :class="['dianji', dianJiStatusArr[9] == '1' ? 'dianji-active' : '']" style="top: 596px;right: 264px;">114#电机</div>
            <div :class="['dianji', dianJiStatusArr[8] == '1' ? 'dianji-active' : '']" style="top: 690px;right: 367px;">115#电机</div>
            <!-- 队列信息 -->
            <el-link type="danger" style="position: absolute;top: 326px;right: 89px;font-size: 16px;font-weight: 600;" @click="showChuanSong('AB')">{{ '101-103区域货物缓存队列 (' + arrAB.length + ')' }}</el-link>
            <el-link type="danger" style="position: absolute;top: 86px;right: 113px;font-size: 16px;font-weight: 600;" @click="showChuanSong('BC')">{{ '104-106区域货物缓存队列 (' + arrBC.length + ')' }}</el-link>
            <el-link type="danger" style="position: absolute;top: 320px;right: 536px;font-size: 16px;font-weight: 600;" @click="showChuanSong('CD')">{{ '107-109区域货物缓存队列 (' + arrCD.length + ')' }}</el-link>
            <el-link type="danger" style="position: absolute;top: 445px;left: 240px;font-size: 16px;font-weight: 600;" @click="showChuanSong('DG')">{{ '110-111区域货物缓存队列 (' + (arrDG.length + tempArrF.length) + ')' }}</el-link>
            <el-link type="danger" style="position: absolute;top: 395px;left: -37px;font-size: 16px;font-weight: 600;" @click="showChuanSong('F')">{{ '剔除货物缓存队列 (' + arrF.length + ')' }}</el-link>
            <el-link type="danger" style="position: absolute;top: 689px;right: 542px;font-size: 16px;font-weight: 600;" @click="showChuanSong('GH')">{{ '下货区缓存队列 (' + (arrGH.length + thoughHArr.length) + ')' }}</el-link>
            <!-- 预警 -->
            <img src="./img/yujing.png" class="warning-img" v-show="yujingShow" style="left: 41px;top: 663px;"/>
            <img src="./img/baojing.png" class="warning-img" v-show="baojingShow" style="top: 717px;left: 352px;"/>
            <div style="width: 70px;height: 70px;left: 695px; position: absolute;background-color: lightcoral;color: white;display: flex;justify-content: center;align-items: center;" v-show="banLoadStatus">
              禁止上货
            </div>
            <el-button type="success" icon="el-icon-check" v-show="baojingShow" @click="downClick" style="position: absolute;right: 271px;top: 744px;" plain>下货完成</el-button>
          </div>
        </div>
      </div>
    </div>
    <el-drawer
      title="快捷移动-拖动表格切换队列"
      :visible.sync="drawer"
      :modal-append-to-body="false"
      border
      size="1250px">
      <div class="drawer-left">
        <div class="content_table">
          <div class="table_head">
            <table>
              <thead>
                <tr>
                    <th style="width:40px;">
                      <div>序号</div>
                    </th>
                    <th style="width: 150px">
                      <div>订单号</div>
                    </th>
                    <th style="width: 120px">
                      <div>箱编号</div>
                    </th>
                    <th style="width: 150px">
                      <div>一维/二维码信息</div>
                    </th>
                    <th style="width: 130px">
                      <div>进入时间</div>
                    </th>
                    <th style="width: 60px">
                      <div>圈数</div>
                    </th>
                    <th style="width: 60px">
                      <div>翻转</div>
                    </th>
                    <th style="width: 60px">
                      <div>已完成</div>
                    </th>
                    <th style="width: 60px">
                      <div>合格</div>
                    </th>
                    <th style="width: 60px">
                      <div>状态</div>
                    </th>
                    <th style="width: 50px">
                      <div>操作</div>
                    </th>
                  </tr>
              </thead>
            </table>
          </div>
          <div class="table_list">
            <table>
              <tbody>
                  <tr v-for="(item, index) in boxArr" class="body-col" :key="index" draggable="true" @dragstart="dragStart(index)">
                    <td style="width: 40px;">{{ index + 1 }}</td>
                    <td style="width: 150px">{{ item.orderNo }}</td>
                    <td style="width: 120px;">{{ item.boxImitateId }}</td>
                    <td style="width: 150px">{{ item.loadScanCode }}</td>
                    <td style="width: 130px">{{ item.turnsInfoList[0].passATime }}</td>
                    <td style="width: 60px">{{ item.numberTurns }}</td>
                    <td style="width: 60px">{{ item.revertFlag == '翻转' ? '√': 'X' }}</td>
                    <td style="width: 60px">{{ item.xiahuoFlag ? '√': '' }}</td>
                    <td style="width: 60px">
                      <el-tag type="success" v-if="item.qualified === '1'" size="mini">合格</el-tag>
                      <el-tag type="danger" v-else-if="item.qualified === '0'" size="mini">不合格</el-tag>
                      <div v-else></div>
                    </td>
                    <td style="width: 60px">
                      <el-tag type="success" v-if="item.xiahuoFlag" size="mini">已下货</el-tag>
                      <el-tag type="warning" v-if="item.tichuFlag === 'WAIT_PUT_OUT'" size="mini">待剔除</el-tag>
                      <el-tag type="danger" v-if="item.tichuFlag === 'HAVE_PUT_OUT'" size="mini">已剔除</el-tag>
                      <el-tag v-if="!item.xiahuoFlag && item.tichuFlag !== 'WAIT_PUT_OUT' && item.tichuFlag !== 'HAVE_PUT_OUT'" size="mini">执行中</el-tag>
                    </td>
                    <td style="width: 50px">
                      <el-popconfirm
                        :title="'确定要将' + item.boxImitateId + '在队列中删除吗？'"
                        @confirm="deleteBoxFromArr(item.boxImitateId, index)"
                      >
                        <el-button type="danger" icon="el-icon-delete" size="mini" circle slot="reference"></el-button>
                      </el-popconfirm>
                    </td>
                  </tr>
                </tbody>
            </table>
          </div><!-- <orderList id="orderListComp" ref="orderListComp" :visible="visibleOrderList" :add-data="addData" left="210px" top="95px" @changeSearchWindow="changeSearchWindow" @selectOrderItem="selectOrderItem"></orderList> -->
        </div>
      </div>
      <div class="drawer-right">
        <div :class="['transform-card',traAB?'transform-card-active':'']" @dragover.prevent @drop="dropItem('AB', $event)" @click="showCache('AB')" @dragenter="dragEnter" @dragleave="dragLeave">101-103区域队列</div>
        <div :class="['transform-card',traBC?'transform-card-active':'']" @dragover.prevent @drop="dropItem('BC', $event)" @click="showCache('BC')" @dragenter="dragEnter" @dragleave="dragLeave">104-106区域队列</div>
        <div :class="['transform-card',traCD?'transform-card-active':'']" @dragover.prevent @drop="dropItem('CD', $event)" @click="showCache('CD')" @dragenter="dragEnter" @dragleave="dragLeave">107-109区域队列</div>
        <div :class="['transform-card',traDG?'transform-card-active':'']" @dragover.prevent @drop="dropItem('DG', $event)" @click="showCache('DG')" @dragenter="dragEnter" @dragleave="dragLeave">110-111区域队列</div>
        <div :class="['transform-card',traF?'transform-card-active':'']" @dragover.prevent @drop="dropItem('F', $event)" @click="showCache('F')" @dragenter="dragEnter" @dragleave="dragLeave">剔除货物缓存队列</div>
        <div :class="['transform-card',traGH?'transform-card-active':'']" @dragover.prevent @drop="dropItem('GH', $event)" @click="showCache('GH')" @dragenter="dragEnter" @dragleave="dragLeave">下货区缓存队列</div>
      </div>
    </el-drawer>
    <el-dialog
      title="切换订单"
      :visible.sync="dialogVisible"
      append-to-body
      width="80%">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        :max-height="500"
        highlight-current-row
        v-loading="getOrderListLoading">
        <el-table-column type="index" width="80" :index="indexMethod" fixed="left" label="序号">
        </el-table-column>
        <el-table-column v-for="item in tableTitle"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :width="item.width">
        </el-table-column>
        <el-table-column
          prop="tag"
          label="来源"
          width="100"
          fixed="right">
          <template>
            <el-tag type="success" disable-transitions>手动</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="150">
          <template slot-scope="scope">
            <el-link type="success" icon="el-icon-loading" v-if="orderMainDy.orderId == scope.row.orderId">当前运行订单</el-link>
            <el-link type="primary" @click="handleCurrentChange(scope.row)" v-else>切换</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { EventBus } from '@/utils/EventBus'
import { Debugger, ipcRenderer } from 'electron'
import HttpUtil from '@/utils/HttpUtil'
import moment from 'moment';
const remote = require('electron').remote
export default {
  name: "DynamicGraph",
  components: {},
  props: {},
  data() {
    return {
      // 镭射灯样式闪烁显示
      dengShow: true,
      // 当前上货数
      nowInNum: 0,
      // 当前下货数
      nowOutNum: 0,
      // 各个区域下箱子数组
      arrAB: [],
      arrBC: [],
      arrCD: [],
      arrDG: [],
      arrGH: [],
      arrF: [], // 被剔除的箱子缓存
      tempArrF: [], // 经过E点，不合格的箱子，暂时缓存在临时队列，只有经过F点的时候，才去实际的处理箱子
      // 每个点位的值，根据收到PLC指令为准，值为1或0
      pointA: '0',
      pointB: '0',
      pointC: '0',
      pointD: '0',
      pointE: '0',
      pointF: '0',
      pointG: '0',
      pointH: '0',
      // 控制拖动传送带抽屉弹窗是否显示和隐藏
      drawer: false,
      // 当前点击的传送带区域内的箱子列表，一个中间变量
      boxArr: [],
      // 当前打开的是哪块传送带队列
      traAB: false,
      traBC: false,
      traCD: false,
      traDG: false,
      traGH: false,
      traF: false,
      // 当前被拖动元素的索引
      dragIndex: '',
      // PLC光电状态数组
      guangDianStatusArr: '',
      // PLC点击状态数组
      dianJiStatusArr: '',
      // 当前运行订单对象
      orderMainDy: {},
      // 当前圈数
      nowNumberTurns: 1,
      // 束下实际数据
      lightBeamRealTimeSpeed: 0,
      // 是否正在进入E点
      enteringPonitE: false,
      // 上料固定扫码
      loadScanCode: '',
      // 上料固定扫码(实时读PLC的码)
      loadScanCodeTemp: '',
      // 迷宫出口固定扫码
      labyrinthScanCode: '',
      // 迷宫出口固定扫码(实时读PLC的码)
      labyrinthScanCodeTemp: '',
      // l11长度，取配置
      l11: 0,
      // l2长度，取配置
      l2: 0,
      // 最后一个经过E点箱子的id，用于获取当前经过E点箱子的模拟id
      lastRouteEPoint: '',
      // 最后一个经过H点箱子的id，用于获取当前经过E点箱子的模拟id
      lastRouteHPoint: '',
      // 最后一个经过F点箱子的id，用于获取当前经过E点箱子的模拟id
      lastRouteFPoint: '',
      // 下货预警标识
      yujingShow: false,
      // 下货报警标识
      baojingShow: false,
      // 上货id信息（显示在页面上）
      nowABoxImitateId: '',
      // 下货id信息（显示在页面上）
      nowEBoxImitateId: '',
      nowShuXiaid: '', // 当前束下ID 清空
      nowTiChuNum: 0, // 当前剔除的数量，清空
      beginCountNum: 0, // 模拟id开始数，清空
      logArr: [], // 输送线运行日志
      errorLogArr: [], // PLC报警日志
      banLoadStatus: false, // 是否禁止上货
      judgeLoadPoint: 'D', // 判断禁止上货的点位
      judgeBanLoadBoxImitateId: '', // 到达判断禁止上货点位后，需要判断的箱子id
      ifNextPassABoxIsFirst: true, // 刚开始时，第一个经过A点的箱子一定是第一个
      lastNewBoxPassABoxImitateId: '', // 新增的箱子，最后一个经过A点的模拟Id
      err1: '', // PLC报警1
      err2: '', // PLC报警2
      err3: '', // PLC报警3
      err4: '', // PLC报警4
      err5: '', // PLC报警5
      err6: '', // PLC报警6
      err7: '', // PLC报警7
      err8: '', // PLC报警8
      err9: '', // PLC报警9
      err10: '', // PLC报警10
      err11: '', // PLC报警11
      err12: '', // PLC报警12
      err13: '', // PLC报警13
      err14: '', // PLC报警14
      err15: '', // PLC报警15
      err16: '', // PLC报警16
      logPageFlag: 'log', // 日志是显示传送带运行日常日志还是报警日志
      fullPause: false,
      fullRun: false,
      fullStop: false,
      judgeSpeedInterval: null, // 工艺对比添加 束下实际速度与设定速度对比，不合格报警 DBW4 加速器允许货物进入辐照区
      shuxiaSpeedProportion: 1, // 束下前输送速度比
      logNotReadNumber: 0, // 日志未读数量
      errorLogNotReadNumber: 0, // 错误日志未读数量
      timers: {},
      timersRunStatus: false,
      beltRunStatus: 0,
      status104: '0',
      status105: '0',
      isCanChangeOrder: false,
      dialogVisible: false,
      tableTitle:[
        {prop:"orderId",label:"任务编号",width:"200"},{prop:"revertFlag",label:"翻转",width:"150"},
        {prop:"batchId",label:"灭菌批号",width:"150"},{prop:"orderNo",label:"订单编号",width:"150"},{prop:"orderName",label:"订单名称",width:"150"},
        {prop:"planNum",label:"计划数量",width:"150"},{prop:"productName",label:"产品名称",width:"150"},{prop:"loadMethod",label:"装载方式",width:"150"},
        {prop:"pathName",label:"路径名称",width:"150"},{prop:"artName",label:"工艺名称",width:"150"},{prop:"acceleratorKValue",label:"加速器k值",width:"150"}
      ],
      tableData: [],
      getOrderListLoading: false,
      thoughHArr: [],
      pointjLength: 0,
      pointkLength: 0,
      pointlLength: 0,
      jAreaSpeed: 0,
      kAreaSpeed: 0,
      lAreaSpeed: 0,
      isDelayPointTime: false,
      speedOne: 1, // G-H V1比例系数
      speedTwo: 1, // G-H V2比例系数
      newDelayPointTime: 0, // GH延迟时间
      lengthOne: 0, // G-H X1长度
      lengthTwo: 0 // G-H X2长度
    };
  },
  watch: {
    beltRunStatus: {
      async handler(newVal, oldVal) {
        if(newVal == 0) {
          if(JSON.stringify(this.timers) != '{}') {
            this.pauseAllTimers()
          }
        } else if(newVal == 1) {
          if(JSON.stringify(this.timers) != '{}') {
            if(this.status104 == '1' && this.status105 == '1') {
              this.resumeAllTimers()
            }
          }
        }
      }
    },
    status104: {
      async handler(newVal, oldVal) {
        if(newVal == 0) {
          if(JSON.stringify(this.timers) != '{}') {
            this.pauseAllTimers()
          }
        } else if(newVal == 1) {
          if(JSON.stringify(this.timers) != '{}') {
            if(this.beltRunStatus == 1 && this.status105 == '1') {
              this.resumeAllTimers()
            }
          }
        }
      }
    },
    status105: {
      async handler(newVal, oldVal) {
        if(newVal == 0) {
          if(JSON.stringify(this.timers) != '{}') {
            this.pauseAllTimers()
          }
        } else if(newVal == 1) {
          if(JSON.stringify(this.timers) != '{}') {
            if(this.status104 == '1' && this.beltRunStatus == 1) {
              this.resumeAllTimers()
            }
          }
        }
      }
    },
    pointA: {
      async handler(newVal, oldVal) {
        if(newVal === '1') { //货物开始进入A点
          // 碰到A，清零读码信息
          this.loadScanCode = ''
          if(this.nowNumberTurns == 1) {
            // 第一圈，仍然是新增，按照要求生成模拟id策略
            const boxImitateId = await this.getCurrentTimeSort();
            this.nowABoxImitateId = boxImitateId;
            // 代表货物进入光电A，生成模拟id绑定,如果有扫码数据则
            this.arrAB.push({orderId: this.orderMainDy.orderId, orderNo: this.orderMainDy.orderNo, totalNumberTurns: this.orderMainDy.numberTurns, revertShowFlag: this.orderMainDy.revertFlag, boxImitateId: boxImitateId, numberTurns: 1, loadScanCode: this.loadScanCode, turnsInfoList:[{numberTurns: 1, passATime: moment().format('YYYY-MM-DD HH:mm:ss')}]});
            // 判断当前箱子是不是当前批次消毒的第一个
            if(this.ifNextPassABoxIsFirst) {
              this.judgeBanLoadBoxImitateId = boxImitateId;
              this.ifNextPassABoxIsFirst = false; // 设置为false,下一个经过A点的箱子绝不是此批次第一个箱子了
            }
            this.lastNewBoxPassABoxImitateId = boxImitateId;
            // 新上货物时，报警和预警先关闭
            this.yujingShow = false;
            this.baojingShow = false;
            // 新上货物时，经过H点模拟id值赋值为arrGH 最后一个元素的值,并且给arrGH内所有元素一个作废标识，后续不处理这些作废的元素
            if(this.arrGH.length > 0) {
              for (let index = this.arrGH.length - 1; index >= 0; index--) {
                // 如果订单圈数和箱子当前圈数一致才会进入作废队列
                // this.arrGH[indexHBox].numberTurns >= this.arrGH[indexHBox].totalNumberTurns
                if(this.arrGH[index].numberTurns >= this.arrGH[index].totalNumberTurns) {
                  this.thoughHArr.push(this.arrGH[index]);
                  this.arrGH.splice(index, 1)
                }
              }
              this.lastRouteHPoint = '';
            } else {
              this.lastRouteHPoint = '';
            }
            // 上货数量+1
            this.nowInNum++;
            // 模拟id数+1
            this.beginCountNum++;
            // 判断上货数和订单箱数的数量，如果满足则锁定上货
            // 正德无需判断了
            // if(Number(this.nowInNum) === Number(this.orderMainDy.orderBoxNum)) {
            //   ipcRenderer.send('writeValuesToPLC', 'DBW26', 1); // 锁定上货电机（保留）
            //   this.banLoadStatus = true; // 显示禁止上货图标
            // }
            // 生成日志
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateId + '进入A点', 'log');
          } else {
            // 把GH队列最开始箱子加入AB对接，并修改圈数
            if(this.arrGH[0] != undefined) {
              // 判断A点这个箱子是不是该下货了，如果该下货，不加入A队列
              if(this.arrGH[0].numberTurns < this.arrGH[0].totalNumberTurns) {
                this.arrAB.push(this.arrGH[0]);
                this.arrGH.splice(0, 1)
                this.arrAB[this.arrAB.length - 1].numberTurns = this.arrAB[this.arrAB.length - 1].numberTurns + 1;
                const nowTurns = this.arrAB[this.arrAB.length - 1].numberTurns;
                this.arrAB[this.arrAB.length - 1].turnsInfoList.push({numberTurns: nowTurns, passATime: moment().format('YYYY-MM-DD HH:mm:ss')});
                // 显示箱子模拟id
                this.nowABoxImitateId = this.arrAB[this.arrAB.length - 1].boxImitateId;
                // 生成日志
                this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.nowABoxImitateId + '进入A点', 'log');
              }
            }
          }
        } else { // 货物走出A点
          if(this.arrAB[this.arrAB.length - 1] != undefined) {
            this.dealBoxLogic('A')
          }
        }
      }
    },
    pointB: {
      handler(newVal, oldVal) {
        if(newVal === '1') { //货物开始进入B点
          if(this.arrAB.length > 0) {
            // 进入B的下降沿，获取AB队列第一个，开始计算时间，到时间后，进行工艺对比，判断货物是否合格
            const boxImitateId = this.arrAB[0].boxImitateId;
            // 计算时间 改为任务管理
            const times = this.calculateMilliseconds(((Number(this.l11))/Number(this.lightBeamRealTimeSpeed)).toFixed(2),(Number(this.l2)/(Number(this.orderMainDy.sxSpeedSet)  * (this.shuxiaSpeedProportion/100)) ).toFixed(2));
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateId + '开始进入B点，计算时间-L1长度：' + this.l11  + ' 束下速度：' + this.lightBeamRealTimeSpeed  + ' 束下设置速度：' + this.orderMainDy.sxSpeedSet + ' L2长度：' + this.l2 + ' 束下速度比' + this.shuxiaSpeedProportion + ' 总时间：' + times, 'log');
            this.startTimerWithDelay(boxImitateId, times)
          }
        } else { // 货物走出B点
          if(this.arrAB.length > 0) {
            this.dealBoxLogic('B')
          }
        }
      }
    },
    pointC: {
      handler(newVal, oldVal) {
        if(this.arrBC.length > 0) {
          this.dealBoxLogic('C')
        }
      }
    },
    pointD: {
      handler(newVal, oldVal) {
        if(this.arrCD.length > 0) {
          this.dealBoxLogic('D')
        }
      }
    },
    pointE: {
      handler(newVal, oldVal) {
        // 进入E点的，剔除不合格的箱子，给PLC发送剔除指令
        // enteringPonitE
        if(!this.enteringPonitE && newVal === '1' && oldVal === '0') { //货物开始进入E点
          this.enteringPonitE = true
          if(this.arrDG.length > 0) {
            // 进入E点，清空读码信息
            this.labyrinthScanCode = '';
            this.dealBoxLogic('E')
          }
        } else if(this.enteringPonitE && newVal === '0' && oldVal === '1') { // 货物走出E点
          // 进入E点写1，离开E点写0。
          ipcRenderer.send('writeValuesToPLC', 'DBW18', 0);
          this.enteringPonitE = false
          if(this.arrDG.length > 0) {
            // 走出E点，读码
            this.labyrinthScanCode = this.labyrinthScanCodeTemp.replace(/\s/g,'');
            // 查找DG数组，lastRouteEPoint的元素，那么下一个必定是此时经过E点的元素
            // const indexLast = this.arrDG.findIndex(item => {
            //   return item.boxImitateId === this.lastRouteEPoint
            // })

            // if(indexLast != -1) {
            //   this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + '货物' + this.arrDG[indexLast].boxImitateId + '走出E点，扫码信息：' + this.labyrinthScanCode, 'log');
            // } else {
            //   // 找不到说明剔除了，去剔除缓存队列找
            //   const indexLast2 = this.tempArrF.findIndex(item => {
            //     return item.boxImitateId === this.lastRouteEPoint
            //   })
            //   this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + '货物' + this.arrDG[0].boxImitateId + '走出E点，扫码信息：' + this.labyrinthScanCode, 'log');
            // }
          }
        } else {
          // 先暂定报警吧，因为肯定不会出现这种情况，出现了视为异常，不做任何处理
          alert('异常！程序走到一个不该走到的地方！')
        }
      }
    },
    pointF: {
      handler(newVal, oldVal) {
        this.dealBoxLogic('F')
      }
    },
    pointG: {
      handler(newVal, oldVal) {
        if(this.arrDG.length > 0 || (this.arrDG.length == 0 && newVal == '0')) {
          if(newVal == '1') {
            this.dealBoxLogic('G')
          } else {
            // 20240315修改为要下货的首箱  到达G点后  直接下货写1 ，等尾箱离开G点后 ，下货写0 ，不再是进入1离开0
            // 判断一下当前箱子是不是尾箱
            if (this.arrAB.length === 0 && this.arrBC.length === 0 && this.arrCD.length === 0 && this.arrDG.length === 0) {
              ipcRenderer.send('writeValuesToPLC', 'DBW16', 0);
            }
          }
        }
      }
    },
    pointH: {
      handler(newVal, oldVal) {
        if(this.arrGH.length > 0) {
          if(newVal == '1') {
            this.dealBoxLogic('H')
          } else {
            ipcRenderer.send('writeValuesToPLC', 'DBW16', 0);
            ipcRenderer.send('writeValuesToPLC', 'DBW38', 0);
          }
        }  
      }
    },
    err1: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 输送线上线急停被按下
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 输送线上线急停被按下!', 'error')
        }
      }
    },
    err2: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 输送线下线急停被按下
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 输送线下线急停被按下!', 'error')
        }
      }
    },
    err3: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 输送线电箱急停被按下
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 输送线电箱急停被按下!', 'error')
        }
      }
    },
    err4: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 输送线变频过载
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 输送线变频过载!', 'error')
        }
      }
    },
    err5: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 束下输送线变频过载
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 束下输送线变频过载!', 'error')
        }
      }
    },
    err6: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 不翻转模式下，翻转叉子未卸。
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 不翻转模式下，翻转叉子未卸。!', 'error')
        }
      }
    },
    err7: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 翻转机故障报警
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 翻转机故障报警!', 'error')
        }
      }
    },
    err8: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 剔除机构故障报警
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 剔除机构故障报警!', 'error')
        }
      }
    },
    err9: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 束下进货堵料
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 束下进货堵料!', 'error')
        }
      }
    },
    err10: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 束下出货堵料
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 束下出货堵料!', 'error')
        }
      }
    },
    err11: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 货物到达链板前加速器不允许进入报警停机
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物到达链板前加速器不允许进入报警停机!', 'error')
        }
      }
    },
    err12: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 居中机构运转超限报警
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 居中机构运转超限报警!', 'error')
        }
      }
    },
    err13: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 不翻转模式下113翻转处箱子堵料报警
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 不翻转模式下113翻转处箱子堵料报警!', 'error')
        }
      }
    },
    err14: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 不翻转模式下114翻转处箱子堵料报警
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 不翻转模式下114翻转处箱子堵料报警!', 'error')
        }
      }
    },
    err15: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 下货箱子未卸货，误进入翻转机构
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 下货箱子未卸货，误进入翻转机构!', 'error')
        }
      }
    },
    err16: {
      handler(newVal, oldVal){
        if(newVal == '1') {
          // 加速器紧急停机
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 加速器紧急停机!', 'error')
        }
      }
    }
  },
  computed: {},
  methods: {
    createLog(msg, type) {
      if(type == 'log') {
        // 生成日志
        this.logArr.push({text: msg})
        this.$nextTick(() => {
          this.scrollToBottom();
        });
        // 如果当前日志在显示的是报警列表，运行日志有新日志要徽标提示
        if(this.logPageFlag == 'error-log') {
          this.logNotReadNumber++;
        }
      } else {
        this.errorLogArr.push({text: msg})
        // 如果当前日志在显示的是运行列表，报警日志有新日志要徽标提示
        if(this.logPageFlag == 'error-log') {
          this.errorLogNotReadNumber++;
        }
      }
      // 同时往本地写日志
      ipcRenderer.send('writeLogToLocal', msg);
    },
    scrollToBottom() {
      const logContainer = this.$refs.logContainer;
      // logContainer.scrollTop = logContainer.scrollHeight;
      const tolerance = 120; // 容差值，可以根据需要调整
      const isNearBottom = logContainer.scrollHeight - logContainer.scrollTop - logContainer.clientHeight < tolerance;
      if (isNearBottom) {
        logContainer.scrollTo({
          top: logContainer.scrollHeight,
          behavior: "smooth"
        });
      }
    },
    qualified4Box(boxImitateIdVal, status) {
      //判断箱子在哪个队列 AB BC CD DG GH,status为true为合格，false为不合格
      for (let index = 0; index < this.arrBC.length; index++) {
        if(this.arrBC[index].boxImitateId == boxImitateIdVal) {
          if(this.arrBC[index].turnsInfoList[this.arrBC[index].numberTurns - 1].qualified == undefined) {
            this.arrBC[index].qualified = status?'1':'0';
            // 给当前圈也赋值合格
            this.arrBC[index].turnsInfoList[this.arrBC[index].numberTurns - 1].qualified = status?'1':'0';
            if(!status) {
              // 给后一个箱子赋值不合格
              if(index < this.arrBC.length - 1) {
                this.arrBC[index + 1].qualified = '0';
                // 给当前圈也赋值合格
                this.arrBC[index + 1].turnsInfoList[this.arrBC[index + 1].numberTurns - 1].qualified = '0';
                this.arrBC[index + 1].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物前后出现不合格箱子，疑似不合格！';
              }
              // 给前一个箱子赋值不合格  
              if(index >= 1) {
                this.arrBC[index - 1].qualified = '0';
                // 给当前圈也赋值合格
                this.arrBC[index - 1].turnsInfoList[this.arrBC[index - 1].numberTurns - 1].qualified = '0';
                this.arrBC[index - 1].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物前后出现不合格箱子，疑似不合格！';
              }  
            }
          }
          break;
        }
      }
    },
    judgeAccData(accData, boxImitateIdVal) {
      const index = this.arrBC.findIndex(item => {
        return item.boxImitateId === boxImitateIdVal
      })
      if(index != -1) {
        // 判断束流 beam
        // console.log(accData.beam)
        if(accData.beam != undefined && accData.beam != null) {
          if (Number(this.orderMainDy.slLowerLimit) > Number(accData.beam) || Number(this.orderMainDy.slUpperLimit) < Number(accData.beam)) {
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！束流设定最小值：' + this.orderMainDy.slLowerLimit + '，束流设定最大值：' + this.orderMainDy.slUpperLimit + '，束流读取值：' + accData.beam, 'log');
            this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！束流设定最小值：' + this.orderMainDy.slLowerLimit + '，束流设定最大值：' + this.orderMainDy.slUpperLimit + '，束流读取值：' + accData.beam;
            return false;
          } 
        } else {
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！束流设定最小值：' + this.orderMainDy.slLowerLimit + '，束流设定最大值：' + this.orderMainDy.slUpperLimit + '，束流读取值：' + accData.beam, 'log');
          this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！束流设定最小值：' + this.orderMainDy.slLowerLimit + '，束流设定最大值：' + this.orderMainDy.slUpperLimit + '，束流读取值：' + accData.beam;
          return false;
        }
        // 判断功率 power
        // console.log(accData.power)
        if(accData.power != undefined && accData.power != null) {
          if (Number(this.orderMainDy.glLowerLimit) > Number(accData.power) || Number(this.orderMainDy.glUpperLimit) < Number(accData.power)) {
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！功率设定最小值：' + this.orderMainDy.glLowerLimit + '，功率设定最大值：' + this.orderMainDy.glUpperLimit + '，功率读取值：' + accData.power, 'log');
            this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！功率设定最小值：' + this.orderMainDy.glLowerLimit + '，功率设定最大值：' + this.orderMainDy.glUpperLimit + '，功率读取值：' + accData.power;
            return false;
          } 
        } else {
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！功率设定最小值：' + this.orderMainDy.glLowerLimit + '，功率设定最大值：' + this.orderMainDy.glUpperLimit + '，功率读取值：' + accData.power, 'log');
          this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！功率设定最小值：' + this.orderMainDy.glLowerLimit + '，功率设定最大值：' + this.orderMainDy.glUpperLimit + '，功率读取值：' + accData.power;
          return false;
        }
        // 判断扫宽 scanW
        // console.log(accData.scanW)
        if(accData.scanW != undefined && accData.scanW != null) {
          if (Number(this.orderMainDy.skLowerLimit) > Number(accData.scanW) || Number(this.orderMainDy.skUpperLimit) < Number(accData.scanW)) {
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！扫宽设定最小值：' + this.orderMainDy.skLowerLimit + '，扫宽设定最大值：' + this.orderMainDy.skUpperLimit + '，扫宽读取值：' + accData.scanW, 'log');
            this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！扫宽设定最小值：' + this.orderMainDy.skLowerLimit + '，扫宽设定最大值：' + this.orderMainDy.skUpperLimit + '，扫宽读取值：' + accData.scanW;
            return false;
          } 
        } else {
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！扫宽设定最小值：' + this.orderMainDy.skLowerLimit + '，扫宽设定最大值：' + this.orderMainDy.skUpperLimit + '，扫宽读取值：' + accData.scanW, 'log');
          this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！扫宽设定最小值：' + this.orderMainDy.skLowerLimit + '，扫宽设定最大值：' + this.orderMainDy.skUpperLimit + '，扫宽读取值：' + accData.scanW;
          return false;
        }
        // 判断扫描频率 scanF
        // console.log(accData.scanF)
        if(accData.scanF != undefined && accData.scanF != null) {
          if (Number(this.orderMainDy.smplLowerLimit) > Number(accData.scanF) || Number(this.orderMainDy.smplUpperLimit) < Number(accData.scanF)) {
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！扫描频率设定最小值：' + this.orderMainDy.smplLowerLimit + '，扫描频率设定最大值：' + this.orderMainDy.smplUpperLimit + '，扫描频率读取值：' + accData.scanF, 'log');
            this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！扫描频率设定最小值：' + this.orderMainDy.smplLowerLimit + '，扫描频率设定最大值：' + this.orderMainDy.smplUpperLimit + '，扫描频率读取值：' + accData.scanF;
            return false;
          } 
        } else {
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！扫描频率设定最小值：' + this.orderMainDy.smplLowerLimit + '，扫描频率设定最大值：' + this.orderMainDy.smplUpperLimit + '，扫描频率读取值：' + accData.scanF, 'log');
          this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！扫描频率设定最小值：' + this.orderMainDy.smplLowerLimit + '，扫描频率设定最大值：' + this.orderMainDy.smplUpperLimit + '，扫描频率读取值：' + accData.scanF;
          return false;
        }
        // 判断PFN电压 pfn
        // console.log(accData.pfn)
        if(accData.pfn != undefined && accData.pfn != null) {
          if (Number(this.orderMainDy.pfnLowerLimit) > Number(accData.pfn) || Number(this.orderMainDy.pfnUpperLimit) < Number(accData.pfn)) {
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！PFN电压设定最小值：' + this.orderMainDy.pfnLowerLimit + '，PFN电压设定最大值：' + this.orderMainDy.pfnUpperLimit + '，PFN电压读取值：' + accData.pfn, 'log');
            this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！PFN电压设定最小值：' + this.orderMainDy.pfnLowerLimit + '，PFN电压设定最大值：' + this.orderMainDy.pfnUpperLimit + '，PFN电压读取值：' + accData.pfn;
            return false;
          } 
        } else {
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！PFN电压设定最小值：' + this.orderMainDy.pfnLowerLimit + '，PFN电压设定最大值：' + this.orderMainDy.pfnUpperLimit + '，PFN电压读取值：' + accData.pfn, 'log');
          this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！PFN电压设定最小值：' + this.orderMainDy.pfnLowerLimit + '，PFN电压设定最大值：' + this.orderMainDy.pfnUpperLimit + '，PFN电压读取值：' + accData.pfn;
          return false;
        }
        // 判断能量 energy
        // console.log(accData.energy)
        if(accData.energy != undefined && accData.energy != null) {
          if (Number(this.orderMainDy.nlLowerLimit) > Number(accData.energy) || Number(this.orderMainDy.nlUpperLimit) < Number(accData.energy)) {
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！能量设定最小值：' + this.orderMainDy.nlLowerLimit + '，能量设定最大值：' + this.orderMainDy.nlUpperLimit + '，能量读取值：' + accData.energy, 'log');
            this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！能量设定最小值：' + this.orderMainDy.nlLowerLimit + '，能量设定最大值：' + this.orderMainDy.nlUpperLimit + '，能量读取值：' + accData.energy;
            return false;
          } 
        } else {
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！能量设定最小值：' + this.orderMainDy.nlLowerLimit + '，能量设定最大值：' + this.orderMainDy.nlUpperLimit + '，能量读取值：' + accData.energy, 'log');
          this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！能量设定最小值：' + this.orderMainDy.nlLowerLimit + '，能量设定最大值：' + this.orderMainDy.nlUpperLimit + '，能量读取值：' + accData.energy;
          return false;
        }
        // 判断束下速度 speed
        // console.log(accData.speed)
        if(accData.speed != undefined && accData.speed != null) {
          if (Number(this.orderMainDy.sxSpeedLowerLimit) > (Number(accData.speed) * 1000) || Number(this.orderMainDy.sxSpeedUpperLimit) < (Number(accData.speed) * 1000)) {
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！束下速度设定最小值：' + this.orderMainDy.sxSpeedLowerLimit + '，束下速度设定最大值：' + this.orderMainDy.sxSpeedUpperLimit + '，束下速度读取值：' + (Number(accData.speed) * 1000), 'log');
            this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！束下速度设定最小值：' + this.orderMainDy.sxSpeedLowerLimit + '，束下速度设定最大值：' + this.orderMainDy.sxSpeedUpperLimit + '，束下速度读取值：' + (Number(accData.speed) * 1000);
            return false;
          } 
        } else {
          this.arrBC[index].failReason = moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！束下速度设定最小值：' + this.orderMainDy.sxSpeedLowerLimit + '，束下速度设定最大值：' + this.orderMainDy.sxSpeedUpperLimit + '，束下速度读取值：' + (Number(accData.speed) * 1000);
          return false;
        }
        this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺合格！', 'log');
      } else {
        // 找不着直接默认合格
        this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺合格！', 'log');
      }
      return true;
    },
    testAcc() {
      HttpUtil.get('/box/getAccData').then((res)=> {
        this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 加速器返回数据：' + JSON.stringify(res), 'log');
      }).catch((err)=> {
        this.$message.error('连接加速器失败！原因：' + err)
        this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 连接加速器失败！原因：' + err, 'log');
      });
    },
    // 拿到模拟id去判断箱子的工艺是否合格
    getUndercutProcess(boxImitateIdVal) {
      this.nowShuXiaid = boxImitateIdVal;
      this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '到达束下，开始读取加速器数值！', 'log');
      // 无加速器时放开此注释********************************************
      // this.qualified4Box(boxImitateIdVal, true)
      // this.$message.success(this.nowShuXiaid + '合格！');
      // 无加速器时放开此注释*********************************************
      // 测试一个箱子不合格，，前后两个箱子都不合格*************************
      // if(boxImitateIdVal == '202307260003') {
      //   this.qualified4Box(boxImitateIdVal, false)
      //   this.$message.error(this.nowShuXiaid + '不合格！');
      // } else {
      //   this.qualified4Box(boxImitateIdVal, true)
      //   this.$message.success(this.nowShuXiaid + '合格！');
      // }
      // 测试一个箱子不合格，，前后两个箱子都不合格*************************

      // 获取当前加速器工艺，和系统设置工艺做比较
      HttpUtil.get('/box/getAccDataByLocal').then((res)=> {
        // 给当前箱子赋值acc读取值
        const index = this.arrBC.findIndex(item => {
          return item.boxImitateId === boxImitateIdVal
        })
        if(index != -1) {
          // 给箱子设置读取值
          this.arrBC[index].turnsInfoList[this.arrBC[index].numberTurns - 1].slRead = res.data.beam;
          this.arrBC[index].turnsInfoList[this.arrBC[index].numberTurns - 1].glRead = res.data.power;
          this.arrBC[index].turnsInfoList[this.arrBC[index].numberTurns - 1].skRead = res.data.scanW;
          this.arrBC[index].turnsInfoList[this.arrBC[index].numberTurns - 1].smplRead = res.data.scanF;
          this.arrBC[index].turnsInfoList[this.arrBC[index].numberTurns - 1].pfnRead = res.data.pfn;
          this.arrBC[index].turnsInfoList[this.arrBC[index].numberTurns - 1].nlRead = res.data.energy;
          this.arrBC[index].turnsInfoList[this.arrBC[index].numberTurns - 1].sxSpeedRead = (Number(res.data.speed) * 1000);
        }
        if(res.data&&JSON.stringify(this.orderMainDy) != '{}' && this.judgeAccData(res.data, boxImitateIdVal)) {
          this.$message({
            type: 'success',
            message: '箱子id' + boxImitateIdVal + '工艺合格！更新状态！'
          });
          this.qualified4Box(boxImitateIdVal, true)
        } else {
          this.$message({
            type: 'warning',
            message: '箱子id' + boxImitateIdVal + '工艺不合格！更新状态！'
          });
          this.qualified4Box(boxImitateIdVal, false)
        }
      }).catch((err)=> {
        this.$message({
          type: 'warning',
          message: '箱子id' + boxImitateIdVal + '工艺不合格！更新状态！'
        });
        this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + boxImitateIdVal + '工艺不合格！数据异常！'+ err, 'log');
        this.qualified4Box(boxImitateIdVal, false)
      });
    },
    analogOptoelectronics(point) {
      switch (point) {
        case 'A':
          this.pointA = this.pointA === '1' ? '0' : '1'
          break;
        case 'B':
          this.pointB = this.pointB === '1' ? '0' : '1'
          break;
        case 'C':
          this.pointC = this.pointC === '1' ? '0' : '1'
          break;
        case 'D':
          this.pointD = this.pointD === '1' ? '0' : '1'
          break;
        case 'E':
          this.pointE = this.pointE === '1' ? '0' : '1'
          break;
        case 'F':
          this.pointF = this.pointF === '1' ? '0' : '1'
          break;
        case 'G':
          this.pointG  = this.pointG === '1' ? '0' : '1'
          break;
        case 'H':
          this.pointH = this.pointH === '1' ? '0' : '1'
          break;
        default:
          break;
      }
    },
    replaceOrderData(orderMain) {
      if(orderMain.orderId === this.orderMainDy.orderId) {
        this.orderMainDy = JSON.parse(JSON.stringify(orderMain));
        this.orderMainDy.revertFlag = this.orderMainDy.revertFlag == '1' ? '翻转' : ''
        this.$message.success('修改信息已同步到当前使用订单！')
      }
    },
    showOrderInfo(orderMain, changeFlag) {
      this.orderMainDy = JSON.parse(JSON.stringify(orderMain))
      // 切换订单过来的不走这段逻辑
      if(!changeFlag) {
        this.fullRun = false;
        this.fullPause = false;
        this.fullStop = false;
        // 先清空定时器
        // if(this.judgeSpeedInterval) {
        //   clearInterval(this.judgeSpeedInterval);
        // }
        // 开始监听束下实际速度和设定速度,不合格，加速器不允许货物进入辐照区
        // this.judgeSpeedInterval = setInterval(() => {
        //   if(this.lightBeamRealTimeSpeed != null && this.lightBeamRealTimeSpeed != undefined && this.lightBeamRealTimeSpeed != '') {
        //     if((Number(this.lightBeamRealTimeSpeed) >= Number(this.orderMainDy.sxSpeedLowerLimit)) && (Number(this.lightBeamRealTimeSpeed) <= Number(this.orderMainDy.sxSpeedUpperLimit))) {
        //       ipcRenderer.send('writeValuesToPLC', 'DBW4', 1);
        //     } else {
        //       ipcRenderer.send('writeValuesToPLC', 'DBW4', 0);
        //     }
        //   } else {
        //     ipcRenderer.send('writeValuesToPLC', 'DBW4', 0);
        //   }
        // }, 1000);
      } else {
        // 全线清空
        this.clearAllData(true);
        // 启动PLC
        this.startPLC();
      }
    },
    dragStart(index) {
      // 将被拖动的元素的索引存储在数据传输对象中
      this.dragIndex = index
    },
    dropItem(zoneId, event) {
      // 防止浏览器打开拖动的元素的URL
      event.preventDefault();
      // 获取目标区域的ID
      const dropZoneId = zoneId;
      // 执行不同的逻辑，根据目标区域的ID
      // 判断拖拽的是哪个数组的
      switch (dropZoneId) {
        case 'AB':
          this.arrAB.push(this.boxArr[this.dragIndex]);
          this.$notify({
            title: '移动成功！',
            message: '成功移至A-B区域',
            position: 'top-left',
            offset: 70,
            duration:0,
            type: 'success'
          });
          break;
        case 'BC':
          this.arrBC.push(this.boxArr[this.dragIndex]);
          this.$notify({
            title: '移动成功！',
            message: '成功移至B-C区域',
            position: 'top-left',
            offset: 70,
            duration:0,
            type: 'success'
          });
          break;
        case 'CD':
          this.arrCD.push(this.boxArr[this.dragIndex]);
          this.$notify({
            title: '移动成功！',
            message: '成功移至C-D区域',
            position: 'top-left',
            offset: 70,
            duration:0,
            type: 'success'
          });
          break;
        case 'DG':
          this.arrDG.push(this.boxArr[this.dragIndex]);
          this.$notify({
            title: '移动成功！',
            message: '成功移至D-G区域',
            position: 'top-left',
            offset: 70,
            duration:0,
            type: 'success'
          });
          break;
        case 'F':
          this.arrF.push(this.boxArr[this.dragIndex]);
          this.$notify({
            title: '移动成功！',
            message: '成功移至F区域',
            position: 'top-left',
            offset: 70,
            duration:0,
            type: 'success'
          });
          break;
        case 'GH':
          this.arrGH.push(this.boxArr[this.dragIndex]);
          this.$notify({
            title: '移动成功！',
            message: '成功移至G-H区域',
            position: 'top-left',
            offset: 70,
            duration:0,
            type: 'success'
          });
          break;
        default:
          break;
      }
      this.boxArr.splice(this.dragIndex,1);
      // 出去拖动背景色
      const draggingRows = document.querySelectorAll(".transform-card.hover");
      draggingRows.forEach(row => {
        row.classList.remove("hover");
      });
    },
    dragEnter(event) {
      event.preventDefault();
      event.stopPropagation();
      event.target.classList.add('hover');
    },
    dragLeave(event) {
      event.preventDefault();
      event.stopPropagation();
      event.target.classList.remove('hover');
    },
    indexMethod(index) {
      return index + 1;
    },
    deleteBoxFromArr(boxImitateId, index) {
      if(this.traAB) {
        this.arrAB.splice(index, 1)
        this.boxArr = this.arrAB;
        this.nowInNum--;
      } else if(this.traBC) {
        this.arrBC.splice(index, 1)
        this.boxArr = this.arrBC;
        this.nowInNum--;
        // BC需要直接把定时器删掉
      } else if(this.traCD) {
        this.arrCD.splice(index, 1)
        this.boxArr = this.arrCD;
        this.nowInNum--;
      } else if(this.traDG) {
        if(index > this.arrDG.length - 1) {
          this.arrDG.splice(index, 1)
        } else {
          this.tempArrF.splice(index - this.arrDG.length, 1)
        }
        this.boxArr = [...this.arrDG, ...this.tempArrF] ;
        this.nowInNum--;
      } else if(this.traGH) {
        this.arrGH.splice(index, 1)
        this.boxArr = this.arrGH;
        this.nowInNum--;
      } else if(this.traF) {
        this.arrF.splice(index, 1)
        this.boxArr = this.arrF;
        this.nowInNum--;
      }
      this.deleteTimersByBoxImitateId(boxImitateId);
    },
    showCache(transform) {
      this.boxArr = [];
      this.traAB = false
      this.traBC = false
      this.traCD = false
      this.traDG = false
      this.traGH = false
      this.traF = false
      switch (transform) {
        case 'AB':
          this.boxArr = this.arrAB;
          this.traAB = true
          break;
        case 'BC':
          this.boxArr = this.arrBC;
          this.traBC = true
          break;
        case 'CD':
          this.boxArr = this.arrCD;
          this.traCD = true
          break;
        case 'DG':
          this.boxArr = [...this.arrDG, ...this.tempArrF] ;
          this.traDG = true
          break;
        case 'F':
          this.boxArr = this.arrF;
          this.traF = true
          break;
        case 'GH':
          this.boxArr = [...this.arrGH, ...this.thoughHArr];
          this.traGH = true
          break;
        default:
          break;
      }
    },
    showChuanSong(transform) {
      this.drawer = true
      this.showCache(transform);
    },
    async getCurrentTimeSort() {
      const date = new Date();//当前时间
      const month = this.zeroFill(date.getMonth() + 1);//月
      const day = this.zeroFill(date.getDate());//日
      return date.getFullYear() + '' + month + '' + day + String(this.beginCountNum + 1).padStart(4, '0');
    },
    zeroFill(i){
      if (i >= 0 && i <= 9) {
      return '0' + i;
      } else {
      return i;
      }
    },
    async dealBoxLogic(point) {
      // 这些判断逻辑都不对，得改，因为point*都是在随时变化的，万一变化速度快，从1变0，那么就会丢失这次光电触发状态
      // 正确修改方法：直接在watch方法判断值，一变化接着调用这个方法，并且传固参，不再判断point*变量
      switch (point) {
        case 'A':
        if(this.nowNumberTurns == 1) {
            // 走出A 读码
            this.loadScanCode = this.loadScanCodeTemp.replace(/\s/g,'');
            this.arrAB[this.arrAB.length - 1].loadScanCode = this.loadScanCode;
          } else {
            // 判断是否满足可上货条件，就是当前这批消毒的箱子，最后一个满足圈数并且离开A，即可上货 - 2024/04/25正德修改
            if(this.arrAB[this.arrAB.length - 1].boxImitateId == this.lastNewBoxPassABoxImitateId) {
              if(this.arrAB[this.arrAB.length - 1].numberTurns == this.arrAB[this.arrAB.length - 1].totalNumberTurns) {
                // 开始上新货，当前箱子圈数变成1
                this.nowNumberTurns = 1;
                this.ifNextPassABoxIsFirst = true;
                this.judgeBanLoadBoxImitateId = ''
                // 给PLC发送允许上货命令
                ipcRenderer.send('writeValuesToPLC', 'DBW26', 0);
                this.banLoadStatus = false; // 隐藏禁止上货图标
              }
            }
            // 走出A 读码
            this.loadScanCode = this.loadScanCodeTemp.replace(/\s/g,'');
            // 判断当前箱子的二维码和扫出来的码是否一致
            if(this.arrAB[this.arrAB.length - 1].loadScanCode == '' || this.arrAB[this.arrAB.length - 1].loadScanCode == null || this.arrAB[this.arrAB.length - 1].loadScanCode == undefined) {
              this.arrAB[this.arrAB.length - 1].loadScanCode = this.loadScanCode;
            } else {
              if(this.loadScanCode != '' && this.loadScanCode != this.arrAB[this.arrAB.length - 1].loadScanCode) {
                // 第二圈和第一圈扫码不一致，报警
                ipcRenderer.send('writeValuesToPLC', 'DBW34', 1);
              }
            }
          }
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrAB[this.arrAB.length - 1].boxImitateId + '离开A点，扫码信息：' + this.loadScanCode, 'log');
          break;
        case 'B':
          // 把AB队列第一个货物出列，进入BC
          this.arrBC.push(this.arrAB[0]);
          // BC刚进队列的箱子，设置 经过B点的时间
          this.arrBC[this.arrBC.length - 1].turnsInfoList[this.arrBC[this.arrBC.length - 1].numberTurns - 1].passBTime = moment().format('YYYY-MM-DD HH:mm:ss');
          // 删除AB队列第一个
          this.arrAB.splice(0,1)
          // 生成日志
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrBC[this.arrBC.length - 1].boxImitateId + '经过B点，扫码信息：' + this.arrBC[this.arrBC.length - 1].loadScanCode, 'log');
          break;
        case 'C':
          if(this.pointC === '1') {
            this.arrCD.push(this.arrBC[0]);
            this.arrCD[this.arrCD.length - 1].turnsInfoList[this.arrCD[this.arrCD.length - 1].numberTurns - 1].passCTime = moment().format('YYYY-MM-DD HH:mm:ss');
            // 删除BC队列第一个
            this.arrBC.splice(0,1);
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrCD[this.arrCD.length - 1].boxImitateId + '经过C点，扫码信息：' + this.arrCD[this.arrCD.length - 1].loadScanCode, 'log');
            // 允许切换订单
            if(this.arrCD[this.arrCD.length - 1].boxImitateId == this.lastNewBoxPassABoxImitateId) {
              if(this.arrCD[this.arrCD.length - 1].numberTurns == this.arrCD[this.arrCD.length - 1].totalNumberTurns) {
                // 展示切换订单按钮
                this.isCanChangeOrder = true
              }
            }
          }
          break;
        case 'D':
          if(this.pointD === '1') {
            // 判断是否在D点判断禁止上货
            if(this.judgeLoadPoint === 'D') {
              // 判断是不是符合禁止上货条件
              if(this.arrCD[0].boxImitateId == this.judgeBanLoadBoxImitateId) {
                this.banLoadStatus = true; // 显示禁止上货图标
                // 给PLC发送禁止上货指令
                ipcRenderer.send('writeValuesToPLC', 'DBW26', 1);
              }
            }
            // 把CD队列第一个货物出列，进入DG
            this.arrDG.push(this.arrCD[0]);
            this.arrDG[this.arrDG.length - 1].turnsInfoList[this.arrDG[this.arrDG.length - 1].numberTurns - 1].passDTime = moment().format('YYYY-MM-DD HH:mm:ss');
            // 删除BC队列第一个
            this.arrCD.splice(0,1);
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrDG[this.arrDG.length - 1].boxImitateId + '经过D点，扫码信息：' + this.arrDG[this.arrDG.length - 1].loadScanCode, 'log');
          }
          break;
        case 'E':
          // 判断进入E点的箱子工艺是否合格，合格不做处理，不合格剔除
          if(this.lastRouteEPoint === '') { // 说明物品第一次经过E点，直接取DG数组的第一个元素
            this.judgeIfDGqualified(0);
          } else {
            // 查找DG数组，lastRouteEPoint的元素，那么下一个必定是此时经过E点的元素
            const indexLast = this.arrDG.findIndex(item => {
              return item.boxImitateId === this.lastRouteEPoint
            })
            if(indexLast != -1) {
              // 找到了，lastRouteEPoint的下一个元素必定是经过E点的元素
              // 如果找到的元素是this.arrDG的最后一个元素，则下一个元素就是第一个元素
              if(indexLast === (this.arrDG.length - 1)) {
                this.judgeIfDGqualified(0);
              } else {
                this.judgeIfDGqualified(indexLast + 1);
              }
            } else {
              // 找不到，队列第一个肯定就是经过E点的元素
              this.judgeIfDGqualified(0);
            }
          }
          break;
        case 'F':
          if(this.pointF === '1') {
            if(this.tempArrF.length > 0) {
              this.nowTiChuNum++;
              // tempArrF 缓存队列第一个一定是经过F点的箱子
              this.arrF.push(this.tempArrF[0]);
              // 执行剔除日志
              this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.tempArrF[0].boxImitateId + '经过F点，扫码信息：' + this.tempArrF[0].loadScanCode + '。被剔除！', 'log');
              // 删除tempArrF 第一个箱子
              this.tempArrF.splice(0, 1);
              // 在DG数组移除元素
              for (let index = 0; index < this.arrDG.length; index++) {
                if(this.arrF[this.arrF.length - 1].boxImitateId == this.arrDG[index].boxImitateId) {
                  this.arrDG.splice(index, 1);
                  break;
                }
              }
              this.arrF[this.arrF.length - 1].tichuFlag = 'HAVE_PUT_OUT';
              // 生成箱报告
              const param = {
                boxMainDTOList: [this.arrF[this.arrF.length - 1]],
                finishOrder: false,
                orderId: this.orderMainDy.orderId
              }
              // 生成箱报告
              await HttpUtil.post('/box/save', param).then((res)=> {
                if(res.data == 1) {
                  this.$message.success('货物：' + this.arrF[this.arrF.length - 1].boxImitateId + '，已生成箱报告！')
                  this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrF[this.arrF.length - 1].boxImitateId + '，已生成箱报告！', 'log');
                } else {
                  this.$message.error('货物：' + this.arrF[this.arrF.length - 1].boxImitateId + '，生成箱报告失败！')
                  this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrF[this.arrF.length - 1].boxImitateId + '，生成箱报告失败！', 'log');
                }
              }).catch((err)=> {
                this.$message.error('货物：' + this.arrF[this.arrF.length - 1].boxImitateId + '，生成箱报告失败！' + err)
                this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrF[this.arrF.length - 1].boxImitateId + '，生成箱报告失败！' + err, 'log');
              });
            }
          }
          break;
        case 'G':
          if(this.pointG === '1') {
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrDG[0].boxImitateId + '经过G点，扫码信息：' + this.arrDG[0].loadScanCode + '。当前 ' + this.arrDG[0].numberTurns + ' 圈，剩余 ' + (Number(this.arrDG[0].totalNumberTurns) - Number(this.arrDG[0].numberTurns)) + ' 圈', 'log');
            // 判断是否符合下货条件
            if (this.arrDG[0].numberTurns >= this.arrDG[0].totalNumberTurns) {
              // 判断此箱子是否还属于当前订单
              if(this.arrDG[0].orderId === this.orderMainDy.orderId) {
                // 符合下货条件，展示预警，货物需要下线标识。
                this.yujingShow = true;
                this.nowOutNum++;
                this.arrDG[0].turnsInfoList[this.arrDG[0].numberTurns - 1].passGTime = moment().format('YYYY-MM-DD HH:mm:ss');
                // 发送下货指令
                ipcRenderer.send('writeValuesToPLC', 'DBW16', 1);
                // 给箱子标记下货标识
                this.arrDG[0].xiahuoFlag = true;
              }
              const param = {
                boxMainDTOList: [this.arrDG[0]],
                finishOrder: false,
                orderId: this.orderMainDy.orderId
              }
              // 生成箱报告
              await HttpUtil.post('/box/save', param).then((res)=> {
                if(res.data == 1) {
                  this.$message.success('货物：' + this.arrDG[0].boxImitateId + '，已生成箱报告！')
                  this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrDG[0].boxImitateId + '，已生成箱报告！', 'log');
                } else {
                  this.$message.error('货物：' + this.arrDG[0].boxImitateId + '，生成箱报告失败！')
                  this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrDG[0].boxImitateId + '，生成箱报告失败！', 'log');
                }
              }).catch((err)=> {
                this.$message.error('货物：' + this.arrDG[0].boxImitateId + '，生成箱报告失败！' + err)
                this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrDG[0].boxImitateId + '，生成箱报告失败！' + err, 'log');
              });
            }
            // 判断此箱子是否还属于当前订单
            if(this.arrDG[0].orderId === this.orderMainDy.orderId) {
              // 判断当前箱子是不是订单的第一箱，并且不是下货圈数
              if ((this.arrDG[0].boxImitateId === this.judgeBanLoadBoxImitateId) && (this.arrDG[0].numberTurns < this.arrDG[0].totalNumberTurns)) {
                // 计算本箱子到达H点的时间（ms）
                // 计算时间 改为任务管理
                const times = this.calculateMilliseconds((Number(this.lengthOne)/(Number(this.orderMainDy.sxSpeedSet)  * Number(this.speedOne)) ).toFixed(2), (Number(this.lengthTwo)/(Number(this.orderMainDy.sxSpeedSet)  * Number(this.speedTwo)) ).toFixed(2)) + this.newDelayPointTime;
                this.startTimerWithDelay(8888, times)
                this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrDG[0].boxImitateId + '，是本次上货的第一箱，经过G点，束下设定速度：' + this.orderMainDy.sxSpeedSet + '，X1长度：' + this.lengthOne + '，V1速度比：' + this.speedOne + '，X2长度：'+ this.lengthTwo +'，V2速度比：' + this.speedTwo + '，到达H点延迟时间：' + this.newDelayPointTime + '计算到达H点共需时间：' + times, 'log');
              }
              // 把DG队列第一个货物出列，进入GH
              this.arrGH.push(this.arrDG[0]);
              this.arrGH[this.arrGH.length - 1].turnsInfoList[this.arrGH[this.arrGH.length - 1].numberTurns - 1].passGTime = moment().format('YYYY-MM-DD HH:mm:ss');
            }
            // 删除DG队列第一个
            this.arrDG.splice(0,1);
          }
          break;
        case 'H':
          if(this.pointH === '1') {
            let indexHBox = 0;
            if(this.lastRouteHPoint != '') {
              // 查找arrGH数组，lastRouteHPoint的元素，那么下一个必定是此时经过E点的元素
              const indexLast = this.arrGH.findIndex(item => {
                return item.boxImitateId === this.lastRouteHPoint
              })
              if(indexLast != -1) {
                // 找到了，lastRouteHPoint的下一个元素必定是经过E点的元素
                // 如果找到的元素是this.arrGH的最后一个元素，则下一个元素就是arrGH的第一个元素，即 indexHBox = 0
                if(indexLast != (this.arrGH.length - 1)) {
                  indexHBox = indexLast + 1;
                }
              }
            }
            // 判断是否在H点判断禁止上货
            if(this.judgeLoadPoint === 'H') {
              // 判断是不是符合禁止上货条件
              if(this.arrGH[indexHBox].boxImitateId == this.judgeBanLoadBoxImitateId) {
                this.banLoadStatus = true; // 显示禁止上货图标
                // 给PLC发送禁止上货指令
                ipcRenderer.send('writeValuesToPLC', 'DBW26', 1);
              }
            }
            this.lastRouteHPoint = this.arrGH[indexHBox].boxImitateId;
            // 不是箱子最后一圈，更新进入H点时间
            if(this.arrGH[indexHBox].numberTurns != this.arrGH[indexHBox].totalNumberTurns) {
              this.arrGH[indexHBox].turnsInfoList[this.arrGH[indexHBox].numberTurns - 1].passHTime = moment().format('YYYY-MM-DD HH:mm:ss');
            }
            // 最后一个箱子倒数第二圈经过H点 lastNewBoxPassABoxImitateId 23-08-31 要求控制翻转由PLC完成，软件无需处理此状态
            // if(this.arrGH[indexHBox].boxImitateId == this.lastNewBoxPassABoxImitateId && this.arrGH[indexHBox].numberTurns == Number(this.orderMainDy.numberTurns) - 1) {
            //   // 发送不翻转指令
            //   ipcRenderer.send('writeValuesToPLC', 'DBW12', 0);
            // }
            // 判断当前箱子的圈数，和全局圈数
            if(this.arrGH[indexHBox].numberTurns >= this.nowNumberTurns) {
              // 更新全局圈数 和 报警信号
              if (this.arrGH[indexHBox].numberTurns >= this.arrGH[indexHBox].totalNumberTurns) {
                this.baojingShow = true;
                this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 下货报警!', 'error')
                // 发送报警信号
                ipcRenderer.send('writeValuesToPLC', 'DBW38', 1);
                const param = {
                  boxMainDTOList: [this.arrGH[indexHBox]],
                  finishOrder: false,
                  orderId: this.orderMainDy.orderId
                }
                // 更新箱报告的H点的时间
                await HttpUtil.post('/box/save', param).then((res)=> {
                  if(res.data == 1) {
                    this.$message.success('货物：' + this.arrGH[indexHBox].boxImitateId + '，已更新箱报告！')
                    this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrGH[indexHBox].boxImitateId + '，已更新箱报告！', 'log');
                  } else {
                    this.$message.error('货物：' + this.arrGH[indexHBox].boxImitateId + '，更新箱报告失败！')
                    this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrGH[indexHBox].boxImitateId + '，更新箱报告失败！', 'log');
                  }
                }).catch((err)=> {
                  this.$message.error('货物：' + this.arrGH[indexHBox].boxImitateId + '，更新箱报告失败！' + err)
                  this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 货物' + this.arrGH[indexHBox].boxImitateId + '，更新箱报告失败！' + err, 'log');
                });
              }
            }
          }
          break;
        default:
          break;
      }
    },
    judgeIfBoxOnH() {
      // 新上货物时，经过H点模拟id值赋值为arrGH 最后一个元素的值,并且给arrGH内所有元素一个作废标识，后续不处理这些作废的元素
      if(this.arrGH.length > 0) {
        for (let index = this.arrGH.length - 1; index >= 0; index--) {
          // 如果订单圈数和箱子当前圈数一致才会进入作废队列
          // this.arrGH[indexHBox].numberTurns >= this.arrGH[indexHBox].totalNumberTurns
          if(this.arrGH[index].numberTurns >= this.arrGH[index].totalNumberTurns) {
            this.thoughHArr.push(this.arrGH[index]);
            this.arrGH.splice(index, 1)
          }
        }
        this.lastRouteHPoint = '';
      } else {
        this.lastRouteHPoint = '';
      }
      // 有货物的圈数和全局圈数一致时，则全局圈数加1
      if(this.nowNumberTurns == 1) {
        // 第一圈第一个箱子到达H时，此时HA传送带上还有一些上的货的但是没经过A点的，需要加个延时器，等待所有的箱子经过A点，再从GH往A拉,延时时间取配置，0或null或空串说明没有延迟
        const delayPointTime = this.calculateTotalTime();
        if(delayPointTime > 0) {
          if(!this.isDelayPointTime) {
            // 当前没有延迟中
            this.isDelayPointTime = true
            this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' H点开始延迟！', 'log');
            this.startTimerWithDelay(9999, delayPointTime)
          }
        } else {
          this.nowNumberTurns++;
        }
      } else {
        this.nowNumberTurns++;
      }
    },
    calculateTotalTime() {
      const pointjLength = this.pointjLength;
      const pointkLength = this.pointkLength;
      const pointlLength = this.pointlLength;
      const jAreaSpeed = this.jAreaSpeed;
      const kAreaSpeed = this.kAreaSpeed;
      const lAreaSpeed = this.lAreaSpeed;
      if(!this.isDelayPointTime){
        this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' H点开始计算延迟时间，参数：J区域长度:' + pointjLength + '|K区域长度:' + pointkLength + '|L区域长度:' + pointlLength + '|J区域速度:' + jAreaSpeed + '|K区域速度:' + kAreaSpeed + '|L区域速度:' + lAreaSpeed, 'log');
      }
      // 检查长度是否不为负数且速度是否大于0
      if (pointjLength >= 0 && pointkLength >= 0 && pointlLength >= 0 && 
          jAreaSpeed > 0 && kAreaSpeed > 0 && lAreaSpeed > 0) {
        // 计算每段传送带所需时间（单位：分钟），再转换为毫秒
        let timeForJ = pointjLength > 0 ? (pointjLength / jAreaSpeed) * 60 * 1000 : 0;
        let timeForK = pointkLength > 0 ? (pointkLength / kAreaSpeed) * 60 * 1000 : 0;
        let timeForL = pointlLength > 0 ? (pointlLength / lAreaSpeed) * 60 * 1000 : 0;
        // 计算总时间
        let totalTime = timeForJ + timeForK + timeForL;
        if(!this.isDelayPointTime){
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 计算的延迟时间：' + totalTime + 'ms', 'log');
        }
        return totalTime;
      } else {
        // 如果输入不合法，返回0
        if(!this.isDelayPointTime){
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 计算的延迟时间：0', 'log');
        }
        return 0;
      }
    },
    judgeIfDGqualified(index) {
      // 如果是下一批第一个箱子经过E，则取消下货预警和报警
      if(this.arrDG[index].boxImitateId == this.judgeBanLoadBoxImitateId) {
        this.yujingShow = false;
        this.baojingShow = false;
      }
      this.nowEBoxImitateId = this.arrDG[index].boxImitateId;
      this.lastRouteEPoint = this.arrDG[index].boxImitateId;
      // 更新进入E点时间
      this.arrDG[index].turnsInfoList[this.arrDG[index].numberTurns - 1].passETime = moment().format('YYYY-MM-DD HH:mm:ss');
      if(this.judgeLoadPoint === 'E') {
        // 判断是不是符合禁止上货条件
        if(this.arrDG[index].boxImitateId == this.judgeBanLoadBoxImitateId) {
          this.banLoadStatus = true; // 显示禁止上货图标
          // 给PLC发送禁止上货指令
          ipcRenderer.send('writeValuesToPLC', 'DBW26', 1);
        }
      }
      if(this.arrDG[index].qualified === '0') {
        // 托盘模式不剔除
        if(this.orderMainDy.trayFlag != '1') {
          // 执行剔除命令
          ipcRenderer.send('writeValuesToPLC', 'DBW18', 1);
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + '货物' + this.arrDG[index].boxImitateId + '经过E点,货物不合格！执行剔除命令！', 'log');
          this.arrDG[index].tichuFlag = 'WAIT_PUT_OUT';
          // 将不合格货物加入 tempArrF 缓存队列
          this.tempArrF.push(this.arrDG[index])
          // 移除原队列
          this.arrDG.splice(index, 1);
          // 经过E点元素id，因为本箱子被移除了，所以直接取上个箱子的id作为本次经过E点的id，方便下次判断
          if(index > 0) {
            this.lastRouteEPoint = this.arrDG[index - 1].boxImitateId;
          } else {
            this.lastRouteEPoint = '';
          }
        } else {
          // 只输出日志
          this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + '货物' + this.arrDG[index].boxImitateId + '经过E点,货物不合格！托盘模式下不执行剔除命令！', 'log');
        }
      } else {
        // 合格无需处理，写0即可
        ipcRenderer.send('writeValuesToPLC', 'DBW18', 0);
        this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + '货物' + this.arrDG[index].boxImitateId + '经过E点,货物合格！', 'log');
      }
    },
    closeDynamicGraphShow() {
      this.$emit('closeDynamicGraphShow')
    },
    PrefixZero(num, n) {
      return (Array(n).join(0) + num).slice(-n);
    },
    calculateMilliseconds(A, B) {
      return this.minutesToMilliseconds(Number(A) + Number(B));
    },
    minutesToMilliseconds(minutes) {
      return Math.round(minutes * 60 * 1000);
    },
    async sendMsgToPLC(command) {
      switch (command) {
        case 'suspend':
          ipcRenderer.send('writeValuesToPLC', 'DBW6', 1);
          setTimeout(() => {
            ipcRenderer.send('writeValuesToPLC', 'DBW6', 0);
          }, 500);
          this.$notify({
            title: '指令发送成功！',
            message: '全线暂停指令已成功发送！',
            type: 'success',
            duration: 2000
          });
          break;
        case 'run':
          // 启动的逻辑都放这了
          this.startPLC();
          break;
        case 'stop':
          // 发送停止命令
          ipcRenderer.send('writeValuesToPLC', 'DBW10', 1);
          setTimeout(() => {
            ipcRenderer.send('writeValuesToPLC', 'DBW10', 0);
          }, 500);
          this.$notify({
            title: '指令发送成功！',
            message: '全线停止指令已成功发送！',
            type: 'success',
            duration: 2000
          });
          break;
        case 'reset':
          ipcRenderer.send('writeValuesToPLC', 'DBW42', 1);
          setTimeout(() => {
            ipcRenderer.send('writeValuesToPLC', 'DBW42', 0);
          }, 500);
          this.$notify({
            title: '指令发送成功！',
            message: '故障复位指令已成功发送！',
            type: 'success',
            duration: 2000
          });
          break;
        default:
          break;
      }
    },
    async startPLC() {
      // DB101.DBW2 加速器设定输送速度
      ipcRenderer.send('writeValuesToPLC', 'DBW2', Number(this.orderMainDy.sxSpeedSet));
      // DB101.DBW8 启动输送线
      ipcRenderer.send('writeValuesToPLC', 'DBW8', 1);
      setTimeout(() => {
        ipcRenderer.send('writeValuesToPLC', 'DBW8', 0);
      }, 500);
      // DB101.DBW40 发送居中信号
      ipcRenderer.send('writeValuesToPLC', 'DBW40', 1);
      setTimeout(() => {
        ipcRenderer.send('writeValuesToPLC', 'DBW40', 0);
      }, 500);
      // 判断是不是托盘模式
      if(this.orderMainDy.trayFlag === '1') {
        ipcRenderer.send('writeValuesToPLC', 'DBW12', 0);
        ipcRenderer.send('writeValuesToPLC', 'DBW14', 0);
        ipcRenderer.send('writeValuesToPLC', 'DBW46', 1);
      } else {
        // 翻转&回流
        if(this.orderMainDy.revertFlag === '翻转') {
          // DB101.DBW12 翻转
          ipcRenderer.send('writeValuesToPLC', 'DBW12', 1);
          ipcRenderer.send('writeValuesToPLC', 'DBW14', 0);
          ipcRenderer.send('writeValuesToPLC', 'DBW46', 0);
        }  else {
          // DB101.DBW14 回流模式
          ipcRenderer.send('writeValuesToPLC', 'DBW14', 1);
          ipcRenderer.send('writeValuesToPLC', 'DBW12', 0);
          ipcRenderer.send('writeValuesToPLC', 'DBW46', 0);
        }
      }
      // DB101.DBW22 纸箱宽度
      ipcRenderer.send('writeValuesToPLC', 'DBW22', Number(this.orderMainDy.boxWidth));
      // DB101.DBW24 纸箱长度
      ipcRenderer.send('writeValuesToPLC', 'DBW24', Number(this.orderMainDy.boxLength));
      this.$notify({
        title: '指令发送成功！',
        message: '全线启动指令已成功发送！',
        type: 'success',
        duration: 2000
      });
    },
    setBeginCountNum(num) {
      if(Number(num) > Number(this.beginCountNum)) {
        this.beginCountNum = num
      }
    },
    async saveOriginal() {
      // 生成批报告，并且更新一下所有箱子
      const param = {
        boxMainDTOList: [...this.arrAB, ...this.arrBC, ...this.arrCD, ...this.arrDG, ...this.arrGH, ...this.arrF, ...this.thoughHArr],
        orderId: this.orderMainDy.orderId
      }
      await HttpUtil.post('/box/saveOriginal', param).then((res)=> {
        this.$message.success('原始记录同步保存成功！');
      })
    },
    async generateBatchReport() {
      // 先保存原始记录
      this.saveOriginal();
      // 生成批报告，并且更新一下所有箱子
      const param = {
        boxMainDTOList: [...this.arrAB, ...this.arrBC, ...this.arrCD, ...this.arrDG, ...this.arrGH],
        finishOrder: true,
        orderId: this.orderMainDy.orderId
      }
      await HttpUtil.post('/box/save', param).then((res)=> {
        if(res.data == 1) {
          this.fullPause = false;
          this.fullRun = false;
          this.fullStop = false;
          this.orderMainDy = {};
          this.clearAllData(false);
          // clearInterval(this.judgeSpeedInterval);
          // this.judgeSpeedInterval = null;
          this.$emit('returnGenerateBatchReport',true)
        } else {
          this.$emit('returnGenerateBatchReport',false)
        }
      }).catch((err)=> {
        this.$emit('returnGenerateBatchReport',false)
      });
    },
    adjustChildWidth() {
      const parentElement = this.$refs.parent;
      const childElement = this.$refs.child;
      const parentWidth = parentElement.offsetWidth;
      
      if (childElement.offsetWidth > parentWidth) {
        const maxScale = parentWidth / childElement.offsetWidth;
        const scale = Math.min(maxScale, 1); // 缩放倍数不超过1，即不放大
        childElement.style.transform = `scale(${scale})`;
      } else {
        childElement.style.transform = '';
      }
    },
    async clearAllData(isChangeOrder) {
      // 当前上货数
      this.nowInNum = 0;
      // 当前下货数
      this.nowOutNum = 0;
      // 各个区域下箱子数组
      this.arrAB = [];
      this.arrBC = [];

      // 不是切换订单来的清空
      if(!isChangeOrder) {
        this.arrCD = []; 
        this.arrDG = []; 
        this.tempArrF = []; // 经过E点，不合格的箱子，暂时缓存在临时队列，只有经过F点的时候，才去实际的处理箱子
        // 如果是手动清空，那么模拟id需要重新查询
        try {
          await HttpUtil.post('/box/getId').then((res)=> {
            if(res.data >= 0) {
              this.$nextTick(() => {
                this.beginCountNum = res.data
              });
            } else {
              throw new Error();
            }
          }).catch((err)=> {
            throw new Error();
          });
        } catch (error) {
          this.$message.error('获取模拟id方法错误！请重新尝试！');
        }
      }
      
      this.arrGH = [];
      this.arrF = []; // 被剔除的箱子缓存
      // 当前点击的传送带区域内的箱子列表，一个中间变量
      this.boxArr = [];
      this.thoughHArr = [];
      // 当前打开的是哪块传送带队列
      this.traAB = false;
      this.traBC = false;
      this.traCD = false;
      this.traDG = false;
      this.traGH = false;
      this.traF = false;
      // 当前被拖动元素的索引
      this.dragIndex = '';
      // PLC光电状态数组
      this.guangDianStatusArr = '';
      // PLC点击状态数组
      this.dianJiStatusArr = '';
      // 当前圈数
      this.nowNumberTurns = 1;
      this.lastRouteEPoint = '';
      this.lastRouteHPoint = '';
      this.lastRouteFPoint = '';
      this.yujingShow = false;
      this.baojingShow = false;
      this.nowABoxImitateId = '';
      this.nowEBoxImitateId = '';
      this.nowShuXiaid = ''; // 当前束下ID 清空
      this.nowTiChuNum = 0; // 当前剔除的数量，清空
      this.logArr = [];
      this.banLoadStatus = false; // 是否禁止上货
      this.judgeBanLoadBoxImitateId = ''; // 到达判断禁止上货点位后，需要判断的箱子id
      this.ifNextPassABoxIsFirst = true; // 刚开始时，第一个经过A点的箱子一定是第一个
      this.lastNewBoxPassABoxImitateId = ''; // 新增的箱子，最后一个经过A点的模拟Id
      // 清空上料固定扫码
      this.loadScanCode = '';
      // 清空迷宫出口固定扫码
      this.labyrinthScanCode = '';
      this.isCanChangeOrder = false;
      this.dialogVisible = false;
      // 恢复一些PLC的状态
      ipcRenderer.send('writeValuesToPLC', 'DBW34', 0); // 第二圈和第一圈扫码不一致
      ipcRenderer.send('writeValuesToPLC', 'DBW26', 0); // 锁定上货电机（保留）
      ipcRenderer.send('writeValuesToPLC', 'DBW38', 0);
      if(!isChangeOrder) {
        ipcRenderer.send('writeValuesToPLC', 'DBW18', 0); // 剔除(切换订单不可清空)
        ipcRenderer.send('writeValuesToPLC', 'DBW16', 0); // 下货(切换订单不可清空)
        this.$message.success('全线清空成功!')
      }
    },
    getConfig() {
      // 查询配置
      HttpUtil.get('/cssConfig/getConfig').then((res)=> {
        if(res.data) {
          this.l11 = res.data.oneOneLength;
          this.l2 = res.data.twoLength;
          this.judgeLoadPoint = res.data.judgeLoadPoint;
          this.pointjLength = res.data.pointjLength == null ? 0 : res.data.pointjLength;
          this.pointkLength = res.data.pointkLength == null ? 0 : res.data.pointkLength;
          this.pointlLength = res.data.pointlLength == null ? 0 : res.data.pointlLength;
          this.speedOne = res.data.speedOne == null ? 1 : res.data.speedOne;
          this.speedTwo = res.data.speedTwo == null ? 1 : res.data.speedTwo;
          this.newDelayPointTime = res.data.newDelayPointTime == null ? 0 : res.data.newDelayPointTime;
          this.lengthOne = res.data.lengthOne == null ? 0 : res.data.lengthOne;
          this.lengthTwo = res.data.lengthTwo == null ? 0 : res.data.lengthTwo;
        } else {
          this.$message.error('config error! 更新配置错误！')
        }
      }).catch((err)=> {
        this.$message.error('config error! 更新配置错误！')
      });
    },
    showRunlog() {
      this.logPageFlag = 'log';
      this.logNotReadNumber = 0;
    },
    showErrorlog() {
      this.logPageFlag = 'error-log';
      this.errorLogNotReadNumber = 0;
    },
    stopOrder() {
      this.fullPause = false
      this.fullRun = false
      this.fullStop = true
      // clearInterval(this.judgeSpeedInterval);
      // this.judgeSpeedInterval = null;
    },
    operationConfirm(command) {
      switch (command) {
        case 'suspend':
          this.$confirm('此操作将全线暂停, 是否继续?', '警告！', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.fullPause = true
            this.fullRun = false
            this.fullStop = false
            this.sendMsgToPLC('suspend');
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消操作！'
            });          
          });
          break;
        case 'run':
          this.$confirm('此操作将全线启动, 是否继续?', '警告！', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.fullPause = false
            this.fullRun = true
            this.fullStop = false
            this.sendMsgToPLC('run');
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消操作！'
            });          
          });
          break;
        case 'stop':
          this.$confirm('此操作将全线停止, 是否继续?', '警告！', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.fullPause = false
            this.fullRun = false
            this.fullStop = true
            // clearInterval(this.judgeSpeedInterval);
            // this.judgeSpeedInterval = null;
            this.sendMsgToPLC('stop');
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消操作！'
            });          
          });
          break;
        case 'clear':
          this.$prompt('请输入登录账号的密码：', '敏感操作！验证用户！', {
            confirmButtonText: '验证',
            cancelButtonText: '取消',
            inputType: 'password'
          }).then(({ value }) => {
            // 验证姓名是否正确
            const param = {
              userPassword: value,
              userCode: remote.getGlobal('sharedObject').userInfo.userCode
            }
            HttpUtil.post('/userInfo/verifyPassword', param).then((res)=> {
              if(res.data) {
                this.$message.success('验证通过！');
                this.clearAllData(false);
                this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 用户：' + remote.getGlobal('sharedObject').userInfo.userName + '进行了全线清空操作！', 'log');
              } else {
                this.$message.error('验证未通过！');
              }
            }).catch((err)=> {
              this.$message.error('验证未通过！请重试！');
            });
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消验证！'
            });       
          });
          break;
        case 'reset':
          this.$confirm('此操作将发送故障复位信息, 是否继续?', '警告！', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.sendMsgToPLC('reset');
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消操作！'
            });          
          });
          break;
        default:
          break;
      }
    },
    convertToWord(value) {
      if (value < 0) {
        return (value & 0xFFFF) >>> 0; // 负数转换为无符号的16位整数
      } else {
        return value; // 非负数保持不变
      }
    },
    delayHpoint() {
      this.nowNumberTurns++;
      this.isDelayPointTime = false;
      this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' H点开始延迟结束！', 'log');
    },
    delayGpoint() {
      this.createLog(moment().format('YYYY-MM-DD HH:mm:ss') + ' 首箱到达H点！', 'log');
      this.judgeIfBoxOnH();
    },
    startTimerWithDelay(boxImitateId, delay) {
      const timerId = setTimeout(() => {
        // 执行逻辑,9999代表H点延迟时间，非9999代表B点到束下的计算时间
        if(Number(boxImitateId) === 9999) {
          this.delayHpoint()
        } else if(Number(boxImitateId) === 8888) {
          // 执行逻辑,8888代表G点延迟时间，非8888代表B点到束下的计算时间
          this.delayGpoint()
        } else {
          this.getUndercutProcess(boxImitateId);
        }
        // 执行完删除定时器 delete 操作符用于删除对象的某个属性
        delete this.timers[boxImitateId];
      }, delay);
      this.timers[boxImitateId] = {
        timerId: timerId,
        endTime: Date.now() + delay,
        remainingTime: delay,
      };
      this.timersRunStatus = true;
    },
    pauseAllTimers() {
      if(this.timersRunStatus) {
        for (const boxImitateId in this.timers) {
          clearTimeout(this.timers[boxImitateId].timerId);
          this.timers[boxImitateId].remainingTime = this.timers[boxImitateId].endTime - Date.now();
          this.timersRunStatus = false;
        }
      }
    },
    resumeAllTimers() {
      if(!this.timersRunStatus) {
        const currentTime = Date.now();
        for (const boxImitateId in this.timers) {
          const remainingTime = this.timers[boxImitateId].remainingTime;
          this.startTimerWithDelay(boxImitateId, remainingTime);
          this.timers[boxImitateId].endTime = currentTime + remainingTime;
        }
        this.timersRunStatus = true;
      }
    },
    deleteTimersByBoxImitateId(boxImitateId) {
      if(this.timers[boxImitateId] != undefined) {
        clearTimeout(this.timers[boxImitateId].timerId);
        delete this.timers[boxImitateId];
      }
    },
    downClick() {
      this.$confirm('此操作将默认全部箱子已下货, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.baojingShow = false;
        this.yujingShow = false;
        ipcRenderer.send('writeValuesToPLC', 'DBW38', 0);
        if(Number(this.nowInNum) < Number(this.orderMainDy.orderBoxNum)) {
          // 给PLC发送允许上货命令
          ipcRenderer.send('writeValuesToPLC', 'DBW26', 0);
          this.banLoadStatus = false; // 隐藏禁止上货图标
        }
        // 下货完成信号，写500ms
        ipcRenderer.send('writeValuesToPLC', 'DBW44', 1);
        setTimeout(() => {
          ipcRenderer.send('writeValuesToPLC', 'DBW44', 0);
        }, 500);
        this.$message({
          type: 'success',
          message: '操作成功!'
        });
      }).catch(() => {});
    },
    handleCurrentChange(val) {
      if(val != null) {
        this.$confirm('即将切换订单，请先处理当前订单状态！', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '当前订单完成',
          cancelButtonText: '当前订单暂停',
          type: 'warning',
          cancelButtonClass: 'el-button--info'
        })
        .then(async () => {
          // 完成
          // 先保存原始记录
          this.saveOriginal();
          // 生成批报告，并且更新一下所有箱子
          const param = {
            boxMainDTOList: [...this.arrAB, ...this.arrBC, ...this.arrCD, ...this.arrDG, ...this.arrGH],
            finishOrder: true,
            orderId: this.orderMainDy.orderId
          }
          await HttpUtil.post('/box/save', param).then((res)=> {
            if(res.data == 1) {
              this.$emit('returnGenerateBatchReport',true)
            } else {
              this.$emit('returnGenerateBatchReport',false)
            }
          }).catch((err)=> {
            this.$emit('returnGenerateBatchReport',false)
          });
          // 启动刚才切换的要启动的订单
          this.$emit('chooseOrder', JSON.parse(JSON.stringify(val)), true);
        })
        .catch(action => {
          if(action === 'cancel') {
            // 暂停
            this.$emit('cancelOrder', this.orderMainDy);
            // 启动刚才切换的要启动的订单
            this.$emit('chooseOrder', JSON.parse(JSON.stringify(val)), true);
          }
        });
      }
    },
    async getOrderList() {
        this.dialogVisible = true
      this.getOrderListLoading = true
      await HttpUtil.get('/order/getOrderList').then((res)=> {
        this.tableData = res.data
        this.tableData.forEach(item => {
          item.revertFlag = item.revertFlag == '1' ? '翻转' : ''
        })
        setTimeout(() => {
          this.getOrderListLoading = false
        }, 500);
      }).catch((err)=> {
        setTimeout(() => {
          this.getOrderListLoading = false
        }, 500);
        // 网络异常 稍后再试
        this.$message.error('查询失败！' + err);
      });
    }
  },
  created() {
    this.getConfig()
  },
  mounted() {
    setInterval(() => {
      this.dengShow = !this.dengShow;
    }, 1000);
    // 订阅<状态球>eventBus发布的消息
    EventBus.$on('pushPLCMessage', eventData => {
      // --------无PLC测试时，这里以下代码毙掉--------
      // 输送线运行状态
      this.beltRunStatus = Number(eventData.DBW62);
      if(Number(eventData.DBW62) == 1) {
        this.guangDianStatusArr = this.PrefixZero(this.convertToWord(eventData.DBW70).toString(2), 16);
        this.pointA = this.guangDianStatusArr[7];
        this.pointB = this.guangDianStatusArr[6];
        this.pointC = this.guangDianStatusArr[5];
        this.pointD = this.guangDianStatusArr[4];
        this.pointE = this.guangDianStatusArr[3];
        this.pointF = this.guangDianStatusArr[2];
        this.pointG = this.guangDianStatusArr[1];
        this.pointH = this.guangDianStatusArr[0];
      }
      // --------无PLC测试时，这里以上代码毙掉--------
      this.dianJiStatusArr = this.PrefixZero(this.convertToWord(eventData.DBW72).toString(2), 16);
      this.status104 = this.dianJiStatusArr[3]
      this.status105 = this.dianJiStatusArr[2]
      this.lightBeamRealTimeSpeed = Number(eventData.DBW68);
      this.jAreaSpeed = Number(eventData.DBW80);
      this.kAreaSpeed = Number(eventData.DBW82);
      this.lAreaSpeed = Number(eventData.DBW84);
      // 上料固定扫码
      this.loadScanCodeTemp = eventData.DBB100??'';
      // 迷宫出口固定扫码
      this.labyrinthScanCodeTemp = eventData.DBB130??'';
      // 束下输送速度比
      this.shuxiaSpeedProportion = Number(eventData.DBW76);
      // 监控报警日志
      if(eventData.DBW66 != null && eventData.DBW66 != undefined) {
        this.errorModArr = this.PrefixZero(this.convertToWord(eventData.DBW66).toString(2), 16);
        this.err1 = this.errorModArr[7];
        this.err2 = this.errorModArr[6];
        this.err3 = this.errorModArr[5];
        this.err4 = this.errorModArr[4];
        this.err5 = this.errorModArr[3];
        this.err6 = this.errorModArr[2];
        this.err7 = this.errorModArr[1];
        this.err8 = this.errorModArr[0];
        this.err9 = this.errorModArr[15];
        this.err10 = this.errorModArr[14];
        this.err11 = this.errorModArr[13];
        this.err12 = this.errorModArr[12];
        this.err13 = this.errorModArr[11];
        this.err14 = this.errorModArr[10];
        this.err15 = this.errorModArr[9];
        this.err16 = this.errorModArr[8];
      }
      
    })
    this.adjustChildWidth();
    window.addEventListener('resize', this.adjustChildWidth);
    // eventBus监听配置更新 reFlushConfig
    EventBus.$on('reFlushConfig', () => {
      this.getConfig();
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.adjustChildWidth);
  }
};
</script>
<style lang="less" scoped>
.dynamic {
  width: 100%;
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
    padding-left: 18px;
  }
  .card-content {
    height: calc(100% - 37px);
    width: 100%;
    .data-card {
      width: 33.3333%;
      height: 33.3333%;
      float: left;
      box-sizing: border-box;
      padding: 5px 10px 5px 10px;
      &-border {
        width: 100%;
        height: 100%;
        border-radius: 20px;
        background: rgba(40, 37, 59, 1);
        box-shadow: 0px 20px 50px 0px rgba(0, 0, 0, 0.25);
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
  .fusheIcon {
    width:45px;
    height:45px;
    position: absolute;
    right: 372px;
    top: 10px;
  }
  .fusheguang {
    width: 106px;
    height: 100px;
    position: absolute;
    top: 56px;
    right: 342px;
  }
  .backgroundimg {
    background-image: url('./img/chuansongdai.png');
    background-size: 889.67px 682.66px;
    background-position: center center;
    background-repeat: no-repeat;
  }
  .chuansongpadding {
    box-sizing: border-box;
    .show-data-area {
      width:250px;
      height: 32px;
      &-top {
        height: 32px;
        width: 100px;
        float: left;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:15px;
        font-weight: 600;
        color: #000000;
      }
      &-content {
        height: 32px;
        width: 150px;
        float: left;
        ::v-deep .el-input--small .el-input__inner {
          text-align: center;
          font-size: 15px;
          font-weight: 600;
          color: #000000;
        }
      }
    }
  }
  &-left{
    width: 820px;
    height: 100%;
    float: left;
    &-top {
      height: 384px;
      width: 100%;
      float: left;
      box-sizing: border-box;
      padding: 15px 15px 7.5px 15px;
      > div {
        width: 100%;
        height: 100%;
        opacity: 1;
        border-radius: 20px;
        background: rgba(246, 247, 251, 0.56);
        box-shadow: 0px 60px 90px 0px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(88px);
      }
    }
    &-middle {
      height: 150px;
      width: 100%;
      float: left;
      box-sizing: border-box;
      padding: 7.5px 15px 7.5px 15px;
      > div {
        width: 100%;
        height: 100%;
        opacity: 1;
        border-radius: 20px;
        background: rgba(246, 247, 251, 0.56);
        box-shadow: 0px 60px 90px 0px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(88px);
        .img {
          width: 70px;
          height: 70px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 20px;
          box-shadow: 18px 18px 30px rgba(0, 0, 0, 0.2),
          -15px -7px 30px rgba(255, 255, 255, 1);
          transition: all .2s ease-out;
          cursor: pointer;
          margin-left: 25px;
          font-weight: 900;
        }
        .img:active{
          cursor: pointer;
          box-shadow: 0 0 0 rgba(0, 0, 0, 0.2),
          0 0 0 rgba(255, 255, 255, 0.8),
          inset 18px 18px 30px rgba(0, 0, 0, 0.1),
          inset -18px -18px 30px rgba(255, 255, 255, 1);
        }
        .img-active{
          cursor: pointer;
          box-shadow: 0 0 0 rgba(0, 0, 0, 0.2),
          0 0 0 rgba(255, 255, 255, 0.8),
          inset 18px 18px 30px rgba(0, 0, 0, 0.1),
          inset -18px -18px 30px rgba(255, 255, 255, 1);
          color: blue;
        }
      }
    }
    &-down {
      height: calc(100% - 534px);
      width: 100%;
      float: left;
      box-sizing: border-box;
      padding: 7.5px 15px 15px 15px;
      > div {
        width: 100%;
        height: 100%;
        opacity: 1;
        border-radius: 20px;
        background: rgba(246, 247, 251, 0.56);
        box-shadow: 0px 60px 90px 0px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(88px);
        .log-class {
          cursor: pointer;
          height: 25px;
          width: 67px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .log-class:hover {
          color: #409eff;
        }
        .log-class-active {
          color: #409eff;
        }
        .log-class-active::after {
          content: "";
          position: absolute;
          left: 0;
          width: 100%;
          height: 1px; /* 调整下划线的高度 */
          background-color: #409eff; /* 调整下划线的颜色 */
        }
      }
      // 滚动槽样式定义
      ::-webkit-scrollbar {
        width: 20px;
        height: 8px;
      }

      ::-webkit-scrollbar-track {
          /*滚动条里面轨道*/
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          background: #ededed;
          border-radius: 10px;
      }

      ::-webkit-scrollbar-thumb {
        /*滚动条里面小方块*/
        border-radius: 10px;
        background-color: skyblue;
        background-image: -webkit-linear-gradient(45deg,
          rgba(255, 255, 255, 0.2) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255, 255, 255, 0.2) 50%,
          rgba(255, 255, 255, 0.2) 75%,
          transparent 75%,
          transparent);
      }
      .card-content {
        padding: 6px 2px 0px 2px;
        overflow: auto;
        box-sizing: border-box;
      }
      .log-text {
        line-height: 23px;
        padding-left: 18px;
        color: rgba(0, 0, 0, 1);
        margin-top: 9px;
      }
    }
  }
  &-right{
    width: calc(100% - 820px);
    // width: 100%;
    height: 100%;
    float: left;
    padding: 15px 15px 15px 0px;
    box-sizing: border-box;
    > div {
      width: 100%;
      height: 100%;
      opacity: 1;
      border-radius: 20px;
      background: rgba(246, 247, 251, 0.56);
      box-shadow: 0px 60px 90px 0px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(88px);
      background: linear-gradient(to right, rgba(83, 188, 206, 0.7), rgba(97, 168, 160, 0.8));
      .guangdian {
        width: 68px;
        height: 50px;
        position: absolute;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        cursor: pointer;
        * {
          border-width: 0;
        }
        .pointText {
          margin-left: 46px;
          font-size: 28px;
          color: #D43030;
        }
        .star{
          width: 0;
          height: 0;
          border-top-color: #AC33C1;
          border-left-color: transparent;
          border-right-color: transparent;
          border-top-width: 20.73px;
          border-left-width: 28.53px;
          border-right-width: 28.53px;
          border-style: solid;
          position: absolute;
          transform: scale(0.5);
        }
        .star::before {
          border-width:0; 
          content: '';
          display: block;
          width: 0;
          height: 0;
          border-top-color: #AC33C1;
          border-left-color: transparent;
          border-right-color: transparent;
          border-top-width: 20.73px;
          border-left-width: 28.53px;
          border-right-width: 28.53px;
          border-style: solid; 
          position:absolute;
          top:-20.73px;
          left:-28.53px;
          transform:rotate(72deg);
          transform-origin:28.53px  9.27px; 
        }
        .star::after{
          border-width:0; 
          content: '';
          display: block;
          width: 0;
          height: 0;
          border-top-color:#AC33C1;
          border-left-color: transparent;
          border-right-color: transparent;
          border-top-width: 20.73px;
          border-left-width: 28.53px;
          border-right-width: 28.53px;
          border-style: solid;   
          position:absolute;
          top:-20.73px;
          left:-28.53px;
          transform:rotate(-72deg);
          transform-origin:28.53px  9.27px; 
        }
      }
      .guangdian:hover {
        background: rgba(246, 247, 251, 0.56);
        box-shadow: 0px 60px 90px 0px rgba(0, 0, 0, 0.2);
      }
      .dianji {
        height: 19px;
        font-size: 15px;
        width: 75px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f56c6c;
        color: white;
        position: absolute;
      }
      .dianji-active {
        background-color: #43CF7C;
      }
      .warning-img {
        width: 161.6px;
        height: 89.74px;
        position: absolute;
      }
      .caozuoButton {
        position: absolute;
      }
    }
  }
  .drawer-left {
    width: 1068px;
    height: 100%;
    float: left;
    .content_table {
      height: 100%;
      width: 100%;
      overflow: hidden;
      position: relative;
      .table_head,
      .table_list {
        width: 100%;
        table {
          width: 100%;
          table-layout: fixed;
          border-spacing:0;
          text-align: center;
        }
        td,
        th {
          border: 1px #dedede solid;
          height: 30px;
          font-size: 13px;
          text-align: center;
        }
        thead {
          height: 30px;
          background: #eeeeee;
        }
        td {
          height: 30px;
          font-size: 13px;
          font-weight: 500;
        }
        .body-col {
          &:hover {
            background-color: #e6f7ff
          }
          &.selected {
            background-color: #cccdfb;
            &:hover {
              background-color: #b3b5f1;
            }
          }
        }
        /* 添加这个样式来在拖动时隐藏边框 */
        .body-col.dragging {
          border: none;
          pointer-events: none;
        }

        /* 添加这个样式来在拖动时高亮目标行 */
        .body-col.drag-over {
          border: 1px dashed #999;
        }
      }
      .table_head {
        height: 30px;
        overflow: hidden;
        border-bottom: 1px #e4e4e4 solid;
        th {
          cursor: pointer;
        }
      }
      .table_list {
        height: calc(100% - 50px);
        overflow-y: auto;
        tr {
          cursor: pointer;
        }
      }
    }
  }
  .drawer-right {
    width: 180px;
    height: 100%;
    float: left;
    padding: 0px 5px;
    background-color: white;
    border-left: 1px #efefef solid;
    .transform-card {
      width: 100%;
      height: 38px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #ecf5ff;
      border: 1px #b3d8ff solid;
      cursor: pointer;
      font-weight: 700;
      margin-bottom: 3px;
      color: #409eff;
    }
    .transform-card-active {
      background-color: #409eff;
      border-color: #409eff;
      color: #fff;
    }
  }
  ::v-deep .el-drawer__body{
    flex: none;
    height: calc(100% - 79px);
    overflow: hidden;
  }
  /* 添加半透明效果和虚线边框 */
  .body-col.dragging {
    opacity: 0.6;
    border: 1px dashed #ccc;
  }

  /* 添加过渡效果 */
  .transform-card {
    transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }
  .transform-card.hover {
    background-color: #409eff;
    color: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  }
  ::v-deep .el-drawer__header {
    margin-bottom: 0px;
    padding: 8px;
    color: #000000;
    border-top: 1px solid #ebebeb;
  }
}
</style>