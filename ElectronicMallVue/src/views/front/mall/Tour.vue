<template>
  <div>
    <div class="floor-info">当前楼层: {{ currentFloor }}</div>
    <div>
      <canvas id="Floor1" :width="canvasWidth" :height="canvasHeight"></canvas>
      <div
        id="infoBox"
        :style="{
          position: 'absolute',
          display: infoBoxVisible? 'block' : 'none',
          backgroundColor: 'white',
          border: '1px solid black',
          padding: '5px'
        }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      canvasWidth: 1300,
      canvasHeight: 560,
      infoBoxVisible: false,
      gridSize: 20,
      blockX: 0,
      blockY: 0,
      currentFloor: '一楼',
      currentFloorShops: [],
      currentFloorObstacles: [],
      // 一楼楼层地图数据
      firstFloorShops: [
        { x: 2, y: 0, width: 9, height: 5, info: '优衣库', shape: 'rect' },
        { x: 2, y: 5, width: 3, height: 4, info: '店铺1', shape: 'invertedHouse' },
        { x: 5, y: 5, width: 3, height: 4, info: '店铺2', shape: 'invertedHouse' },
        { x: 8, y: 5, width: 3, height: 4, info: '店铺3', shape: 'invertedHouse' },
        { x: 3, y: 11, width: 3, height: 3, info: '店铺', shape: 'rect' },
        { x: 6, y: 12, width: 3, height: 2, info: '店铺', shape: 'rect' },
        { x: 10, y: 10, width: 2, height: 2, info: '电梯', shape: 'elevator' }
      ],
      firstFloorObstacles: [
        { x: 3, y: 11 },
        { x: 5, y: 13 }
      ],
      // 二楼楼层地图数据
      secondFloorShops: [
        { x: 3, y: 2, width: 5, height: 4, info: '2f 店铺1', shape: 'rect' },
        { x: 7, y: 3, width: 4, height: 3, info: '2f 店铺2', shape: 'invertedHouse' },
        { x: 12, y: 1, width: 2, height: 2, info: '2f 电梯', shape: 'elevator' }
      ],
      secondFloorObstacles: [
        { x: 4, y: 5 },
        { x: 9, y: 2 }
      ],
      treeImage: new Image()
    };
  },
  mounted() {
    this.currentFloorShops = this.firstFloorShops;
    this.currentFloorObstacles = this.firstFloorObstacles;

    const canvas = document.getElementById('Floor1');
    const ctx = canvas.getContext('2d');
    const infoBox = document.getElementById('infoBox');

    this.treeImage.src = require('./Resources/tree.png');
    this.treeImage.onerror = () => {
      console.error('树的图片加载失败');
    };

    const rows = this.canvasHeight / this.gridSize;
    const cols = this.canvasWidth / this.gridSize;

    const drawGrid = () => {
      ctx.strokeStyle = 'gray';
      ctx.lineWidth = 1;

      for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * this.gridSize);
        ctx.lineTo(this.canvasWidth, i * this.gridSize);
        ctx.stroke();
      }

      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * this.gridSize, 0);
        ctx.lineTo(i * this.gridSize, this.canvasHeight);
        ctx.stroke();
      }
    };

    const drawGameElements = () => {
      const x = this.blockX * this.gridSize;
      const y = this.blockY * this.gridSize;
      ctx.fillStyle ='red';
      ctx.fillRect(x, y, this.gridSize, this.gridSize);
    };

    const drawShops = () => {
      if (!this.currentFloorShops) return;
      
      this.currentFloorShops.forEach(shop => {
        const x = shop.x * this.gridSize;
        const y = shop.y * this.gridSize;
        ctx.fillStyle = '#999999';
        if (shop.shape ==='rect') {
          const w = shop.width * this.gridSize;
          const h = shop.height * this.gridSize;
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, w, h);
        } else if (shop.shape === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(x + this.gridSize / 2, y);
          ctx.lineTo(x, y + this.gridSize);
          ctx.lineTo(x + this.gridSize, y + this.gridSize);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (shop.shape === 'trapezoid') {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + shop.width * this.gridSize, y);
          ctx.lineTo(x + (shop.width * this.gridSize - this.gridSize / 2), y + shop.height * this.gridSize);
          ctx.lineTo(x + this.gridSize / 2, y + shop.height * this.gridSize);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (shop.shape === 'invertedHouse') {
          const houseWidth = shop.width * this.gridSize;
          const houseHeight = shop.height * this.gridSize;
          ctx.fillRect(x, y, houseWidth, houseHeight / 2);
          ctx.beginPath();
          ctx.moveTo(x, y + houseHeight / 2);
          ctx.lineTo(x + houseWidth / 2, y + houseHeight);
          ctx.lineTo(x + houseWidth, y + houseHeight / 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + houseWidth, y);
          ctx.lineTo(x + houseWidth, y + houseHeight / 2);
          ctx.lineTo(x + houseWidth / 2, y + houseHeight);
          ctx.lineTo(x, y + houseHeight / 2);
          ctx.closePath();
          ctx.stroke();
        } else if (shop.shape === 'elevator') {
          const w = shop.width * this.gridSize;
          const h = shop.height * this.gridSize;
          ctx.fillStyle = '#0099ff';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, w, h);
        }
      });
    };

    const drawObstacles = () => {
      if (!this.currentFloorObstacles) return;
      
      this.currentFloorObstacles.forEach(obstacle => {
        const x = obstacle.x * this.gridSize;
        const y = obstacle.y * this.gridSize;
        if (this.treeImage.complete) {
          ctx.drawImage(this.treeImage, x, y, this.gridSize, this.gridSize);
        } else {
          this.treeImage.onload = () => {
            ctx.drawImage(this.treeImage, x, y, this.gridSize, this.gridSize);
          };
        }
      });
    };

    const isCollision = (x, y) => {
      if (!this.currentFloorObstacles) return false;
      
      return this.currentFloorObstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
    };

    const handleKeyPress = (event) => {
      let newX = this.blockX;
      let newY = this.blockY;

      switch (event.key) {
        case 'ArrowUp':
          newY--;
          break;
        case 'ArrowDown':
          newY++;
          break;
        case 'ArrowLeft':
          newX--;
          break;
        case 'ArrowRight':
          newX++;
          break;
        case 'Enter':
          if (!this.currentFloorShops) return;
          
          const elevator = this.currentFloorShops.find(s => s.shape === 'elevator');
          if (elevator && 
              this.blockX >= elevator.x &&
              this.blockX < elevator.x + elevator.width &&
              this.blockY >= elevator.y &&
              this.blockY < elevator.y + elevator.height
          ) {
            if (this.currentFloor === '一楼') {
              loadSecondFloor();
            } else if (this.currentFloor === '二楼') {
              loadFirstFloor();
            }
          }
          break;
      }

      if (newX >= 0 && newX < cols && newY >= 0 && newY < rows &&!isCollision(newX, newY)) {
        this.blockX = newX;
        this.blockY = newY;
      }
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const col = Math.floor(mouseX / this.gridSize);
      const row = Math.floor(mouseY / this.gridSize);

      if (!this.currentFloorShops) {
        this.infoBoxVisible = false;
        return;
      }
      
      const shop = this.currentFloorShops.find(s => {
        if (s.shape === 'elevator') {
          return (
            col >= s.x &&
            col < s.x + s.width &&
            row >= s.y &&
            row < s.y + s.height
          );
        } else {
          return (
            col >= s.x &&
            col < s.x + s.width &&
            row >= s.y &&
            row < s.y + s.height
          );
        }
      });
      this.infoBoxVisible = !!shop;
      if (shop) {
        infoBox.style.left = event.clientX + 'px';
        infoBox.style.top = event.clientY + 'px';
        infoBox.textContent = shop.info;
      }
    };

    const handleMouseClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const col = Math.floor(mouseX / this.gridSize);
      const row = Math.floor(mouseY / this.gridSize);

      if (!this.currentFloorShops) return;
      
      const shop = this.currentFloorShops.find(s => {
        if (s.shape === 'elevator') {
          return (
            col >= s.x &&
            col < s.x + s.width &&
            row >= s.y &&
            row < s.y + s.height
          );
        } else {
          return (
            col >= s.x &&
            col < s.x + s.width &&
            row >= s.y &&
            row < s.y + s.height
          );
        }
      });
      if (shop) {
        alert(shop.info);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      drawGrid();
      drawShops();
      drawObstacles();
      drawGameElements();
      requestAnimationFrame(draw);
    };

    const loadSecondFloor = () => {
      this.currentFloorShops = this.secondFloorShops;
      this.currentFloorObstacles = this.secondFloorObstacles;
      this.blockX = 0;
      this.blockY = 0;
      this.currentFloor = '二楼';
      draw();
    };

    const loadFirstFloor = () => {
      this.currentFloorShops = this.firstFloorShops;
      this.currentFloorObstacles = this.firstFloorObstacles;
      this.blockX = 0;
      this.blockY = 0;
      this.currentFloor = '一楼';
      draw();
    };

    window.addEventListener('keydown', handleKeyPress);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);

    draw();

    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('keydown', handleKeyPress);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleMouseClick);
    });
  }
};
</script>

<style scoped>
canvas {
  border: 1px solid black;
  display: block;
  margin: 0 auto;
}

.floor-info {
  text-align: center;
  font-size: 18px;
  margin-bottom: 10px;
}
</style>