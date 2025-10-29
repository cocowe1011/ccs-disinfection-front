const WebSocket = require('ws');

class AlarmWebSocketServer {
  constructor(port = 8080) {
    this.port = port;
    this.wss = null;
    this.clients = new Map(); // 存储连接的客户端信息
    this.isRunning = false;
    this.mainWindow = null; // 存储主窗口引用，用于IPC通信

    this.init();
  }

  // 设置主窗口引用
  setMainWindow(mainWindow) {
    this.mainWindow = mainWindow;
  }

  init() {
    try {
      this.wss = new WebSocket.Server({
        port: this.port,
        verifyClient: (info) => {
          // 允许跨域连接
          return true;
        }
      });

      this.wss.on('connection', (ws, req) => {
        const clientId = this.generateClientId();
        const clientInfo = {
          id: clientId,
          ws: ws,
          userAgent: req.headers['user-agent'] || 'Unknown',
          ip:
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            'Unknown',
          connectedAt: new Date(),
          lastPing: Date.now()
        };

        this.clients.set(clientId, clientInfo);
        console.log(`移动端客户端连接: ${clientId}, IP: ${clientInfo.ip}`);

        // 发送连接成功消息
        this.sendToClient(clientId, {
          type: 'connected',
          clientId: clientId,
          message: '连接成功'
        });

        // 处理消息
        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            this.handleClientMessage(clientId, data);
          } catch (error) {
            console.error('解析客户端消息失败:', error);
          }
        });

        // 处理连接关闭
        ws.on('close', () => {
          console.log(`移动端客户端断开连接: ${clientId}`);
          this.clients.delete(clientId);
        });

        // 处理连接错误
        ws.on('error', (error) => {
          console.error(`客户端连接错误 ${clientId}:`, error);
          this.clients.delete(clientId);
        });

        // 设置心跳检测
        ws.on('pong', () => {
          if (this.clients.has(clientId)) {
            this.clients.get(clientId).lastPing = Date.now();
          }
        });
      });

      this.wss.on('listening', () => {
        console.log(`报警日志WebSocket服务器启动成功，端口: ${this.port}`);
        this.isRunning = true;
      });

      this.wss.on('error', (error) => {
        console.error('WebSocket服务器错误:', error);
        this.isRunning = false;
      });

      // 启动心跳检测
      this.startHeartbeat();
    } catch (error) {
      console.error('WebSocket服务器初始化失败:', error);
      this.isRunning = false;
    }
  }

  // 处理客户端消息
  handleClientMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (data.type) {
      case 'register':
        // 客户端注册信息
        console.log(`客户端 ${clientId} 注册成功`);
        this.sendToClient(clientId, {
          type: 'registered',
          message: '注册成功'
        });
        break;

      case 'ping':
        // 心跳包
        client.lastPing = Date.now();
        this.sendToClient(clientId, { type: 'pong' });
        break;

      case 'scan_code':
        // 处理扫码消息
        this.handleScanCodeMessage(clientId, data);
        break;

      case 'tray_data_changed':
        // 处理托盘数据变更通知
        this.handleTrayDataChanged(clientId, data);
        break;

      default:
        console.log(`收到客户端 ${clientId} 未知消息类型:`, data.type);
    }
  }

  // 处理扫码消息
  handleScanCodeMessage(clientId, data) {
    console.log(`收到客户端 ${clientId} 扫码消息:`, data);

    const { location, trayCode } = data;

    if (!this.mainWindow) {
      console.error('主窗口引用未设置，无法处理扫码消息');
      this.sendToClient(clientId, {
        type: 'scan_response',
        success: false,
        message: '服务器内部错误'
      });
      return;
    }

    // 根据扫码地点调用对应的处理方法
    const methodMap = {
      一楼接货站台: 'yiloujiehuozhantai',
      一楼上货区: 'yiloushanghuosaoma',
      二楼A接货: 'jiehuo2A',
      二楼B接货: 'jiehuo2B',
      三楼A接货: 'jiehuo3A',
      三楼B接货: 'jiehuo3B',
      下货扫码处: 'xiahuosaoma'
    };

    const methodName = methodMap[location];
    if (!methodName) {
      console.error(`未知的扫码地点: ${location}`);
      this.sendToClient(clientId, {
        type: 'scan_response',
        success: false,
        message: '未知的扫码地点'
      });
      return;
    }

    // 通过IPC发送消息到渲染进程
    this.mainWindow.webContents.send('mobile-scan-code', {
      method: methodName,
      trayCode: trayCode,
      source: 'PDA',
      clientId: clientId
    });

    // 发送确认消息给客户端
    this.sendToClient(clientId, {
      type: 'scan_response',
      success: true,
      message: '扫码消息已发送到PC端处理'
    });
  }

  // 发送扫码处理结果给移动端
  sendScanResult(clientId, result) {
    this.sendToClient(clientId, {
      type: 'scan_result',
      success: result.success,
      message: result.message,
      data: result.data
    });
  }

  // 处理托盘数据变更通知
  handleTrayDataChanged(clientId, data) {
    console.log(`收到客户端 ${clientId} 托盘数据变更通知`);

    if (!this.mainWindow) {
      console.error('主窗口引用未设置，无法处理托盘数据变更通知');
      return;
    }

    // 通过IPC发送消息到渲染进程，触发重新加载托盘数据
    this.mainWindow.webContents.send('mobile-tray-data-changed', {
      clientId: clientId,
      timestamp: data.timestamp
    });
  }

  // 推送报警日志到所有移动端
  pushAlarmToMobile(alarmData) {
    if (!this.isRunning) {
      console.warn('WebSocket服务器未运行，无法推送报警');
      return false;
    }

    const message = {
      type: 'alarm',
      data: alarmData,
      timestamp: new Date().toISOString()
    };

    let sentCount = 0;
    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        this.sendToClient(clientId, message);
        sentCount++;
      }
    });

    console.log(`推送报警到 ${sentCount} 个移动端客户端`);
    return sentCount > 0;
  }

  // 发送消息给指定客户端
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error(`发送消息给客户端 ${clientId} 失败:`, error);
        this.clients.delete(clientId);
        return false;
      }
    }
    return false;
  }

  // 生成客户端ID
  generateClientId() {
    return (
      'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  // 获取服务器状态
  getStatus() {
    return {
      isRunning: this.isRunning,
      port: this.port,
      clientCount: this.clients.size
    };
  }

  // 获取连接的客户端列表
  getConnectedClients() {
    const clientList = [];
    this.clients.forEach((client, clientId) => {
      clientList.push({
        id: clientId,
        ip: client.ip,
        userAgent: client.userAgent,
        connectedAt: client.connectedAt,
        lastPing: new Date(client.lastPing),
        status: client.ws.readyState === WebSocket.OPEN ? '在线' : '离线'
      });
    });
    return clientList;
  }

  // 心跳检测
  startHeartbeat() {
    setInterval(() => {
      const now = Date.now();
      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          // 检查是否超时（30秒无响应）
          if (now - client.lastPing > 30000) {
            console.log(`客户端 ${clientId} 心跳超时，关闭连接`);
            client.ws.terminate();
            this.clients.delete(clientId);
          } else {
            // 发送ping
            client.ws.ping();
          }
        } else {
          // 清理已断开的连接
          this.clients.delete(clientId);
        }
      });
    }, 15000); // 每15秒检查一次
  }

  // 停止WebSocket服务器
  stop() {
    if (this.wss) {
      this.wss.close();
      this.isRunning = false;
      console.log('WebSocket服务器已停止');
    }
  }
}

module.exports = AlarmWebSocketServer;
