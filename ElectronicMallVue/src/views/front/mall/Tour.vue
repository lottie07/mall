<template>
  <div>
    <div class="floor-info">当前楼层: {{ currentFloor }}</div>
    <canvas 
      id="floorCanvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousemove="handleMouseMove"
      @click="handleClick"
    ></canvas>
    <div 
      id="infoBox"
      :style="infoBoxStyle"
    >{{ hoverInfo }}</div>
  </div>
</template>

<script>
import { CanvasRenderer } from './canvasRenderer';
import API from '@/utils/request';

export default {
  data() {
    return {
      canvasWidth: 1300,
      canvasHeight: 560,
      gridSize: 20,
      
      blockX: 0,
      blockY: 0,
      currentFloor: '一楼',
      
      allShops: [],
      firstFloorShops: [],
      secondFloorShops: [],
      firstFloorObstacles: [
        { x: 3, y: 11 },
        { x: 5, y: 13 }
      ],
      secondFloorObstacles: [
        { x: 4, y: 5 },
        { x: 9, y: 2 }
      ],
      pathStart: null,
      pathEnd: null,
      
      // UI状态
      hoverInfo: '',
      infoBoxVisible: false,
      treeImage: new Image(),
      mouseX: 0,
      mouseY: 0
    };
  },

  computed: {
    currentFloorShops() {
      return this.currentFloor === '一楼' 
        ? this.firstFloorShops 
        : this.secondFloorShops;
    },
    currentFloorObstacles() {
      return this.currentFloor === '一楼'
        ? this.firstFloorObstacles
        : this.secondFloorObstacles;
    },
    infoBoxStyle() {
      return {
        display: this.infoBoxVisible ? 'block' : 'none',
        left: this.mouseX + 'px',
        top: this.mouseY + 'px',
      }; 
    }
  },

  async created() {
    await this.fetchShops();
    this.treeImage.src = require('./Resources/tree.png');
  },

  mounted() {
    this.renderer = new CanvasRenderer(this, 'floorCanvas');
    this.renderer.init();
    this.canvas = document.getElementById('floorCanvas');
    this.infoBox = document.getElementById('infoBox');
    window.addEventListener('keydown', this.handleKeyPress);
    
  },

  beforeDestroy() {
    this.renderer.destroy();
    window.removeEventListener('keydown', this.handleKeyPress);
  },

  methods: {
    async fetchShops() {
      try {
        const { data } = await API.get('/api/shops');
        this.allShops = data.map(shop => ({
          x: shop.x || 0,
          y: shop.y || 0,
          width: shop.width || 1,
          height: shop.height || 1,
          floor: Number(shop.floor) || 1,
          shopName: shop.shopName || '123',
          shape: shop.shape || 'rect',
          info: shop.shopName || '未知店铺' 
        }));
        console.log('Fetched shops:', this.allShops); 

        this.sortShopsByFloor();
      } catch (error) {
        console.error('数据加载失败:', error);
      }
    },

    sortShopsByFloor() {
      this.firstFloorShops = this.allShops
        .filter(shop => shop.floor == 1)
        .map(shop => ({
          ...shop,
          shape: this.getShopShape(shop)
        }));
      
      this.secondFloorShops = this.allShops
        .filter(shop => shop.floor == 2)
        .map(shop => ({
          ...shop,
          shape: this.getShopShape(shop)
        }));
    },

    getShopShape(shop) {
      return shop.shape;
    },

    handleKeyPress(e) {
      const newPos = { x: this.blockX, y: this.blockY };
      switch(e.key) {
        case 'ArrowUp': newPos.y--; break;
        case 'ArrowDown': newPos.y++; break;
        case 'ArrowLeft': newPos.x--; break;
        case 'ArrowRight': newPos.x++; break;
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
              this.renderer.loadSecondFloor();
            } else if (this.currentFloor === '二楼') {
              this.renderer.loadFirstFloor();
            }
          }
          break;
      }

      if (this.isValidPosition(newPos)) {
        this.blockX = newPos.x;
        this.blockY = newPos.y;
      }

      // 新增空格键自动寻路
      if (e.key === ' ') {
        const start = { x: this.blockX, y: this.blockY };
        const end = this.pathEnd;
        if (end) {
          const path = this.renderer.pathfinder.findPath(start, end);
          if (path) {
            this.followPath(path);
          }
        }
      }
    },

    isValidPosition(pos) {
      return !this.currentFloorObstacles.some(
        o => o.x === pos.x && o.y === pos.y
      );
    },

    handleMouseMove  (event) {
      const rect = this.canvas.getBoundingClientRect();
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
        this.infoBox.style.left = event.clientX + 'px';
        this.infoBox.style.top = event.clientY + 'px';
        // 使用 info 字段显示店铺名称
        this.infoBox.textContent = shop.info; 
      }
    },

    handleClick(event) {
      const rect = this.$el.getBoundingClientRect();
      const gridX = Math.floor((event.clientX - rect.left) / this.gridSize);
      const gridY = Math.floor((event.clientY - rect.top) / this.gridSize);

      if (event.shiftKey) { // 按住Shift点击设置起点
        this.pathStart = { x: gridX, y: gridY -2};
        console.log('设置起点:', this.pathStart);
        this.renderer.drawColoredGrid(this.pathStart.x, this.pathStart.y, 'blue');
      } else if (event.ctrlKey) { // 按住Ctrl点击设置终点
        this.pathEnd = { x: gridX, y: gridY };
        console.log('设置终点:', this.pathEnd.y);
        this.renderer.drawColoredGrid(this.pathEnd.x, this.pathEnd.y, 'red');
      }
      
      if (this.pathStart && this.pathEnd) {
        this.renderer.updatePath(this.pathStart, this.pathEnd);
      }

      if (this.hoverInfo) {
        alert(this.hoverInfo);
      }
    },

    followPath(path) {
      let currentStep = 0;
      const moveInterval = setInterval(() => {
        if (currentStep >= path.length) {
          clearInterval(moveInterval);
          return;
        }
        
        const next = path[currentStep];
        if (this.isValidPosition(next)) {
          this.blockX = next.x;
          this.blockY = next.y;
          currentStep++;
        } else {
          clearInterval(moveInterval); // 路径被阻断
        }
      }, 300); // 每300ms移动一步
    }
  }
};
</script>

<style scoped>
.floor-info {
  text-align: center;
  font-size: 18px;
  margin: 10px 0;
}

canvas {
  border: 1px solid #ccc;
  background: #fff;
}

#infoBox {
  position: fixed;
  background: rgba(255,255,255,0.9);
  border: 1px solid #333;
  padding: 8px;
  pointer-events: none;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
}
</style>    