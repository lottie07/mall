<template>
  <div class="tour-container">
    <div class="canvas-header" :style="{ width: canvasWidth + 'px' }">
      <div class="floor-info">当前楼层: {{ currentFloor }}</div>
      <div class="map-controls">
        <el-button 
          class="import-btn"
          type="primary" 
          @click="showImportDialog = true">
          导入
        </el-button>
      </div>
    </div>
  

    <div class="floor-info-container">
      <canvas 
        id="floorCanvas"
        :width="canvasWidth"
        :height="canvasHeight"
        @mousemove="handleMouseMove"
        @click="handleClick"
      ></canvas>
      
      <el-dialog 
        title="地图数据导入"
        :visible.sync="showImportDialog"
        width="30%"
        @close="showImportDialog = false"
      >
        <el-upload
          class="upload-demo"
          action="/api/map/import"
          :show-file-list="false"
        >
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">
            支持JSON格式地图数据文件，最大50MB
          </div>
        </el-upload>
        
        <div class="import-options">
          <el-input
            placeholder="或输入数据API地址"
            style="margin-top: 15px;"
          >
            <el-button 
              slot="append" 
              icon="el-icon-link"
            ></el-button>
          </el-input>
        </div>
      </el-dialog>

      <div 
        id="infoBox"
        :style="infoBoxStyle"
      >{{ hoverInfo }}</div>
    </div>
  </div>
</template>

<script>
import { CanvasRenderer } from './canvasRenderer';
import API from '@/utils/request';

export default {
  data() {
    return {
      showImportDialog: false,
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
    this.pathStart = { x: this.blockX, y: this.blockY };
    
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
          info: shop.shopName || '未知店铺' ,
          centerX: shop.x + shop.width/2,
          centerY: shop.y + shop.height/2
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
        this.pathStart = { x: this.blockX, y: this.blockY };
        this.renderer.drawColoredGrid(this.pathStart.x, this.pathStart.y, 'blue');
        if (this.pathEnd) {
          this.renderer.updatePath(this.pathStart, this.pathEnd);
        }
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
      const gridX = Math.floor((event.clientX - rect.left) / this.gridSize)-2;
      const gridY = Math.floor((event.clientY - rect.top) / this.gridSize)-2;
      if (event.ctrlKey) { 
        this.pathEnd = { x: gridX, y: gridY };
        console.log('设置终点:', this.pathEnd);
        this.renderer.drawColoredGrid(this.pathEnd.x, this.pathEnd.y, 'blue');
        this.renderer.updatePath(this.pathStart, this.pathEnd);
      }

      if (event.shiftKey) { 
        this.pathEnd = { x: gridX, y: gridY };
        console.log('A*算法终点:', this.pathEnd);
        this.renderer.updateAstarPath(this.pathStart, this.pathEnd);
          
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
.tour-container {
  display: flex;
  flex-direction: column;
  align-items: center; 
  align-items: center;
  margin-top: 10px;
}
.canvas-header {
  position: relative;
  height: 40px; /* 根据实际情况调整 */
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.floor-info {
  text-align: center;
  font-size: 18px;
  margin: 10px 0;
  color: #333;
}
.map-controls {
  margin-left: auto; /* 将按钮推到右侧 */
}
canvas {
  border: 1px solid #ccc;
  background: #f5f5f5; /* 更改地图背景颜色 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

#infoBox {
  position: fixed;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #333;
  padding: 8px;
  pointer-events: none;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  color: #333; /* 更改信息框文字颜色 */
}
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.floor-info {
  margin-right: 10px; /* 可根据需要调整间距 */
}
.map-controls {
  display: flex;
  align-items: center;
}
.import-btn {
  margin-left: 10px; /* 可根据需要调整按钮与楼层信息的间距 */
}
</style>./canvasRenderer/Astar.js