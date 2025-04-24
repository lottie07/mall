<template>
  <div>
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
import API from "@/utils/request";
import axios from 'axios';

export default {
  data() {
    return {
      canvasWidth: 800,
      canvasHeight: 600,
      infoBoxVisible: false,
      gridSize: 20,
      blockX: 0,
      blockY: 0,
      allShops: [], 
      firstFloorShops: [], 
      secondFloorShops: [], 
      obstacles: [
        { x: 3, y: 4 },
        { x: 6, y: 6 }
      ],
      treeImage: new Image()
    };
  },
  created() {
    this.fetchShops(); // 组件创建时获取店铺数据
  },
  methods: {
    fetchShops() {
      this.request.get("/api/shops").then((res) => {
        if (res.code == 200) {
          this.allShops = res.data;
          this.sortShopsByFloor(); 
        } else {
          console.log("请求失败:", res);
        }
      }).catch(error => {
        console.error("请求异常:", error);
      });
    },
    
    sortShopsByFloor() {
      this.firstFloorShops = [];
      this.secondFloorShops = [];
      this.allShops.forEach((shop) => {
        if (shop.floor == 1) {
          this.firstFloorShops.push(shop);
        } else if (shop.floor == 2) {
          this.secondFloorShops.push(shop);
        }
      });
    }
  },
  mounted() {
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
    };

    drawGrid();
  }
};
</script>

<style scoped>
/* 样式代码 */
</style>