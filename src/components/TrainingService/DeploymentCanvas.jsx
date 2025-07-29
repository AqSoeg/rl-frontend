import React, { useEffect, useRef } from 'react';

const DeploymentCanvas = ({ deploymentData, width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !deploymentData) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Calculate scaling and offset to center the image and fit the canvas
    const entities = deploymentData.entities || [];
    
    // Calculate bounds of all entities
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

    // If all coordinates are infinite, set default bounds
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      minX = 0;
      minY = 0;
      maxX = width;
      maxY = height;
    }

    // Calculate content dimensions
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Calculate scaling factor
    const scaleX = width / (contentWidth || 1);
    const scaleY = height / (contentHeight || 1);
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% scaling to leave margin

    // Calculate offset to center the content
    const offsetX = (width - contentWidth * scale) / 2 - minX * scale;
    const offsetY = (height - contentHeight * scale) / 2 - minY * scale;

    // Draw all entities
    entities.forEach(entity => {
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      const color = entity.type.color || [0, 0, 0];
      const opacity = entity.type.opacity !== undefined ? entity.type.opacity : 1;
      ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
      ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
      ctx.lineWidth = entity.type.width || 1;

      switch (entity.type.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(
            entity.type.center[0],
            entity.type.center[1],
            entity.type.radius,
            0,
            Math.PI * 2
          );
          if (entity.type.fill) {
            ctx.fill();
          } else {
            ctx.stroke();
          }
          // Draw entity name near the circle center
          ctx.fillStyle = `rgba(255, 255, 255, 1)`; // Black color for text
          ctx.font = `${12 / scale}px Arial`; // Adjust font size based on scale
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(entity.name, entity.type.center[0], entity.type.center[1] - entity.type.radius - (10 / scale)); // Position above the circle
          break;

        case 'line':
          ctx.beginPath();
          ctx.moveTo(entity.type.start[0], entity.type.start[1]);
          ctx.lineTo(entity.type.end[0], entity.type.end[1]);
          ctx.stroke();
          // Draw entity name near the middle of the line
          const midX = (entity.type.start[0] + entity.type.end[0]) / 2;
          const midY = (entity.type.start[1] + entity.type.end[1]) / 2;
          ctx.fillStyle = `rgba(255, 255, 255, 1)`; // Black color for text
          ctx.font = `${12 / scale}px Arial`; // Adjust font size based on scale
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(entity.name, midX, midY - (5 / scale)); // Position above the line
          break;

        case 'fan':
          ctx.beginPath();
          ctx.moveTo(entity.type.center[0], entity.type.center[1]);
          ctx.arc(
            entity.type.center[0],
            entity.type.center[1],
            entity.type.radius || 10, // Use entity's radius or default to 10
            entity.type.startAngle,
            entity.type.endAngle
          );
          ctx.closePath();
          ctx.fill();
          // Draw entity name near the fan center
          ctx.fillStyle = `rgba(255, 255, 255, 1)`; // Black color for text
          ctx.font = `${12 / scale}px Arial`; // Adjust font size based on scale
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(entity.name, entity.type.center[0], entity.type.center[1] - (20 / scale)); // Position above the fan
          break;

        default:
          break;
      }

      ctx.restore();
    });

  }, [deploymentData, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain'
      }}
    />
  );
};

export default DeploymentCanvas;
