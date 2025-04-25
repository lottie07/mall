export const drawShapes = {
  // 保持原有的 rect、pathMarker、invertedHouse、elevator、triangle 方法不变
  rect(ctx, shop, gridSize) {
    const x = shop.x * gridSize;
    const y = shop.y * gridSize;
    const width = shop.width * gridSize;
    const height = shop.height * gridSize;
    
    ctx.fillStyle = '#999';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x, y, width, height);
  },
  pathMarker(ctx, point, gridSize) {
    ctx.fillStyle = 'rgba(0,255,0,0.3)';
    ctx.fillRect(
      point.x * gridSize, 
      point.y * gridSize,
      gridSize,
      gridSize
    );
  },

  invertedHouse(ctx, shop, gridSize) {
    const x = shop.x * gridSize;
    const y = shop.y * gridSize;
    const width = shop.width * gridSize;
    const halfHeight = shop.height * gridSize / 2;

    // 绘制下半部分三角形
    ctx.fillStyle = '#999';
    ctx.beginPath();
    ctx.moveTo(x, y + halfHeight);
    ctx.lineTo(x + width/2, y + halfHeight*2);
    ctx.lineTo(x + width, y + halfHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 绘制上半部分矩形
    ctx.fillRect(x, y, width, halfHeight);
    ctx.strokeRect(x, y, width, halfHeight);
  },

  elevator(ctx, shop, gridSize) {
    const x = shop.x * gridSize;
    const y = shop.y * gridSize;
    const w = shop.width * gridSize;
    const h = shop.height * gridSize;
    ctx.fillStyle = '#0099ff';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  },
  triangle(ctx, shop, gridSize) {
    const x = shop.x * gridSize;
    const y = shop.y * gridSize;
    const width = shop.width * gridSize;
    const height = shop.height * gridSize;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width / 2, y + height);
    ctx.closePath();

    ctx.fillStyle = '#999'; 
    ctx.fill();

    ctx.strokeStyle = 'black'; 
    ctx.lineWidth = 1;
    ctx.stroke();
  },
  trapezoid(ctx, shop, gridSize) {
    const x = shop.x * gridSize;
    const y = shop.y * gridSize;
    const widthTop = shop.width * gridSize;
    const widthBottom = (shop.width + 2) * gridSize;  
    const height = shop.height * gridSize;

    ctx.beginPath();
    ctx.moveTo(x, y); 
    ctx.lineTo(x + widthTop, y); 
    ctx.lineTo(x + widthBottom, y + height); 
    ctx.lineTo(x, y + height); 
    ctx.closePath();

    ctx.fillStyle = '#999'; 
    ctx.fill();

    ctx.strokeStyle = 'black'; 
    ctx.lineWidth = 1;
    ctx.stroke();
  },
  rightTrapezoid(ctx, shop, gridSize) {
    const x = shop.x * gridSize;
    const y = shop.y * gridSize;
    const widthTop = shop.width * gridSize;
    const widthBottom = (shop.width + 2) * gridSize;
    const height = shop.height * gridSize;

    ctx.beginPath();
    // 左上角顶点
    ctx.moveTo(x, y);
    // 右上角顶点
    ctx.lineTo(x + widthTop, y);
    // 右下角顶点
    ctx.lineTo(x + widthTop, y + height);
    // 左下角顶点
    ctx.lineTo(x - widthBottom/3 , y + height);
    ctx.closePath();

    ctx.fillStyle = '#999';
    ctx.fill();

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};  