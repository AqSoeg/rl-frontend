// server.js
import fs from 'fs';
import { WebSocketServer } from 'ws';

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ port: 8080 });

// 监听客户端连接
wss.on('connection', (ws) => {
    console.log('New client connected');

    // 监听客户端发送的 JSON 数据
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Received data from client:', data);

        // 将接收到的数据保存到 model.json 文件中
        saveModelData(data);

        // 向客户端发送确认消息
        ws.send(JSON.stringify({ status: 'success', message: 'Model saved successfully' }));
    });

    // 监听客户端断开连接
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// 保存模型数据到 model.json 文件
function saveModelData(data) {
    const filePath = './model.json';

    // 读取现有的 model.json 文件内容
    let existingData = [];
    if (fs.existsSync(filePath)) {
        existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // 将新数据添加到现有数据中
    existingData.push(data);

    // 将更新后的数据写回文件
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
    console.log('Model data saved to model.json');
}

console.log('WebSocket server is running on ws://localhost:8080');