// A* 算法所需的节点类
class Node {
    constructor(x, y, g = Infinity, h = Infinity, parent = null) {
        this.x = x;
        this.y = y;
        this.g = g;
        this.h = h;
        this.f = g + h;
        this.parent = parent;
    }
}

// 启发式函数，使用曼哈顿距离
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// A* 算法实现
function aStar(start, end, obstacles, width, height) {
    const openSet = [];
    const closedSet = new Set();

    const startNode = new Node(start.x, start.y, 0, heuristic(start, end));
    openSet.push(startNode);

    while (openSet.length > 0) {
        let lowestIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) {
                lowestIndex = i;
            }
        }
        let current = openSet[lowestIndex];

        if (current.x === end.x && current.y === end.y) {
            const path = [];
            let temp = current;
            while (temp) {
                path.push({ x: temp.x, y: temp.y });
                temp = temp.parent;
            }
            return path.reverse();
        }

        openSet.splice(lowestIndex, 1);
        closedSet.add(`${current.x},${current.y}`);

        const neighbors = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
        ];

        for (let neighbor of neighbors) {
            if (
                neighbor.x < 0 ||
                neighbor.x >= width ||
                neighbor.y < 0 ||
                neighbor.y >= height ||
                closedSet.has(`${neighbor.x},${neighbor.y}`) ||
                obstacles.some(o => o.x === neighbor.x && o.y === neighbor.y)
            ) {
                continue;
            }

            const tentativeG = current.g + 1;
            let neighborNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
            if (!neighborNode) {
                neighborNode = new Node(neighbor.x, neighbor.y);
                openSet.push(neighborNode);
            } else if (tentativeG >= neighborNode.g) {
                continue;
            }

            neighborNode.parent = current;
            neighborNode.g = tentativeG;
            neighborNode.h = heuristic(neighborNode, end);
            neighborNode.f = neighborNode.g + neighborNode.h;
        }
    }
    return [];
}

export { aStar };    