import { drawShapes } from './shapes';
import { handleCollision } from './utils';
import { AStarPathfinder } from './pathfinder';

export class CanvasRenderer {
  constructor(vm, canvasId) {
    this.vm = vm;
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.animationFrame = null;
    this.pathfinder = new AStarPathfinder(
      Math.floor(vm.canvasWidth / vm.gridSize),
      Math.floor(vm.canvasHeight / vm.gridSize)
    );
    this.currentPath = [];
  }

  init() {
    this.drawGrid();
    this.drawAllElements(); 
  }
  updatePath(start, end) {
    this.pathfinder.setObstacles(this.vm.currentFloorObstacles);
    this.currentPath = this.pathfinder.findPath(start, end) || [];
  }

  drawPath() {
    if (this.currentPath.length === 0) return;

    const { ctx, vm: { gridSize } } = this;
    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;

    this.currentPath.forEach((point, index) => {
      const x = (point.x + 0.5) * gridSize;
      const y = (point.y + 0.5) * gridSize;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // 绘制路径点
    ctx.fillStyle = '#00ff00';
    this.currentPath.forEach(point => {
      ctx.beginPath();
      ctx.arc(
        (point.x + 0.5) * gridSize,
        (point.y + 0.5) * gridSize,
        3, 0, Math.PI * 2
      );
      ctx.fill();
    });
  }
  drawColoredGrid(x, y, color) {
    const gridSize = this.vm.gridSize;
    const startX = x * gridSize;
    const startY = y * gridSize;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(startX, startY, gridSize, gridSize);
  }

  drawGrid() {
    const { ctx, vm: { gridSize, canvasWidth, canvasHeight } } = this;
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 1;

    // 绘制横向网格线
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // 绘制纵向网格线
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
  }

  loadSecondFloor () {
    this.vm.currentFloor = '二楼';
    this.vm.blockX = 0;
    this.vm.blockY = 0;
    this.vm.pathEnd = null;
    this.currentPath = [];
    this.drawAllElements();
  };

  loadFirstFloor () {
    this.vm.currentFloor = '一楼';
    this.vm.blockX = 0;
    this.vm.blockY = 0;
    this.vm.pathEnd = null;
    this.currentPath = [];
    this.drawAllElements();
  };

  drawAllElements() {
    const { ctx, vm } = this;
    ctx.clearRect(0, 0, vm.canvasWidth, vm.canvasHeight);
    
    this.drawGrid();
    this.drawShops();
    this.drawObstacles();
    this.drawPlayer();
    this.drawPath();

    if (vm.pathStart) {
      this.drawColoredGrid(vm.pathStart.x, vm.pathStart.y, 'blue');
    }
    if (vm.pathEnd) {
      this.drawColoredGrid(vm.pathEnd.x, vm.pathEnd.y, 'red');
    }
    
    this.animationFrame = requestAnimationFrame(() => this.drawAllElements());
  }

  drawShops() {
    const { currentFloorShops: shops, gridSize } = this.vm;
    shops.forEach(shop => drawShapes[shop.shape](this.ctx, shop, gridSize));
  }

  drawObstacles() {
    const { currentFloorObstacles: obstacles, gridSize, treeImage } = this.vm;
    obstacles.forEach(obs => {
      if (treeImage.complete) {
        this.ctx.drawImage(treeImage, obs.x * gridSize, obs.y * gridSize, gridSize, gridSize);
      }
    });
  }

  drawPlayer() {
    const { ctx, vm: { blockX, blockY, gridSize } } = this;
    ctx.fillStyle = 'red';
    ctx.fillRect(blockX * gridSize, blockY * gridSize, gridSize, gridSize);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
  }
}