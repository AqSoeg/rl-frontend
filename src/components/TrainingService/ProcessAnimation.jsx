import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const ProcessAnimation = ({ agentId, scenarioId }) => {
    const canvasRef = useRef(null);
    const [processData, setProcessData] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('正在连接...');
    const [fps, setFps] = useState(0); 
    const frameCountRef = useRef(0); 
    const lastUpdateTimeRef = useRef(Date.now()); 
    useEffect(() => {
        const socket = io(__APP_CONFIG__.socketiourl);
        socket.on('connect', () => {
            setConnectionStatus('连接成功！正在启动数据流...');
            lastUpdateTimeRef.current = Date.now();
            frameCountRef.current = 0;
            socket.emit('start_process', { agentId, scenarioId });
        });
        socket.on('process_data', (data) => {
            setProcessData(data);
        });
        socket.on('disconnect', () => {
            setConnectionStatus('已断开连接。');
        });
        return () => {
            socket.disconnect();
        };
    }, [agentId, scenarioId]);
    useEffect(() => {
        if (!canvasRef.current || !processData) return;
        frameCountRef.current += 1;
        const now = Date.now();
        const elapsed = now - lastUpdateTimeRef.current; 
        if (elapsed > 1000) {
            const calculatedFps = (frameCountRef.current * 1000) / elapsed;
            setFps(calculatedFps);

            lastUpdateTimeRef.current = now;
            frameCountRef.current = 0;
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);
        
        const entities = processData.entities;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        entities.forEach(entity => {
            if (entity.type.type === 'circle' || entity.type.type === 'fan') {
                const [x, y] = entity.type.center || [0, 0];
                const radius = entity.type.radius || 0;
                minX = Math.min(minX, x - radius);
                minY = Math.min(minY, y - radius);
                maxX = Math.max(maxX, x + radius);
                maxY = Math.max(maxY, y + radius);
            } else if (entity.type.type === 'line') {
                const [x1, y1] = entity.type.start || [0, 0];
                const [x2, y2] = entity.type.end || [0, 0];
                minX = Math.min(minX, x1, x2);
                minY = Math.min(minY, y1, y2);
                maxX = Math.max(maxX, x1, x2);
                maxY = Math.max(maxY, y1, y2);
            }
        });

        if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
            minX = 0; minY = 0; maxX = 10; maxY = 10;
        }
        
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const scaleX = width / (contentWidth || 1);
        const scaleY = height / (contentHeight || 1);
        const scale = Math.min(scaleX, scaleY) * 0.9;
        const offsetX = (width - contentWidth * scale) / 2 - minX * scale;
        const offsetY = (height - contentHeight * scale) / 2 - minY * scale;

        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        entities.forEach(entity => {
            const color = entity.type.color || [0, 0, 0];
            const opacity = entity.type.opacity !== undefined ? entity.type.opacity : 1.0;
            ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
            ctx.lineWidth = (entity.type.width || 1) / scale;

            switch (entity.type.type) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(entity.type.center[0], entity.type.center[1], entity.type.radius, 0, Math.PI * 2);
                    if (entity.type.fill) ctx.fill(); else ctx.stroke();
                    ctx.fillStyle = `rgba(0, 0, 0, 1)`; 
                    ctx.font = `${12 / scale}px Arial`; 
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(entity.name, entity.type.center[0], entity.type.center[1] - entity.type.radius - (10 / scale)); // Position above the circle
                    break;
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(entity.type.start[0], entity.type.start[1]);
                    ctx.lineTo(entity.type.end[0], entity.type.end[1]);
                    ctx.stroke();
                    
                    const midX = (entity.type.start[0] + entity.type.end[0]) / 2;
                    const midY = (entity.type.start[1] + entity.type.end[1]) / 2;
                    ctx.fillStyle = `rgba(0, 0, 0, 1)`; 
                    ctx.font = `${12 / scale}px Arial`; 
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(entity.name, midX, midY - (5 / scale)); 
                    break;
                case 'fan':
                    ctx.beginPath();
                    ctx.moveTo(entity.type.center[0], entity.type.center[1]);
                    ctx.arc(entity.type.center[0], entity.type.center[1], entity.type.radius || 10, entity.type.startAngle, entity.type.endAngle);
                    ctx.closePath();
                    ctx.fill();
                    
                    ctx.fillStyle = `rgba(0, 0, 0, 1)`; 
                    ctx.font = `${12 / scale}px Arial`; 
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(entity.name, entity.type.center[0], entity.type.center[1] - (20 / scale)); // Position above the fan
                    break;
                default:
                    break;
            }
        });
        ctx.restore();

    }, [processData]);
    return (
        <div>
            <p>连接状态: {connectionStatus}</p>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                <div className="canvas-container">
                    <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid #ccc', backgroundColor: '#f0f0f0' }} />
                </div>
                <div className="info-panel" style={{ width: '300px', borderLeft: '1px solid #eee', paddingLeft: '20px', fontFamily: 'sans-serif', fontSize: '14px', height: '602px', overflowY: 'auto' }}>
                    <h4>当前帧详细信息</h4>
                    {processData ? (
                        <div>
                            <div style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                                <p style={{ margin: '4px 0', color: '#28a745', fontWeight: 'bold' }}>
                                    <strong>渲染帧率 (FPS):</strong> {fps.toFixed(1)}
                                </p>
                                {processData.info.map(item => (
                                    <p key={item.key} style={{ margin: '4px 0' }}>
                                        <strong>{item.key}:</strong> {item.value}
                                    </p>
                                ))}
                            </div>
                            <h5>实体数据:</h5>
                            {processData.entities.map((entity, index) => (
                                <div key={index} style={{ marginBottom: '15px' }}>
                                    <strong style={{ color: '#0056b3' }}>实体: {entity.name} (类型: {entity.type.type})</strong>
                                    <ul style={{ listStyleType: 'none', paddingLeft: '10px', margin: '5px 0' }}>
                                        {entity.type.type === 'circle' && (
                                            <>
                                                <li>中心点: [{entity.type.center.map(c => c.toFixed(2)).join(', ')}]</li>
                                                <li>半径: {entity.type.radius.toFixed(2)}</li>
                                            </>
                                        )}
                                        {entity.type.type === 'line' && (
                                            <>
                                                <li>起点: [{entity.type.start.map(c => c.toFixed(2)).join(', ')}]</li>
                                                <li>终点: [{entity.type.end.map(c => c.toFixed(2)).join(', ')}]</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>正在等待第一帧数据...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProcessAnimation;
