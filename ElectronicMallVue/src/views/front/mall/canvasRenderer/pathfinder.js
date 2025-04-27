export class GraphNetwork {
  constructor() {
    this.nodes = new Map();    // 存储节点 {x, y}
    this.edges = new Map();    // 存储边数据
    this.adjacencyList = new Map(); // 邻接表
  }
  _nodeEquals(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  validate() {
    let isValid = true;
    
    this.edges.forEach((_, key) => {
      const [a, b] = key.split('-');
      if (!this.adjacencyList.get(a)?.some(n => n.node === b)) {
        console.error(`边 ${key} 不存在于邻接表`);
        isValid = false;
      }
      if (!this.adjacencyList.get(b)?.some(n => n.node === a)) {
        console.error(`反向边 ${key} 不存在于邻接表`);
        isValid = false;
      }
    });

    // 验证节点坐标有效性
    this.nodes.forEach((node, key) => {
      if (key !== `${node.x},${node.y}`) {
        console.error(`节点坐标不匹配: ${key} vs ${node.x},${node.y}`);
        isValid = false;
      }
    });

    return isValid;
  }


  // 添加节点
  addNode(point) {
    const key = this._nodeKey(point);
    if (!this.nodes.has(key)) {
      this.nodes.set(key, { x: point.x, y: point.y });
      this.adjacencyList.set(key, []);
    }
  }

  // 构建网络（同步版本）
buildNetwork(shopPoints, maxConnectionDistance = 10) {
  this.clearNetwork();
  
  // 添加所有节点
  shopPoints.forEach(shop => {
      this.addNode({
          x: Math.floor(shop.centerX),
          y: Math.floor(shop.centerY)
      });
  });

  const nodeList = Array.from(this.nodes.values());
  for (let i = 0; i < nodeList.length; i++) {
      let hasEdge = false;
      for (let j = i + 1; j < nodeList.length; j++) {
          const nodeA = nodeList[i];
          const nodeB = nodeList[j];
          
          if (this._distance(nodeA, nodeB) <= maxConnectionDistance) {
              this._createEdge(nodeA, nodeB);
              hasEdge = true;
          }
      }
      // 如果当前点没有边，则强制与第一个点连接
      if (!hasEdge && nodeList.length > 1) {
          const Node = nodeList[40];
          if (i!== 0) {
              this._createEdge(nodeList[i], Node);
          }
      }
  }
  
  console.log(`网络构建完成 节点数: ${this.nodes.size} 边数量: ${this.edges.size}`);
  return this;
}
  // 创建边连接
  _createEdge(nodeA, nodeB) {
    const path = this._generateStraightPath(nodeA, nodeB);
    const distance = this._distance(nodeA, nodeB);

    // 生成边键
    const edgeKey = this._edgeKey(nodeA, nodeB);
    const reverseEdgeKey = this._edgeKey(nodeB, nodeA);

    // 存储边数据
    this.edges.set(edgeKey, { path, distance });
    this.edges.set(reverseEdgeKey, { 
      path: [...path].reverse(), 
      distance 
    });

    // 更新邻接表
    this._updateAdjacencyList(nodeA, nodeB, distance);
    this._updateAdjacencyList(nodeB, nodeA, distance);
  }

  // Bresenham直线算法生成路径
  _generateStraightPath(start, end) {
    let x0 = Math.floor(start.x);
    let y0 = Math.floor(start.y);
    const x1 = Math.floor(end.x);
    const y1 = Math.floor(end.y);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    const path = [];

    while (true) {
      path.push({ x: x0, y: y0 });

      if (x0 === x1 && y0 === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    return path;
  }

  // 更新邻接表
  _updateAdjacencyList(fromNode, toNode, distance) {
    const fromKey = this._nodeKey(fromNode);
    this.adjacencyList.get(fromKey)?.push({
      node: this._nodeKey(toNode),
      distance
    });
  }

  // 工具方法
  clearNetwork() {
    this.nodes.clear();
    this.edges.clear();
    this.adjacencyList.clear();
  }

  _nodeKey(point) {
    return `${point.x},${point.y}`;
  }

  _edgeKey(a, b) {
    const [key1, key2] = [this._nodeKey(a), this._nodeKey(b)].sort();
    return `${key1}-${key2}`;
  }

  _distance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

  // 调试方法
  printNetwork() {
    console.log('=== 节点列表 ===');
    this.nodes.forEach((node, key) => {
      console.log(`节点 ${key}:`, node);
    });

    console.log('=== 邻接表 ===');
    this.adjacencyList.forEach((edges, key) => {
      console.log(`节点 ${key} 连接至:`, edges);
    });
  }
}