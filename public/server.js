// server.js
import fs from 'fs';
import { WebSocketServer } from 'ws';

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ port: 8080 });
const MODEL_FILE_PATH = './public/model.json'; // 模型文件路径

// 监听客户端连接
wss.on('connection', (ws) => {
    console.log('New client connected');

    // 监听客户端发送的 JSON 数据
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received data from client:', data);

            // 保存数据到文件
            saveModelData(data);

            // 向客户端发送确认消息
            ws.send(JSON.stringify({ status: 'success', message: 'Model saved successfully' }));
        } catch (error) {
            console.error('Error processing client message:', error);
            ws.send(JSON.stringify({ status: 'error', message: 'Invalid JSON data' }));
        }
    });

    // 监听客户端断开连接
    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // 监听错误
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// 保存模型数据到 model.json 文件
function saveModelData(data) {
    try {
        // 读取现有的 model.json 文件内容
        let existingData = [];
        if (fs.existsSync(MODEL_FILE_PATH)) {
            const fileContent = fs.readFileSync(MODEL_FILE_PATH, 'utf-8');
            existingData = JSON.parse(fileContent);

            // 确保 existingData 是一个数组
            if (!Array.isArray(existingData)) {
                console.warn('model.json 文件内容不是数组，将被重置为空数组');
                existingData = [];
            }
        }

        // 将新数据添加到现有数据中
        existingData.push(data);

        // 将更新后的数据写回文件
        fs.writeFileSync(MODEL_FILE_PATH, JSON.stringify(existingData, null, 2), 'utf-8');
        console.log('Model data saved to model.json');
    } catch (error) {
        console.error('Error saving model data:', error);
    }
}

console.log('WebSocket server is running on ws://localhost:8080');