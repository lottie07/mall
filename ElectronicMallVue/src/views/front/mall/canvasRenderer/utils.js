// src/components/FloorPlan/canvasRenderer/utils.js

/**
 * 坐标转换工具
 * @param {number} clientX - 鼠标X坐标
 * @param {number} clientY - 鼠标Y坐标
 * @param {DOMRect} canvasRect - Canvas的getBoundingClientRect()结果
 * @param {number} gridSize - 网格尺寸
 * @returns {{gridX: number, gridY: number}} 网格坐标
 */
export function clientToGrid(clientX, clientY, canvasRect, gridSize) {
    return {
      gridX: Math.floor((clientX - canvasRect.left) / gridSize),
      gridY: Math.floor((clientY - canvasRect.top) / gridSize)
    };
  }
  
  /**
   * 碰撞检测
   * @param {number} x - 待检测X坐标
   * @param {number} y - 待检测Y坐标
   * @param {Array<{x: number, y: number}>} obstacles - 障碍物数组
   * @returns {boolean} 是否发生碰撞
   */
  export function checkCollision(x, y, obstacles) {
    return obstacles.some(obs => obs.x === x && obs.y === y);
  }
  
  /**
   * 坐标合法性验证
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} cols - 总列数（根据canvasWidth/gridSize计算）
   * @param {number} rows - 总行数（根据canvasHeight/gridSize计算）
   * @returns {boolean} 是否合法坐标
   */
  export function isValidPosition(x, y, cols, rows) {
    return x >= 0 && x < cols && y >= 0 && y < rows;
  }
  
  /**
   * 获取当前悬停的店铺
   * @param {number} gridX - 网格X坐标
   * @param {number} gridY - 网格Y坐标
   * @param {Array} shops - 当前楼层店铺数据
   * @returns {Object|null} 匹配的店铺对象
   */
  export function getHoveredShop(gridX, gridY, shops) {
    return shops.find(shop => {
      const xEnd = shop.x + shop.width;
      const yEnd = shop.y + shop.height;
      return gridX >= shop.x && gridX < xEnd && gridY >= shop.y && gridY < yEnd;
    });
  }
  
  /**
   * 电梯位置检测
   * @param {number} x - 玩家X坐标
   * @param {number} y - 玩家Y坐标
   * @param {Array} shops - 当前楼层店铺数据
   * @returns {boolean} 是否在电梯区域
   */
  export function checkElevatorPosition(x, y, shops) {
    const elevator = shops.find(s => s.shape === 'elevator');
    if (!elevator) return false;
  
    return (
      x >= elevator.x &&
      x < elevator.x + elevator.width &&
      y >= elevator.y &&
      y < elevator.y + elevator.height
    );
  }
  
  /**
   * 动画节流函数
   * @param {Function} fn - 需要节流的函数
   * @param {number} delay - 延迟时间(ms)
   * @returns {Function} 节流后的函数
   */
  export function throttleAnimation(fn, delay = 100) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        fn.apply(this, args);
        lastCall = now;
      }
    };
  }
  
  /**
   * 生成店铺形状映射
   * @param {Array} shops - 原始店铺数据
   * @returns {Array} 带shape属性的店铺数据
   */
  export function generateShopShapes(shops) {
    return shops.map(shop => ({
      ...shop,
      shape: getShopShape(shop)
    }));
  }
  
  // 内部使用的形状判断逻辑
  function getShopShape(shop) {
    if (shop.type === 'elevator') return 'elevator';
    if (shop.width > 3) return 'rect';
    return shop.shape || 'invertedHouse'; // 优先使用数据中的shape字段
  }