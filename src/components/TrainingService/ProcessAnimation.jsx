import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Card, Row, Col, Table } from 'antd';

const ProcessAnimation = ({ agentId, scenarioId, onClose }) => {
    const canvasRef = useRef(null);
    const socketRef = useRef(null);
    const [frameData, setFrameData] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    
    // Initialize canvas and WebSocket connection
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Set up WebSocket connection
        socketRef.current = io('http://localhost:5000');
        
        socketRef.current.on('connect', () => {
            setConnectionStatus('connected');
            console.log('WebSocket connected');
            
            // Start the data stream
            fetch('http://localhost:5000/get_process_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agentId: agentId,
                    scenarioId: scenarioId
                })
            }).catch(err => console.error('Error starting data stream:', err));
        });
        
        socketRef.current.on('disconnect', () => {
            setConnectionStatus('disconnected');
            console.log('WebSocket disconnected');
        });
        
        socketRef.current.on('process_update', (data) => {
            setFrameData(data);
            drawAnimation(ctx, data);
        });
        
        socketRef.current.on('error', (err) => {
            console.error('WebSocket error:', err);
            setConnectionStatus('error');
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [agentId, scenarioId]);

    // Drawing functions
    const drawAnimation = (ctx, data) => {
        if (!data || !data.entities) return;
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw all entities
        data.entities.forEach(entity => {
            switch(entity.type.type) {
                case 'circle':
                    drawCircle(ctx, entity);
                    break;
                case 'line':
                    drawLine(ctx, entity);
                    break;
                case 'fan':
                    drawFan(ctx, entity);
                    break;
            }
        });
    };

    const drawCircle = (ctx, entity) => {
        const { center, radius, color, opacity } = entity.type;
        ctx.beginPath();
        ctx.arc(center[0] * 40, center[1] * 40, radius * 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.join(',')}, ${opacity})`;
        ctx.fill();
        
        // Draw entity name
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(entity.name, center[0] * 40 - 10, center[1] * 40 - radius * 10 - 5);
    };

    const drawLine = (ctx, entity) => {
        const { start, end, color, width } = entity.type;
        ctx.beginPath();
        ctx.moveTo(start[0] * 40, start[1] * 40);
        ctx.lineTo(end[0] * 40, end[1] * 40);
        ctx.strokeStyle = `rgb(${color.join(',')})`;
        ctx.lineWidth = width;
        ctx.stroke();
    };

    const drawFan = (ctx, entity) => {
        const { center, startAngle, endAngle, color } = entity.type;
        ctx.beginPath();
        ctx.moveTo(center[0] * 40, center[1] * 40);
        ctx.arc(
            center[0] * 40, 
            center[1] * 40, 
            50, 
            startAngle, 
            endAngle
        );
        ctx.closePath();
        ctx.fillStyle = `rgba(${color.join(',')}, 0.3)`;
        ctx.fill();
    };

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ 
                width: '300px', 
                padding: '16px',
                borderRight: '1px solid #f0f0f0',
                overflowY: 'auto'
            }}>
                <Card title="帧信息" size="small">
                    {frameData ? (
                        <div>
                            <p><strong>帧数:</strong> {frameData.info.find(i => i.key === '帧数')?.value || 'N/A'}</p>
                            <p><strong>更新时间:</strong> {frameData.info.find(i => i.key === '更新时间')?.value || 'N/A'}</p>
                            <p><strong>连接状态:</strong> {connectionStatus}</p>
                            
                            <Table
                                columns={[
                                    { title: '实体', dataIndex: 'name', key: 'name' },
                                    { 
                                        title: '位置', 
                                        key: 'position',
                                        render: (_, entity) => {
                                            if (entity.type.type === 'circle' || entity.type.type === 'fan') {
                                                return `${entity.type.center[0].toFixed(2)}, ${entity.type.center[1].toFixed(2)}`;
                                            } else if (entity.type.type === 'line') {
                                                return `起点: ${entity.type.start[0].toFixed(2)}, ${entity.type.start[1].toFixed(2)} | 终点: ${entity.type.end[0].toFixed(2)}, ${entity.type.end[1].toFixed(2)}`;
                                            }
                                            return 'N/A';
                                        }
                                    }
                                ]}
                                dataSource={frameData?.entities || []}
                                size="small"
                                pagination={false}
                                rowKey="name"
                            />
                        </div>
                    ) : (
                        <p>等待数据...</p>
                    )}
                </Card>
            </div>
            
            <div style={{ flex: 1, padding: '16px', display: 'flex', justifyContent: 'center' }}>
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    style={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #ddd',
                        maxWidth: '100%',
                        maxHeight: '100%'
                    }}
                />
            </div>
        </div>
    );
};

export default ProcessAnimation;