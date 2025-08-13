import React, { useEffect, useRef, useState } from 'react';

const DeploymentCanvas = ({ deploymentData, width, height }) => {
  const canvasRef = useRef(null);
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 用于存储缩放和平移信息
  const transformRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });

  // 绘制单个实体的辅助函数，增加一个 isHovered 参数来控制是否放大
  const drawSingleEntity = (ctx, entity, isHovered) => {
    const { scale } = transformRef.current;
    const hoverScaleFactor = 1.2; // 悬停时放大 20%

    ctx.save();
    
    const color = entity.type.color || [0, 0, 0];
    const opacity = entity.type.opacity !== undefined ? entity.type.opacity : 1;
    ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
    
    // 如果悬停，则线条也相应加粗
    const originalLineWidth = entity.type.width || 1;
    ctx.lineWidth = isHovered ? originalLineWidth * hoverScaleFactor : originalLineWidth;
    
    // 复制一份实体属性，避免修改原始数据
    const type = { ...entity.type };

    // 如果悬停，则修改尺寸属性
    if (isHovered) {
      if (type.type === 'circle' || type.type === 'fan') {
        type.radius = (type.radius || (type.type === 'fan' ? 10 : 0)) * hoverScaleFactor;
      } else if (type.type === 'line') {
        const { start, end } = type;
        const midX = (start[0] + end[0]) / 2;
        const midY = (start[1] + end[1]) / 2;
        // 以中点为中心进行缩放
        type.start = [midX + (start[0] - midX) * hoverScaleFactor, midY + (start[1] - midY) * hoverScaleFactor];
        type.end = [midX + (end[0] - midX) * hoverScaleFactor, midY + (end[1] - midY) * hoverScaleFactor];
      }
    }

    switch (type.type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(type.center[0], type.center[1], type.radius, 0, Math.PI * 2);
        if (type.fill) ctx.fill();
        else ctx.stroke();
        
        ctx.fillStyle = `rgba(255, 255, 255, 1)`;
        ctx.font = `${12 / scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(entity.name, type.center[0], type.center[1] - type.radius - (10 / scale));
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(type.start[0], type.start[1]);
        ctx.lineTo(type.end[0], type.end[1]);
        ctx.stroke();
        
        const midX = (type.start[0] + type.end[0]) / 2;
        const midY = (type.start[1] + type.end[1]) / 2;
        ctx.fillStyle = `rgba(255, 255, 255, 1)`;
        ctx.font = `${12 / scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(entity.name, midX, midY - (5 / scale));
        break;

      case 'fan':
        ctx.beginPath();
        ctx.moveTo(type.center[0], type.center[1]);
        ctx.arc(type.center[0], type.center[1], type.radius || 10, type.startAngle, type.endAngle);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, 1)`;
        ctx.font = `${12 / scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(entity.name, type.center[0], type.center[1] - type.radius - (10 / scale));
        break;

      default:
        break;
    }
    ctx.restore();
  };

  // 主绘制函数，现在负责协调绘制顺序
  const drawScene = (ctx) => {
    const { scale, offsetX, offsetY } = transformRef.current;
    const entities = deploymentData.entities || [];

    // 1. 清除整个画布
    ctx.clearRect(0, 0, width, height);
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // 2. 先绘制所有未被悬停的实体
    entities.forEach(entity => {
      if (!hoveredEntity || hoveredEntity.name !== entity.name) {
        drawSingleEntity(ctx, entity, false);
      }
    });

    // 3. 最后绘制被悬停的实体（如果存在），这样它会显示在最上层并被放大
    if (hoveredEntity) {
      drawSingleEntity(ctx, hoveredEntity, true);
    }
    
    ctx.restore();
  };
  
  // 绘制提示框的函数
  const drawTooltip = (ctx) => {
    if (!hoveredEntity) return;

    const tooltipWidth = 220;
    const tooltipHeight = 120;
    
    let tooltipX = mousePosition.x + 15;
    if (tooltipX + tooltipWidth > width) {
        tooltipX = mousePosition.x - tooltipWidth - 15;
    }

    let tooltipY = mousePosition.y + 15;
    if (tooltipY + tooltipHeight > height) {
        tooltipY = mousePosition.y - tooltipHeight - 15;
    }

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 8);
    } else {
      ctx.rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    }
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    ctx.fillText(`名称: ${hoveredEntity.name}`, tooltipX + 10, tooltipY + 10);
    
    let yOffset = 35;
    if (hoveredEntity.type.type === 'circle') {
      ctx.fillText(`类型: 圆形`, tooltipX + 10, tooltipY + yOffset);
      yOffset += 20;
      ctx.fillText(`中心: [${hoveredEntity.type.center[0].toFixed(2)}, ${hoveredEntity.type.center[1].toFixed(2)}]`, tooltipX + 10, tooltipY + yOffset);
      yOffset += 20;
      ctx.fillText(`半径: ${hoveredEntity.type.radius.toFixed(2)}`, tooltipX + 10, tooltipY + yOffset);
    } else if (hoveredEntity.type.type === 'line') {
      const { start, end } = hoveredEntity.type;
      const length = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
      ctx.fillText(`类型: 线段`, tooltipX + 10, tooltipY + yOffset);
      yOffset += 20;
      ctx.fillText(`起点: [${start[0].toFixed(2)}, ${start[1].toFixed(2)}]`, tooltipX + 10, tooltipY + yOffset);
      yOffset += 20;
      ctx.fillText(`终点: [${end[0].toFixed(2)}, ${end[1].toFixed(2)}]`, tooltipX + 10, tooltipY + yOffset);
      yOffset += 20;
      ctx.fillText(`长度: ${length.toFixed(2)}`, tooltipX + 10, tooltipY + yOffset);
    } else if (hoveredEntity.type.type === 'fan') {
       ctx.fillText(`类型: 扇形`, tooltipX + 10, tooltipY + yOffset);
       yOffset += 20;
       ctx.fillText(`中心: [${hoveredEntity.type.center[0].toFixed(2)}, ${hoveredEntity.type.center[1].toFixed(2)}]`, tooltipX + 10, tooltipY + yOffset);
       yOffset += 20;
       ctx.fillText(`半径: ${(hoveredEntity.type.radius || 10).toFixed(2)}`, tooltipX + 10, tooltipY + yOffset);
       yOffset += 20;
       ctx.fillText(`角度: ${(hoveredEntity.type.startAngle).toFixed(2)} rad 到 ${(hoveredEntity.type.endAngle).toFixed(2)} rad`, tooltipX + 10, tooltipY + yOffset);
    }
    
    ctx.restore();
  };

  // 初始化和数据变化时，计算缩放
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !deploymentData) return;
    const entities = deploymentData.entities || [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    entities.forEach(entity => {
      if (entity.type.type === 'circle' || entity.type.type === 'fan') {
        const [x, y] = entity.type.center || [0, 0];
        const radius = entity.type.radius || (entity.type.type === 'fan' ? 10 : 0);
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
    
    if (!isFinite(minX)) {
      minX = 0; minY = 0; maxX = width; maxY = height;
    }

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const scaleX = width / (contentWidth || 1);
    const scaleY = height / (contentHeight || 1);
    const scale = Math.min(scaleX, scaleY) * 0.9;
    const offsetX = (width - contentWidth * scale) / 2 - minX * scale;
    const offsetY = (height - contentHeight * scale) / 2 - minY * scale;

    transformRef.current = { scale, offsetX, offsetY };

  }, [deploymentData, width, height]);


  // 鼠标移动事件处理
  const handleMouseMove = (e) => {
    if (!deploymentData?.entities) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });

    const { scale, offsetX, offsetY } = transformRef.current;
    const scaledX = (x - offsetX) / scale;
    const scaledY = (y - offsetY) / scale;

    const hovered = [...deploymentData.entities].reverse().find(entity => {
      if (entity.type.type === 'circle') {
        const dx = scaledX - entity.type.center[0];
        const dy = scaledY - entity.type.center[1];
        return Math.sqrt(dx * dx + dy * dy) <= entity.type.radius;
      } else if (entity.type.type === 'line') {
        const { start, end, width: lineWidth = 1 } = entity.type;
        const lineLengthSq = Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2);
        if(lineLengthSq === 0) return false;
        
        const t = ((scaledX - start[0]) * (end[0] - start[0]) + (scaledY - start[1]) * (end[1] - start[1])) / lineLengthSq;
        const clampedT = Math.max(0, Math.min(1, t));
        const closestX = start[0] + clampedT * (end[0] - start[0]);
        const closestY = start[1] + clampedT * (end[1] - start[1]);
        const distance = Math.sqrt(Math.pow(scaledX - closestX, 2) + Math.pow(scaledY - closestY, 2));

        return distance < (5 / scale); // 5像素的容忍度
      } else if (entity.type.type === 'fan') {
        const radius = entity.type.radius || 10;
        const dx = scaledX - entity.type.center[0];
        const dy = scaledY - entity.type.center[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > radius) return false;
        
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += 2 * Math.PI;

        const { startAngle, endAngle } = entity.type;
        if (startAngle > endAngle) {
            return angle >= startAngle || angle <= endAngle;
        }
        return angle >= startAngle && angle <= endAngle;
      }
      return false;
    });

    if ((hovered && hovered.name) !== (hoveredEntity && hoveredEntity.name)) {
      setHoveredEntity(hovered || null);
    }
  };

  // 鼠标离开画布
  const handleMouseLeave = () => {
    setHoveredEntity(null);
  };

  // 当悬停实体或数据变化时，重绘画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !deploymentData) return;
    const ctx = canvas.getContext('2d');

    // 调用主绘制函数
    drawScene(ctx);
    
    // 绘制提示框（在所有实体之上）
    drawTooltip(ctx);

  }, [hoveredEntity, mousePosition, deploymentData, width, height]);


  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        cursor: hoveredEntity ? 'pointer' : 'default'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default DeploymentCanvas;