export class AStarPathfinder {
    constructor(gridWidth, gridHeight) {
      this.grid = {
        width: gridWidth,
        height: gridHeight
      };
      this.obstacles = new Set();
    }
  
    // 初始化障碍物
    setObstacles(obstacles) {
      this.obstacles.clear();
      obstacles.forEach(obs => { 
        this.obstacles.add(this._coordToKey(obs.x, obs.y));
      });
    }
  
    // A* 算法实现
    findPath(start, end) {
      const openSet = new PriorityQueue((a, b) => a.f < b.f);
      const cameFrom = new Map();
      const gScore = new Map();
      const fScore = new Map();
      
      const startKey = this._coordToKey(start.x, start.y);
      const endKey = this._coordToKey(end.x, end.y);
  
      gScore.set(startKey, 0);
      fScore.set(startKey, this._heuristic(start, end));
      openSet.enqueue({ ...start, f: fScore.get(startKey) });
  
      while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        const currentKey = this._coordToKey(current.x, current.y);
  
        if (currentKey === endKey) {
          return this._reconstructPath(cameFrom, current);
        }
  
        this._getNeighbors(current).forEach(neighbor => {
          const neighborKey = this._coordToKey(neighbor.x, neighbor.y);
          const tentativeG = gScore.get(currentKey) + 1;
  
          if (tentativeG < (gScore.get(neighborKey) || Infinity)) {
            cameFrom.set(neighborKey, current);
            gScore.set(neighborKey, tentativeG);
            fScore.set(neighborKey, tentativeG + this._heuristic(neighbor, end));
            
            if (!openSet.contains(neighbor, (a, b) => 
              a.x === b.x && a.y === b.y)) {
              openSet.enqueue({ 
                ...neighbor, 
                f: fScore.get(neighborKey) 
              });
            }
          }
        });
      }
      return null; // 无可用路径
    }
  
    // 私有方法
    _heuristic(a, b) {
      // 曼哈顿距离
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
  
    _getNeighbors(node) {
      const neighbors = [];
      const directions = [
        {x: 1, y: 0},  // 右
        {x: -1, y: 0}, // 左
        {x: 0, y: 1},  // 下
        {x: 0, y: -1}  // 上
      ];
  
      directions.forEach(dir => {
        const x = node.x + dir.x;
        const y = node.y + dir.y;
        
        if (this._isWalkable(x, y)) {
          neighbors.push({ x, y });
        }
      });
      return neighbors;
    }
  
    _isWalkable(x, y) {
      return x >= 0 && x < this.grid.width &&
             y >= 0 && y < this.grid.height &&
             !this.obstacles.has(this._coordToKey(x, y));
    }
  
    _coordToKey(x, y) {
      return `${x},${y}`;
    }
  
    _reconstructPath(cameFrom, current) {
      const path = [current];
      while (cameFrom.has(this._coordToKey(current.x, current.y))) {
        current = cameFrom.get(this._coordToKey(current.x, current.y));
        path.unshift(current);
      }
      return path;
    }
  }
  
  // 优先队列实现
  class PriorityQueue {
    constructor(compare) {
      this.elements = [];
      this.compare = compare;
    }
  
    enqueue(element) {
      let added = false;
      for (let i = 0; i < this.elements.length; i++) {
        if (this.compare(element, this.elements[i])) {
          this.elements.splice(i, 0, element);
          added = true;
          break;
        }
      }
      if (!added) {
        this.elements.push(element);
      }
    }
  
    dequeue() {
      return this.elements.shift();
    }
  
    isEmpty() {
      return this.elements.length === 0;
    }
  
    contains(element, equalFn) {
      return this.elements.some(e => equalFn(e, element));
    }
  }