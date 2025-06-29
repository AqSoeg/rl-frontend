import { WebSocketServer } from 'ws';
const WEBSOCKET_PORT = 8080; 
const EXTERNAL_HELPER_API_URL = 'http://localhost:5000/start_training'; 

const wss = new WebSocketServer({ port: WEBSOCKET_PORT });
console.log(`WebSocket server started on port ${WEBSOCKET_PORT}`);

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', async message => {
        console.log(`Received message from client: ${message}`);

        try {
            const data = JSON.parse(message);

            if (data.action === 'start_training') {

                try {
                    const helperResponse = await fetch(EXTERNAL_HELPER_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });
                    const helperResult = await helperResponse.json();
                    console.log('Received response from external helper:', helperResult);

                    if (helperResult.status === 'success' || helperResult.status === '训练完成') {
                        const responseToFrontend = {
                            status: '训练完成',
                            ALGORITHM_ID: helperResult.ALGORITHM_ID || data.ALGORITHM_ID,
                            time: helperResult.time || new Date().toISOString()
                        };
                        ws.send(JSON.stringify(responseToFrontend));
                    } else {
                        const errorResponseToFrontend = {
                            status: '训练失败',
                            ALGORITHM_ID: helperResult.ALGORITHM_ID || data.ALGORITHM_ID,
                            message: helperResult.message || '外部助手处理失败'
                        };
                        ws.send(JSON.stringify(errorResponseToFrontend));
                    }

                } catch (helperError) {
                    console.error('Error communicating with external helper:', helperError);
                    ws.send(JSON.stringify({
                        status: '训练失败',
                        ALGORITHM_ID: data.ALGORITHM_ID,
                        message: '与外部网络助手通信失败'
                    }));
                }
            }
        } catch (error) {
            console.error('Error parsing message from frontend or invalid action:', error);
            ws.send(JSON.stringify({ status: 'error', message: 'Invalid message format or action' }));
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
    ws.on('error', error => {
        console.error('WebSocket error:', error);
    });
});