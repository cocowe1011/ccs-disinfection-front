import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  dialog,
  Tray,
  screen
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import nodes7 from 'nodes7';
import HttpUtil from '@/utils/HttpUtil';
import logger from 'electron-log';
// 设置日志文件的保存路径
logger.transports.file.file = app.getPath('userData') + '/app.log';

// 初始化日志记录器
logger.transports.file.level = 'info';
logger.transports.console.level = 'info';
// 日期样式
logger.transports.file.format =
  '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';
console.log(app.getPath('userData'));
logger.transports.file.file = app.getPath('userData') + '/app.log';

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
var appTray = null;
let closeStatus = false;
var conn = new nodes7();

// 记录日志的辅助函数
function logToFile(message) {
  const timestamp = new Date().toLocaleString();
  const logPath =
    'D://wcs_temp_data/log/' +
    new Date().toLocaleDateString().replaceAll('/', '-') +
    'runlog.txt';
  fs.appendFile(logPath, `[${timestamp}] ${message}\n`, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
}

// 日志缓冲相关变量
let logBuffer = [];
let logBufferTimer = null;
const LOG_BUFFER_SIZE = 10; // 缓冲区大小
const LOG_FLUSH_INTERVAL = 5000; // 5秒刷新一次

// 优化的日志写入函数
function writeLogToLocalOptimized(logData) {
  // 添加时间戳
  const timestamp = new Date().toLocaleString();
  const logEntry = `[${timestamp}] ${logData}\n`;

  // 添加到缓冲区
  logBuffer.push(logEntry);

  // 如果缓冲区满了，立即刷新
  if (logBuffer.length >= LOG_BUFFER_SIZE) {
    flushLogBuffer();
  } else if (!logBufferTimer) {
    // 设置定时器，定期刷新缓冲区
    logBufferTimer = setTimeout(() => {
      flushLogBuffer();
    }, LOG_FLUSH_INTERVAL);
  }
}

// 刷新日志缓冲区
function flushLogBuffer() {
  if (logBuffer.length === 0) return;

  const logPath =
    'D://wcs_temp_data/log/' +
    (new Date().toLocaleDateString() + '.txt').replaceAll('/', '-');

  // 确保日志目录存在
  const logDir = 'D://wcs_temp_data/log';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // 检查日志文件大小，如果超过10MB则进行轮转
  try {
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      if (fileSizeInMB > 10) {
        // 创建备份文件
        const backupPath = logPath.replace('.txt', `_${Date.now()}.txt`);
        fs.renameSync(logPath, backupPath);
        console.log(`日志文件过大，已轮转到: ${backupPath}`);
      }
    }
  } catch (error) {
    console.error('检查日志文件大小时出错:', error);
  }

  // 批量写入日志
  const logContent = logBuffer.join('');
  fs.appendFile(logPath, logContent, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });

  // 清空缓冲区
  logBuffer = [];

  // 清除定时器
  if (logBufferTimer) {
    clearTimeout(logBufferTimer);
    logBufferTimer = null;
  }
}
// electron 开启热更新
try {
  require('electron-reloader')(module, {});
} catch (_) {
  // 忽略热更新错误
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用退出时确保所有日志都被写入
app.on('before-quit', () => {
  flushLogBuffer();
});

global.sharedObject = {
  userInfo: {}
};
let mainWindow = null;
app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
    icon: './build/icons/icon.ico'
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html');
    // mainWindow.webContents.openDevTools();
  }
  ipcMain.on('logStatus', (event, arg) => {
    console.log(arg);
    if (arg === 'login') {
      mainWindow.setResizable(true);
      mainWindow.setBounds({
        x: 0,
        y: 0,
        width: screen.getPrimaryDisplay().workAreaSize.width,
        height: screen.getPrimaryDisplay().workAreaSize.height
      });
    } else {
      // 太几把坑了，windows系统setSize center方法失效 必须先mainWindow.unmaximize()
      mainWindow.unmaximize();
      mainWindow.setSize(1100, 600);
      mainWindow.center();
      global.sharedObject.userInfo = {};
      // mainWindow.setResizable(false)
    }
  });
  // 定义自定义事件
  ipcMain.on('close-window', function () {
    mainWindow.close();
  });
  // 定义自定义事件
  ipcMain.on('min-window', (event, arg) => {
    mainWindow.minimize();
  });
  // writeValuesToPLC
  ipcMain.on('writeValuesToPLC', (event, arg1, arg2) => {
    writeValuesToPLC(arg1, arg2);
  });
  // writeSingleValueToPLC - 单独给PLC某个变量写值，持续指定时间后停止
  ipcMain.on('writeSingleValueToPLC', (event, arg1, arg2) => {
    writeSingleValueToPLC(arg1, arg2);
  });
  // 定义自定义事件
  ipcMain.on('max-window', (event, arg) => {
    if (arg === 'max-window') {
      return mainWindow.maximize();
    }
    mainWindow.unmaximize();
    mainWindow.setBounds({
      x: 10,
      y: 10,
      width: screen.getPrimaryDisplay().workAreaSize.width - 20,
      height: screen.getPrimaryDisplay().workAreaSize.height - 20
    });
  });
  // 启动plc conPLC
  ipcMain.on('conPLC', (event, arg1, arg2) => {
    if (process.env.NODE_ENV === 'production') {
      conPLC();
    }
    // setInterval(() => {
    //   console.log(writeStrArr.toString());
    // }, 50);
    // sendHeartToPLC()
  });
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('mainWin-max', 'max-window');
  });
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('mainWin-max', 'unmax-window');
  });
  mainWindow.on('close', (e) => {
    closeStatus = true;
    e.preventDefault(); //先阻止一下默认行为，不然直接关了，提示框只会闪一下
    dialog
      .showMessageBox({
        type: 'warning',
        title: '提醒！',
        message: '确认关闭程序吗？',
        buttons: ['关闭程序', '放入托盘', '取消'], //选择按钮，点击确认则下面的idx为0，取消为1
        cancelId: 2 //这个的值是如果直接把提示框×掉返回的值，这里设置成和"取消"按钮一样的值，下面的idx也会是1
      })
      .then((idx) => {
        if (idx.response == 2) {
          e.preventDefault();
        } else if (idx.response == 0) {
          mainWindow = null;
          app.exit();
        } else {
          mainWindow.setSkipTaskbar(true);
          mainWindow.hide();
        }
      });
  });
  if (process.env.NODE_ENV === 'development') {
    let revert = false;
    // 初始化小车位置数据，在合理范围内
    let cart1Position = 5670; // 初始位置在A线附近
    let cart2Position = 5820; // 初始位置在A线附近
    let cart3Position = 5830; // 初始位置在A线附近

    setInterval(() => {
      if (mainWindow) {
        // 小车位置动态变化，模拟真实运行
        cart1Position += Math.random() > 0.5 ? 10 : -10;
        cart2Position += Math.random() > 0.5 ? 10 : -10;
        cart3Position += Math.random() > 0.5 ? 10 : -10;

        // 确保小车位置在合理范围内
        cart1Position = Math.max(5670, Math.min(19190, cart1Position));
        cart2Position = Math.max(5820, Math.min(16990, cart2Position));
        cart3Position = Math.max(5830, Math.min(17020, cart3Position));

        if (revert) {
          mainWindow.webContents.send(
            'receivedMsg',
            {
              // 输送线看门狗心跳
              DBW0: 0,
              // 输送线当前运行状态
              DBW2: 1,
              // 外部货物接驳口-允许进料
              DBW4: 1,
              // A线电机运行信号
              DBW6: 0,
              // A线光电检测信号
              DBW8: 35580,
              // B线电机运行信号
              DBW10: 512,
              // B线光电检测信号
              DBW12: -1793,
              // C线电机运行信号
              DBW14: 0,
              // C线光电检测信号
              DBW16: 0,
              // D线电机运行信号
              DBW18: 1,
              // D线光电检测信号
              DBW20: 0,
              // E线电机运行信号
              DBW22: 0,
              // E线光电检测信号
              DBW24: 1,
              // F线电机运行信号
              DBW26: 1,
              // F线光电检测信号
              DBW28: 0,
              // G线电机运行信号
              DBW30: 0,
              // G线光电检测信号
              DBW32: 1,
              // A1数量
              DBW34: 15,
              // A2数量
              DBW36: 8,
              // A3数量
              DBW38: 12,
              // B1数量
              DBW40: 20,
              // B2数量
              DBW42: 5,
              // B3数量
              DBW44: 18,
              // C1数量
              DBW46: 10,
              // C2数量
              DBW48: 25,
              // C3数量
              DBW50: 7,
              // D1数量
              DBW52: 14,
              // D2数量
              DBW54: 9,
              // D3数量
              DBW56: 16,
              // E1数量
              DBW58: 22,
              // E2数量
              DBW60: 11,
              // E3数量
              DBW62: 13,
              // F1数量
              DBW64: 6,
              // F2数量
              DBW66: 19,
              // F3数量
              DBW68: 4,
              // G1数量
              DBW70: 17,
              // G2数量
              DBW72: 3,
              // G3数量
              DBW74: 21,
              // 上货区电机运行信号（扫码后入队）
              DBW76: 1,
              // 上货区输送线光电信号
              DBW78: 0,
              // 预热前小车电机运行信号1#车
              DBW80: Math.round(cart1Position),
              // 预热前小车检测信号1#车
              DBW82: 0,
              // 灭菌前小车电机运行信号2#车
              DBW84: Math.round(cart2Position),
              // 灭菌前小车检测信号2#车
              DBW86: 1,
              // 解析前小车电机运行信号3#车
              DBW88: Math.round(cart3Position),
              // 解析前小车检测信号3#车
              DBW90: 0,
              // 扫码枪处光电信号
              DBW92: 1,
              // 下线扫码枪处，申请扫码
              DBW94: 0,
              // 请求上位机下发任务
              DBW96: 1,
              // 一楼出货口有货需取货处理信号
              DBW98: 0,
              // 预热房前缓存线请求目的地
              DBW360: 2,
              // 一楼下货出口托盘信息（托盘号）
              DBB100: 'HF800SR-1-A                   ',
              // 一楼下线（扫码枪处）（托盘号）
              DBB130: 'HF800SR-1-B                   ',
              // 一楼接货站台扫码数据（托盘号）
              DBB160: 'HF800SR-1-H                   ',
              // 一楼上货区（扫码后入队）（托盘号）
              DBB190: '83048880004868800784          ',
              // 二楼A接货站台扫码数据（托盘号）
              DBB220: 'HF800SR-1-H                   ',
              // 二楼B接货站台扫码数据（托盘号）
              DBB250: '83048880004868800784          ',
              // 三楼A接货站台扫码数据（托盘号）
              DBB280: 'HF800SR-1-H                   ',
              // 三楼B接货站台扫码数据（托盘号）
              DBB310: '83048880004868800784          '
            },
            writeStrArr.toString()
          );
        } else {
          mainWindow.webContents.send(
            'receivedMsg',
            {
              // 输送线看门狗心跳
              DBW0: 1,
              // 输送线当前运行状态
              DBW2: 0,
              // 外部货物接驳口-允许进料
              DBW4: 0,
              // A线电机运行信号
              DBW6: 1,
              // A线光电检测信号
              DBW8: 35580,
              // B线电机运行信号
              DBW10: 512,
              // B线光电检测信号
              DBW12: -1793,
              // C线电机运行信号
              DBW14: 1,
              // C线光电检测信号
              DBW16: 1,
              // D线电机运行信号
              DBW18: 0,
              // D线光电检测信号
              DBW20: 1,
              // E线电机运行信号
              DBW22: 1,
              // E线光电检测信号
              DBW24: 0,
              // F线电机运行信号
              DBW26: 0,
              // F线光电检测信号
              DBW28: 1,
              // G线电机运行信号
              DBW30: 1,
              // G线光电检测信号
              DBW32: 0,
              // A1数量
              DBW34: 18,
              // A2数量
              DBW36: 12,
              // A3数量
              DBW38: 9,
              // B1数量
              DBW40: 15,
              // B2数量
              DBW42: 22,
              // B3数量
              DBW44: 7,
              // C1数量
              DBW46: 14,
              // C2数量
              DBW48: 8,
              // C3数量
              DBW50: 20,
              // D1数量
              DBW52: 11,
              // D2数量
              DBW54: 16,
              // D3数量
              DBW56: 13,
              // E1数量
              DBW58: 6,
              // E2数量
              DBW60: 19,
              // E3数量
              DBW62: 4,
              // F1数量
              DBW64: 17,
              // F2数量
              DBW66: 3,
              // F3数量
              DBW68: 21,
              // G1数量
              DBW70: 10,
              // G2数量
              DBW72: 25,
              // G3数量
              DBW74: 5,
              // 上货区电机运行信号（扫码后入队）
              DBW76: 0,
              // 上货区输送线光电信号
              DBW78: 1,
              // 预热前小车电机运行信号1#车
              DBW80: Math.round(cart1Position),
              // 预热前小车检测信号1#车
              DBW82: 1,
              // 灭菌前小车电机运行信号2#车
              DBW84: Math.round(cart2Position),
              // 灭菌前小车检测信号2#车
              DBW86: 0,
              // 解析前小车电机运行信号3#车
              DBW88: Math.round(cart3Position),
              // 解析前小车检测信号3#车
              DBW90: 1,
              // 扫码枪处光电信号
              DBW92: 0,
              // 下线扫码枪处，申请扫码
              DBW94: 1,
              // 请求上位机下发任务
              DBW96: 0,
              // 一楼出货口有货需取货处理信号
              DBW98: 1,
              // 预热房前缓存线请求目的地
              DBW360: 1,
              // 一楼下货出口托盘信息（托盘号）
              DBB100: 'HF800SR-1',
              // 一楼下线（扫码枪处）（托盘号）
              DBB130: 'HF800SR-',
              // 一楼接货站台扫码数据（托盘号）
              DBB160: 'HF800SR-1',
              // 一楼上货区（扫码后入队）（托盘号）
              DBB190: '830488800048',
              // 二楼A接货站台扫码数据（托盘号）
              DBB220: 'HF800SR-1-',
              // 二楼B接货站台扫码数据（托盘号）
              DBB250: '83048880004',
              // 三楼A接货站台扫码数据（托盘号）
              DBB280: 'HF800SR-1',
              // 三楼B接货站台扫码数据（托盘号）
              DBB310: '830488800'
            },
            writeStrArr.toString()
          );
        }
        revert = !revert;
      }
    }, 100);
  }
  setAppTray();
  if (process.env.NODE_ENV === 'production') {
    try {
      const javaPath = path.join(
        __static,
        './jre',
        'jre1.8.0_251',
        'bin',
        'java'
      );
      const jarPath = path.join(
        __static,
        './jarlib',
        'ccs-disinfection-middle.jar'
      );

      // 优化的Java启动参数
      const javaOpts = [
        // 内存设置
        '-Xmx4096m', // 最大堆内存
        '-Xms4096m', // 初始堆内存
        '-XX:MaxMetaspaceSize=512m', // 最大元空间大小
        '-XX:MetaspaceSize=256m', // 初始元空间大小

        // GC设置
        '-XX:+UseG1GC', // 使用G1垃圾收集器
        '-XX:MaxGCPauseMillis=200', // 最大GC停顿时间
        '-XX:+HeapDumpOnOutOfMemoryError', // 内存溢出时导出堆转储
        '-XX:HeapDumpPath=D://wcs_temp_data/dump', // 堆转储文件路径

        // 性能优化
        '-XX:+DisableExplicitGC', // 禁止显式GC调用
        '-XX:+UseStringDeduplication', // 开启字符串去重
        '-XX:+OptimizeStringConcat', // 优化字符串连接

        // 监控和调试
        '-XX:+PrintGCDetails', // 打印GC详细信息
        '-XX:+PrintGCDateStamps', // 打印GC时间戳
        '-Xloggc:D://wcs_temp_data/log/gc.log', // GC日志文件
        '-XX:+HeapDumpBeforeFullGC', // Full GC前生成堆转储
        '-XX:+PrintGCApplicationStoppedTime', // 打印应用暂停时间

        // 错误处理
        '-XX:+ExitOnOutOfMemoryError', // 发生OOM时退出
        '-XX:ErrorFile=D://wcs_temp_data/log/hs_err_%p.log', // JVM错误日志
        // 编码
        '-Dfile.encoding=UTF-8',
        // 应用参数
        '-jar',
        jarPath
      ];
      // 确保日志目录存在
      const logDir = 'D://wcs_temp_data/log';
      const dumpDir = 'D://wcs_temp_data/dump';
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      if (!fs.existsSync(dumpDir)) {
        fs.mkdirSync(dumpDir, { recursive: true });
      }

      logToFile(`启动Java进程，使用参数: ${javaOpts.join(' ')}`);
      const process = spawn(javaPath, javaOpts);

      process.on('error', (err) => {
        logToFile(`Java程序启动错误: ${err.message}`);
      });

      process.on('exit', (code, signal) => {
        logToFile(`Java程序退出，退出码: ${code}, 信号: ${signal}`);
      });
    } catch (error) {
      logToFile(`Java程序启动异常: ${error.message}`);
    }
  }

  // 开发者工具
  globalShortcut.register('CommandOrControl+L', () => {
    mainWindow.webContents.openDevTools();
  });
  globalShortcut.register('CommandOrControl+F11', () => {
    mainWindow.isFullScreen()
      ? mainWindow.setFullScreen(false)
      : mainWindow.setFullScreen(true);
  });
  // 定义自定义事件
  ipcMain.on('full_screen', function () {
    mainWindow.isFullScreen()
      ? mainWindow.setFullScreen(false)
      : mainWindow.setFullScreen(true);
  });
  // 定义自定义事件 - 优化后的日志写入
  ipcMain.on('writeLogToLocal', (event, arg) => {
    writeLogToLocalOptimized(arg);
  });
});

function conPLC() {
  logger.info('开始连接PLC');
  // 查询配置
  HttpUtil.get('/cssConfig/getConfig')
    .then((res) => {
      logger.info(JSON.stringify(res));
      if (!res.data.plcPort) {
        logger.info('配置查询失败');
        // We have an error. Maybe the PLC is not reachable.
        conPLC();
        return false;
      }
      conn.initiateConnection(
        {
          port: Number(res.data.plcPort),
          host: res.data.plcIp,
          rack: 0,
          slot: 1,
          debug: false
        },
        (err) => {
          if (typeof err !== 'undefined') {
            logger.info('连接PLC失败' + JSON.stringify(err));
            // We have an error. Maybe the PLC is not reachable.
            conPLC();
            return false;
            // process.exit();
          }
          conn.setTranslationCB(function (tag) {
            return variables[tag];
          }); // This sets the "translation" to allow us to work with object names
          logger.info('连接PLC成功');
          // 输送线看门狗心跳
          conn.addItems('DBW0');
          // 输送线当前运行状态
          conn.addItems('DBW2');
          // 外部货物接驳口-允许进料
          conn.addItems('DBW4');
          // A线电机运行信号
          conn.addItems('DBW6');
          // A线光电检测信号
          conn.addItems('DBW8');
          // B线电机运行信号
          conn.addItems('DBW10');
          // B线光电检测信号
          conn.addItems('DBW12');
          // C线电机运行信号
          conn.addItems('DBW14');
          // C线光电检测信号
          conn.addItems('DBW16');
          // D线电机运行信号
          conn.addItems('DBW18');
          // D线光电检测信号
          conn.addItems('DBW20');
          // E线电机运行信号
          conn.addItems('DBW22');
          // E线光电检测信号
          conn.addItems('DBW24');
          // F线电机运行信号
          conn.addItems('DBW26');
          // F线光电检测信号
          conn.addItems('DBW28');
          // G线电机运行信号
          conn.addItems('DBW30');
          // G线光电检测信号
          conn.addItems('DBW32');
          // A1数量
          conn.addItems('DBW34');
          // A2数量
          conn.addItems('DBW36');
          // A3数量
          conn.addItems('DBW38');
          // B1数量
          conn.addItems('DBW40');
          // B2数量
          conn.addItems('DBW42');
          // B3数量
          conn.addItems('DBW44');
          // C1数量
          conn.addItems('DBW46');
          // C2数量
          conn.addItems('DBW48');
          // C3数量
          conn.addItems('DBW50');
          // D1数量
          conn.addItems('DBW52');
          // D2数量
          conn.addItems('DBW54');
          // D3数量
          conn.addItems('DBW56');
          // E1数量
          conn.addItems('DBW58');
          // E2数量
          conn.addItems('DBW60');
          // E3数量
          conn.addItems('DBW62');
          // F1数量
          conn.addItems('DBW64');
          // F2数量
          conn.addItems('DBW66');
          // F3数量
          conn.addItems('DBW68');
          // G1数量
          conn.addItems('DBW70');
          // G2数量
          conn.addItems('DBW72');
          // G3数量
          conn.addItems('DBW74');
          // 上货区电机运行信号（扫码后入队）
          conn.addItems('DBW76');
          // 上货区输送线光电信号
          conn.addItems('DBW78');
          // 预热前小车电机运行信号1#车
          conn.addItems('DBW80');
          // 预热前小车检测信号1#车
          conn.addItems('DBW82');
          // 灭菌前小车电机运行信号2#车
          conn.addItems('DBW84');
          // 灭菌前小车检测信号2#车
          conn.addItems('DBW86');
          // 解析前小车电机运行信号3#车
          conn.addItems('DBW88');
          // 解析前小车检测信号3#车
          conn.addItems('DBW90');
          // 扫码枪处光电信号
          conn.addItems('DBW92');
          // 下线扫码枪处，申请扫码
          conn.addItems('DBW94');
          // 请求上位机下发任务
          conn.addItems('DBW96');
          // 一楼出货口有货需取货处理信号
          conn.addItems('DBW98');
          // 一楼下货出口托盘信息（托盘号）
          conn.addItems('DBB100');
          // 一楼下线（扫码枪处）（托盘号）
          conn.addItems('DBB130');
          // 一楼接货站台扫码数据（托盘号）
          conn.addItems('DBB160');
          // 一楼上货区（扫码后入队）（托盘号）
          conn.addItems('DBB190');
          // 二楼A接货站台扫码数据（托盘号）
          conn.addItems('DBB220');
          // 二楼B接货站台扫码数据（托盘号）
          conn.addItems('DBB250');
          // 三楼A接货站台扫码数据（托盘号）
          conn.addItems('DBB280');
          // 三楼B接货站台扫码数据（托盘号）
          conn.addItems('DBB310');
          // 预热房前缓存线请求目的地
          conn.addItems('DBW360');
          setInterval(() => {
            conn.readAllItems(valuesReady);
          }, 200);
          setInterval(() => {
            // nodes7 代码
            conn.writeItems(writeAddArr, writeStrArr, valuesWritten);
          }, 200);
          // 发送心跳
          sendHeartToPLC();
        }
      );
    })
    .catch((err) => {
      logger.info('config error!');
    });
}
let times = 1;
let nowValue = 0;
function sendHeartToPLC() {
  setInterval(() => {
    if (times > 5) {
      times = 1;
      nowValue = 1 - nowValue;
    }
    times++;
    writeValuesToPLC('DBW500', nowValue);
  }, 200); // 每200毫秒执行一次交替
}

var variables = {
  DBW0: 'DB101,INT0', // 心跳
  DBW2: 'DB101,INT2', // 输送线当前运行状态
  DBW4: 'DB101,INT4', // 外部货物接驳口-允许进料
  DBW6: 'DB101,INT6', // A线电机运行信号
  DBW8: 'DB101,INT8', // A线光电检测信号
  DBW10: 'DB101,INT10', // B线电机运行信号
  DBW12: 'DB101,INT12', // B线光电检测信号
  DBW14: 'DB101,INT14', // C线电机运行信号
  DBW16: 'DB101,INT16', // C线光电检测信号
  DBW18: 'DB101,INT18', // D线电机运行信号
  DBW20: 'DB101,INT20', // D线光电检测信号
  DBW22: 'DB101,INT22', // E线电机运行信号
  DBW24: 'DB101,INT24', // E线光电检测信号
  DBW26: 'DB101,INT26', // F线电机运行信号
  DBW28: 'DB101,INT28', // F线光电检测信号
  DBW30: 'DB101,INT30', // G线电机运行信号
  DBW32: 'DB101,INT32', // G线光电检测信号
  DBW34: 'DB101,INT34', // A1数量
  DBW36: 'DB101,INT36', // A2数量
  DBW38: 'DB101,INT38', // A3数量
  DBW40: 'DB101,INT40', // B1数量
  DBW42: 'DB101,INT42', // B2数量
  DBW44: 'DB101,INT44', // B3数量
  DBW46: 'DB101,INT46', // C1数量
  DBW48: 'DB101,INT48', // C2数量
  DBW50: 'DB101,INT50', // C3数量
  DBW52: 'DB101,INT52', // D1数量
  DBW54: 'DB101,INT54', // D2数量
  DBW56: 'DB101,INT56', // D3数量
  DBW58: 'DB101,INT58', // E1数量
  DBW60: 'DB101,INT60', // E2数量
  DBW62: 'DB101,INT62', // E3数量
  DBW64: 'DB101,INT64', // F1数量
  DBW66: 'DB101,INT66', // F2数量
  DBW68: 'DB101,INT68', // F3数量
  DBW70: 'DB101,INT70', // G1数量
  DBW72: 'DB101,INT72', // G2数量
  DBW74: 'DB101,INT74', // G3数量
  DBW76: 'DB101,INT76', // 上货区电机运行信号（扫码后入队）
  DBW78: 'DB101,INT78', // 上货区输送线光电信号
  DBW80: 'DB101,INT80', // 预热前小车电机运行信号1#车
  DBW82: 'DB101,INT82', // 预热前小车检测信号1#车
  DBW84: 'DB101,INT84', // 灭菌前小车电机运行信号2#车
  DBW86: 'DB101,INT86', // 灭菌前小车检测信号2#车
  DBW88: 'DB101,INT88', // 解析前小车电机运行信号3#车
  DBW90: 'DB101,INT90', // 解析前小车检测信号3#车
  DBW92: 'DB101,INT92', // 扫码枪处光电信号
  DBW94: 'DB101,INT94', // 下线扫码枪处，申请扫码
  DBW96: 'DB101,INT96', // 请求上位机下发任务
  DBW98: 'DB101,INT98', // 一楼出货口有货需取货处理信号
  DBB100: 'DB101,C100.8', // 一楼下货出口托盘信息（托盘号）
  DBB130: 'DB101,C130.8', // 一楼下线（扫码枪处）（托盘号）
  DBB160: 'DB101,C160.8', // 一楼接货站台扫码数据（托盘号）
  DBB190: 'DB101,C190.8', // 一楼上货区（扫码后入队）（托盘号）
  DBB220: 'DB101,C220.8', // 二楼A接货站台扫码数据（托盘号）
  DBB250: 'DB101,C250.8', // 二楼B接货站台扫码数据（托盘号）
  DBB280: 'DB101,C280.8', // 三楼A接货站台扫码数据（托盘号）
  DBB310: 'DB101,C310.8', // 三楼B接货站台扫码数据（托盘号）
  DBW360: 'DB101,INT360', // 预热房前缓存线请求目的地
  DBW500: 'DB101,INT500', // WCS看门狗心跳
  DBW502: 'DB101,INT502', // WCS-全线启动
  DBW504: 'DB101,INT504', // WCS-全线停止
  DBW506: 'DB101,INT506', // WCS-全线暂停
  DBW508: 'DB101,INT508', // WCS-故障复位
  DBW510: 'DB101,INT510', // WCS-接货口启用/禁用——接货口全部禁用→写1禁用；写0不禁用
  DBW512: 'DB101,INT512', // WCS-接货口启用/禁用——一楼接货口启用→写1启用；写0不启用
  DBW514: 'DB101,INT514', // WCS-接货口启用/禁用——二楼1#接货口启用→写1启用；写0不启用
  DBW516: 'DB101,INT516', // WCS-接货口启用/禁用——二楼2#接货口启用→写1启用；写0不启用
  DBW518: 'DB101,INT518', // WCS-接货口启用/禁用——三楼1#接货口启用→写1启用；写0不启用
  DBW520: 'DB101,INT520', // WCS-接货口启用/禁用——三楼2#接货口启用→写1启用；写0不启用
  DBW522: 'DB101,INT522', // WCS-接货口启用/禁用——备用
  DBW524: 'DB101,INT524', // WCS执行进货预热房编号
  DBW526: 'DB101,INT526', // WCS执行出货预热房编号
  DBW528: 'DB101,INT528', // WCS执行进货灭菌柜编号
  DBW530: 'DB101,INT530', // WCS执行出货灭菌柜编号
  DBW540: 'DB101,INT540', // WCS下发任务完成
  DBW542: 'DB101,INT542', // WCS下发目的地
  DBB544: 'DB101,C544.8', // WCS下发托盘号
  DBW580: 'DB101,INT580', // 1楼上货扫码反馈
  DBW582: 'DB101,INT582', // 缓存扫码反馈
  DBW584: 'DB101,INT584', // 2楼A扫码反馈
  DBW586: 'DB101,INT586', // 2楼B扫码反馈
  DBW588: 'DB101,INT588', // 3楼A扫码反馈
  DBW590: 'DB101,INT590', // 3楼B扫码反馈
  DBW592: 'DB101,INT592' // 出库扫码反馈
};

var writeStrArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''];
var writeAddArr = [
  'DBW500', // WCS看门狗心跳
  'DBW502', // WCS-全线启动
  'DBW504', // WCS-全线停止
  'DBW506', // WCS-全线暂停
  'DBW508', // WCS-故障复位
  'DBW510', // WCS-接货口启用/禁用——接货口全部禁用→写1禁用；写0不禁用
  'DBW512', // WCS-接货口启用/禁用——一楼接货口启用→写1启用；写0不启用
  'DBW514', // WCS-接货口启用/禁用——二楼1#接货口启用→写1启用；写0不启用
  'DBW516', // WCS-接货口启用/禁用——二楼2#接货口启用→写1启用；写0不启用
  'DBW518', // WCS-接货口启用/禁用——三楼1#接货口启用→写1启用；写0不启用
  'DBW520', // WCS-接货口启用/禁用——三楼2#接货口启用→写1启用；写0不启用
  'DBW522', // WCS-接货口启用/禁用——备用
  'DBW526', // WCS执行出货预热房编号
  'DBW528', // WCS执行进货灭菌柜编号
  'DBW530', // WCS执行出货灭菌柜编号
  'DBW540', // WCS下发任务完成
  'DBW542', // WCS下发目的地
  'DBB544' // WCS下发托盘号
];

// 给PLC写值
function writeValuesToPLC(add, values) {
  const index = writeAddArr.indexOf(add);
  if (index !== -1) {
    writeStrArr[index] = values;
  } else {
    console.warn(`Address ${add} not found in writeAddArr.`);
  }
}

// 单独给PLC某个变量写值，1秒内发送3次
function writeSingleValueToPLC(add, values) {
  // 检查地址是否在variables中定义
  if (!variables[add]) {
    console.warn(`Address ${add} not found in variables.`);
    return;
  }

  // 立即写入第一次
  conn.writeItems([add], [values], (err) => {
    if (err) {
      console.error(`写入PLC地址 ${add} 失败:`, err);
    }
  });

  // 500ms后写入第二次
  setTimeout(() => {
    conn.writeItems([add], [values], (err) => {
      if (err) {
        console.error(`写入PLC地址 ${add} 失败:`, err);
      }
    });
  }, 500);

  // 1000ms后写入第三次
  setTimeout(() => {
    conn.writeItems([add], [values], (err) => {
      if (err) {
        console.error(`写入PLC地址 ${add} 失败:`, err);
      }
    });
    console.log(`完成写入PLC地址 ${add}，值：${values}，1秒内发送3次`);
  }, 1000);
}

function valuesWritten(anythingBad) {
  if (anythingBad) {
    console.log('SOMETHING WENT WRONG WRITING VALUES!!!!');
  }
}

function valuesReady(anythingBad, values) {
  if (anythingBad) {
    console.log('SOMETHING WENT WRONG READING VALUES!!!!');
  }
  // console.log(values)
  mainWindow.webContents.send('receivedMsg', values, writeStrArr.toString());
}

const setAppTray = () => {
  // 系统托盘右键菜单
  var trayMenuTemplate = [
    {
      label: '退出',
      click: function () {
        app.quit();
      }
    }
  ];

  // 系统托盘图标目录
  appTray = new Tray(path.join(__static, './icon.ico'));

  // 图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

  // 设置此托盘图标的悬停提示内容
  appTray.setToolTip('WCS系统');

  // 设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);

  appTray.on('click', function () {
    //主窗口显示隐藏切换
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      mainWindow.setSkipTaskbar(true);
    } else {
      mainWindow.show();
      mainWindow.setSkipTaskbar(false);
    }
  });
};
