const colorList = [
    '#95cdf2',  '#a1e5a8',  '#fbd6a4',  '#fbb09e',  '#a9e2de',
    '#b3b4c2',  '#a2b1e6',  '#f3bb8c',  '#f4e5a1',  '#b8a7d8'
];

export const drawShapes = {
  rect(ctx, shop, gridSize) {
      const x = shop.x * gridSize;
      const y = shop.y * gridSize;
      const width = shop.width * gridSize;
      const height = shop.height * gridSize;

      if (!shop.color) {
          const randomIndex = Math.floor(Math.random() * colorList.length);
          shop.color = colorList[randomIndex];
      }

      ctx.fillStyle = shop.color; 
      ctx.fillRect(x, y, width, height);
      const rgbValues = shop.color.slice(1).match(/.{1,2}/g).map(val => parseInt(val, 16));
      ctx.strokeStyle = `rgb(${rgbValues[0]},${rgbValues[1]},${rgbValues[2]})`; 
      ctx.strokeRect(x, y, width, height);

      // 添加黑色边框
      ctx.strokeStyle = 'black';
      ctx.strokeRect(x, y, width, height);
  },
  pathMarker(ctx, point, gridSize) {
      ctx.fillStyle = 'rgba(118,218,145, 0.3)'; 
      ctx.fillRect(
          point.x * gridSize, 
          point.y * gridSize,
          gridSize,
          gridSize
      );

      // 添加黑色边框
      ctx.strokeStyle = 'black';
      ctx.strokeRect(point.x * gridSize, point.y * gridSize, gridSize, gridSize);
  },

  invertedHouse(ctx, shop, gridSize) {
      const x = shop.x * gridSize;
      const y = shop.y * gridSize;
      const width = shop.width * gridSize;
      const halfHeight = shop.height * gridSize / 2;

      // 绘制下半部分三角形
      ctx.fillStyle = '#f8cb7f'; 
      ctx.beginPath();
      ctx.moveTo(x, y + halfHeight);
      ctx.lineTo(x + width / 2, y + halfHeight * 2);
      ctx.lineTo(x + width, y + halfHeight);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgb(248,203,127)'; 
      ctx.stroke();

      // 绘制上半部分矩形
      ctx.fillRect(x, y, width, halfHeight);
      ctx.strokeRect(x, y, width, halfHeight);

      // 添加黑色边框
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width , y+ halfHeight );      
      ctx.lineTo(x + width / 2, y + halfHeight * 2);
      ctx.lineTo(x  , y+ halfHeight ); 

      ctx.closePath();
      ctx.stroke();
  },

  elevator(ctx, shop, gridSize) {
      const x = shop.x * gridSize;
      const y = shop.y * gridSize;
      const w = shop.width * gridSize;
      const h = shop.height * gridSize;
      ctx.fillStyle = '#f89588'; 
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgb(248,149,136)'; 
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      // 添加黑色边框
      ctx.strokeStyle = 'black';
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

      ctx.fillStyle = '#7cd6cf'; 
      ctx.fill();

      ctx.strokeStyle = 'rgb(124,214,207)'; 
      ctx.lineWidth = 1;
      ctx.stroke();

      // 添加黑色边框
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width / 2, y + height);
      ctx.closePath();
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

      ctx.fillStyle = '#9192ab'; 
      ctx.fill();

      ctx.strokeStyle = 'rgb(145,146,171)'; 
      ctx.lineWidth = 1;
      ctx.stroke();

      // 添加黑色边框
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + widthTop, y);
      ctx.lineTo(x + widthBottom, y + height);
      ctx.lineTo(x, y + height);
      ctx.closePath();
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
      ctx.lineTo(x - widthBottom / 3, y + height);
      ctx.closePath();

      ctx.fillStyle = '#7898e1'; 
      ctx.fill();

      ctx.strokeStyle = 'rgb(120,152,225)'; 
      ctx.lineWidth = 1;
      ctx.stroke();

      // 添加黑色边框
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + widthTop, y);
      ctx.lineTo(x + widthTop, y + height);
      ctx.lineTo(x - widthBottom / 3, y + height);
      ctx.closePath();
      ctx.stroke();
  }
};    