import { drawShapes } from './shapes';
import { handleCollision } from './utils';
import { GraphNetwork } from './pathfinder';
import { aStar } from './Astar';

export class CanvasRenderer {
  constructor(vm, canvasId) {
    this.vm = vm;
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.animationFrame = null;
    this.currentPath = [];
    this.network = new GraphNetwork(); 

    this.gridSize = vm.gridSize;
    this.gridWidth = Math.floor(vm.canvasWidth / this.gridSize);
    this.gridHeight = Math.floor(vm.canvasHeight / this.gridSize);

    this.pathfinder = new aStar(
      Math.floor(vm.canvasWidth / vm.gridSize),
      Math.floor(vm.canvasHeight / vm.gridSize)
    );
  }

  async init() {    
    this.drawGrid();
    this.drawAllElements(); 
    await this.vm.fetchShops();
    this._buildShopNetwork();
  }
  updateAstarPath(start, end) {
    this.pathfinder.setObstacles(this.vm.currentFloorObstacles);
    this.currentPath = this.pathfinder.findPath(start, end) || [];
  }
  _buildShopNetwork() {
    console.log('this.vm.currentFloorShops:', this.vm.currentFloorShops);
    const shopPoints = this.vm.currentFloorShops.map(shop => ({
      centerX: Math.floor(shop.x + shop.width/2),
      centerY: Math.floor(shop.y + shop.height/2)
    }));
    
    this.network.buildNetwork(shopPoints, 8); 
  }
  updatePath(start, end) {  
    this.currentPath = [];

    const gridStart = {
      x: Math.floor(start.x),
      y: Math.floor(start.y)
    };
    const gridEnd = {
      x: Math.floor(end.x),
      y: Math.floor(end.y)
    };

    const startNode = this._findNearestNetworkNode(gridStart);
    const endNode = this._findNearestNetworkNode(gridEnd);
    
    if (!startNode || !endNode) {
      this.currentPath = [];
      return;
    }
    if (!this.network.validate()) {
      console.error("网络结构验证失败");
      return;
    }

    const nodePath = this._findNodePath(startNode, endNode);
    if (!nodePath || nodePath.length === 0) {
      console.log("11")      
      this.currentPath = [];
      return;
    }

    // 拼接实际路径
    this.currentPath = this._resolveActualPath(nodePath);
    console.log("currentPath",this.currentPath)
  }
  

  _findNearestNetworkNode(point) {
    if (this.network.nodes.size === 0) return null;

    let minDistance = Infinity;
    let nearestNode = null;

    this.network.nodes.forEach(node => {
      const dx = node.x - point.x;
      const dy = node.y - point.y;
      const distance = dx*dx + dy*dy;
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = node;
      }
    });

    return nearestNode;
  }
  
_findNodePath(startNode, endNode) {
  const startKey = this.network._nodeKey(startNode);
  const endKey = this.network._nodeKey(endNode);
  console.log(`[路径查找] 起始节点: ${startKey} -> 目标节点: ${endKey}`);

  const distances = new Map();
  const prev = new Map();
  const pq = new PriorityQueue((a, b) => a.distance < b.distance);

  // 初始化节点数据
  this.network.nodes.forEach((_, key) => {
      distances.set(key, Infinity);
      prev.set(key, null);
  });

  distances.set(startKey, 0);
  pq.enqueue({ key: startKey, distance: 0 });

  let found = false;
  while (!pq.isEmpty()) {
      const current = pq.dequeue();
      console.log(`[处理节点] ${current.key} (当前距离: ${current.distance})`);
      if (current.key === endKey) {
          found = true;
          break;
      }
      // 获取有效邻接节点
      const neighbors = this.network.adjacencyList.get(current.key) || [];
      console.log(`[邻接节点] ${current.key} 的邻居:`, neighbors.map(n => n.node));

      neighbors.forEach(neighbor => {
          const tentativeDistance = current.distance + neighbor.distance;
          const currentDistance = distances.get(neighbor.node) || Infinity;

          console.log(`[距离计算] ${current.key} -> ${neighbor.node}: 
              暂定 ${tentativeDistance} vs 当前 ${currentDistance}`);

          if (tentativeDistance < currentDistance) {
              console.log(`[更新节点] ${neighbor.node} 新距离: ${tentativeDistance}`);
              
              // 更新距离和前驱节点
              distances.set(neighbor.node, tentativeDistance);
              prev.set(neighbor.node, current.key);

              // 优化入队逻辑：先删除旧值再插入新值
              pq.enqueue({
                  key: neighbor.node,
                  distance: tentativeDistance
              });
          }
      });
  }


  const path = [];
    let currentKey = endKey;
    let safetyCounter = 0;

    // 新增前驱节点有效性验证
    if (!prev.has(endKey)) {
        console.error(`终点 ${endKey} 不可达`);
        return [];
    }

    while (currentKey && safetyCounter < 1000) {
        safetyCounter++;

        // 验证节点存在性
        if (!this.network.nodes.has(currentKey)) {
            console.error(`无效节点 ${currentKey} 存在于路径中`);
            return [];
        }

        path.unshift(this.network.nodes.get(currentKey));
        currentKey = prev.get(currentKey);
    }

    // 验证路径完整性
    if (path.length === 0 ||
        path[0].x !== startNode.x || path[0].y !== startNode.y ||
        path[path.length - 1].x !== endNode.x || path[path.length - 1].y !== endNode.y
    ) {
        console.error("路径不连贯，起始/终点不匹配");
        console.error("实际路径起点:", path[0]?.x, path[0]?.y);
        console.error("预期路径起点:", startNode.x, startNode.y);
        return [];
    }

    // 返回反转后的正确路径
    return path.reverse();
}

// 新增调试方法
_debugPrintPath(prev, startKey, endKey) {
  console.groupCollapsed("[调试] 前驱节点映射");
  let current = endKey;
  const path = [];
  while (current) {
      path.unshift(current);
      current = prev.get(current);
      if (path.includes(current)) {
          console.log("发现循环:", current);
          break;
      }
  }
  console.log("重构尝试路径:", path);
  console.groupEnd();
}


  _resolveActualPath(nodePath) {
    if (!nodePath || nodePath.length < 2) return [];
    
    const fullPath = [];
    try {
      for (let i = 0; i < nodePath.length - 1; i++) {
        const edgeKey = this.network._edgeKey(nodePath[i], nodePath[i+1]);
        const edge = this.network.edges.get(edgeKey);
        
        if (edge && edge.path) {
          fullPath.push(...edge.path);
        }
      }
    } catch (e) {
      console.error('路径解析错误:', e);
      return [];
    }
    return fullPath;
  }

  // 修改后的楼层切换方法
  loadSecondFloor() {
    this.vm.currentFloor = '二楼';
    this.vm.blockX = 0;
    this.vm.blockY = 0;
    this.vm.pathEnd = null;
    this.currentPath = [];
    this._buildShopNetwork(); 
    this.drawAllElements();
  }


  drawPath() {
    if (this.currentPath.length === 0) return;
  
    const { ctx, vm: { gridSize, pathStart, pathEnd } } = this;
    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
  
    // 绘制起点到临近节点的连线
    if (pathStart) {
      const startNode = this._findNearestNetworkNode(pathStart);
      if (startNode) {
        const startX = (pathStart.x + 0.5) * gridSize;
        const startY = (pathStart.y + 0.5) * gridSize;
        const nodeX = (startNode.x + 0.5) * gridSize;
        const nodeY = (startNode.y + 0.5) * gridSize;
        ctx.moveTo(startX, startY);
        ctx.lineTo(nodeX, nodeY);
      }
    }

    // 绘制路径
    this.currentPath.forEach((point, index) => {
      const x = (point.x + 0.5) * gridSize;
      const y = (point.y + 0.5) * gridSize;
      index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    // 绘制终点到临近节点的连线
    if (pathEnd) {
      const endNode = this._findNearestNetworkNode(pathEnd);
      if (endNode) {
        const endX = (pathEnd.x + 0.5) * gridSize;
        const endY = (pathEnd.y + 0.5) * gridSize;
        const nodeX = (endNode.x + 0.5) * gridSize;
        const nodeY = (endNode.y + 0.5) * gridSize;
        ctx.moveTo(endX, endY);
        ctx.lineTo(nodeX, nodeY);
      }
    }

    ctx.stroke();
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

  

  loadFirstFloor () {
    this.vm.currentFloor = '一楼';
    this.vm.blockX = 0;
    this.vm.blockY = 0;
    this.vm.pathEnd = null;
    this.currentPath = [];
    this._buildShopNetwork(); 
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
    //this.drawNetwork();

    if (vm.pathStart) {
      this.drawColoredGrid(vm.pathStart.x, vm.pathStart.y, 'blue');
    }
    if (vm.pathEnd) {
      this.drawColoredGrid(vm.pathEnd.x, vm.pathEnd.y, 'red');
    }
    
    this.animationFrame = requestAnimationFrame(() => this.drawAllElements());
  }

  // 在CanvasRenderer类中修改drawShops方法
drawShops() {
  const { currentFloorShops: shops, gridSize } = this.vm;
  const { ctx } = this;
  
  shops.forEach(shop => {
    drawShapes[shop.shape](ctx, shop, gridSize);
    
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.round(gridSize/2)}px Arial`; 
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const textX = (shop.x + shop.width/2) * gridSize;
    const textY = (shop.y + shop.height/2) * gridSize;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText(shop.shopName, textX, textY);
    
    ctx.fillText(shop.shopName, textX, textY);
    ctx.restore(); 
  });
}

  drawObstacles() {
    const { currentFloorObstacles: obstacles, gridSize, treeImage } = this.vm;
    obstacles.forEach(obs => {
      if (treeImage.complete) {
        this.ctx.drawImage(treeImage, obs.x * gridSize, obs.y * gridSize, gridSize, gridSize);
      }
    });
  }
  drawNetwork() {
    const { ctx, vm: { gridSize } } = this;
    
    // 绘制节点
    ctx.fillStyle = 'blue';
    this.network.nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(
            (node.x + 0.5) * gridSize,
            (node.y + 0.5) * gridSize,
            3, 0, Math.PI * 2
        );
        ctx.fill();
    });

    // 绘制连接线和距离
    ctx.strokeStyle = 'rgba(0,0,255,0.3)';
    ctx.font = '10px Arial';
    ctx.fillStyle = 'black';
    this.network.edges.forEach((edge, key) => {
        const [from, to] = key.split('-').map(k => {
            const [x, y] = k.split(',').map(Number);
            return { x, y };
        });
        
        ctx.beginPath();
        ctx.moveTo((from.x + 0.5) * gridSize, (from.y + 0.5) * gridSize);
        ctx.lineTo((to.x + 0.5) * gridSize, (to.y + 0.5) * gridSize);
        ctx.stroke();

        // 计算边的中间位置
        const midX = ((from.x + to.x) / 2 + 0.5) * gridSize;
        const midY = ((from.y + to.y) / 2 + 0.5) * gridSize;

        // 绘制边的距离
        ctx.fillText(edge.distance, midX, midY);
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
class PriorityQueue {
  constructor(compare) {
    this.elements = [];
    this.compare = compare; 
    // 使用Map记录节点索引提升性能
    this.nodeIndices = new Map(); 
  }

  enqueue(element) {
    // 移除旧条目
    if (this.nodeIndices.has(element.key)) {
      const index = this.nodeIndices.get(element.key);
      this.elements.splice(index, 1);
    }
    
    // 二分查找插入
    let low = 0, high = this.elements.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (this.compare(element, this.elements[mid])) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    
    this.elements.splice(low, 0, element);
    // 更新所有节点的索引（此处可以优化为只更新受影响的部分）
    this._rebuildIndices();
  }

  dequeue() {
    const element = this.elements.shift();
    this._rebuildIndices();
    return element;
  }

  _rebuildIndices() {
    this.nodeIndices.clear();
    this.elements.forEach((el, index) => {
      this.nodeIndices.set(el.key, index);
    });
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}