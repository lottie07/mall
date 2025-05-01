<template>
  <div class="card-container">
    <!-- 销量徽章 -->
    <div class="sales-badge">
      <span class="badge-text">销量第{{index}}</span>
      <svg class="badge-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,2L15.09,8.26L22,9.27L17,14.14L18.18,21.02L12,17.77L5.82,21.02L7,14.14L2,9.27L8.91,8.26L12,2Z"/>
      </svg>
    </div>

    <div class="card-body">
      <!-- 商品图片区 -->
      <router-link 
        :to="'/goodview/'+good.id" 
        class="product-image-link"
        @mouseover="hoverScale(1.05)"
        @mouseleave="hoverScale(1)">
        <div class="image-wrapper">
          <img 
            :src="baseApi + good.imgs" 
            :alt="good.name"
            class="product-image">
        </div>
      </router-link>

      <!-- 商品信息区 -->
      <div class="product-info">
        <div class="info-header">
          <h3 class="product-id">ID: {{good.id}}</h3>
          <router-link 
            :to="'/goodview/'+good.id" 
            class="product-title-link">
            <h2 class="product-title">{{good.name}}</h2>
          </router-link>
        </div>
        
        <!-- 销售数据 -->
        <div class="sales-data">
          <div class="data-item">
            <span class="data-label">销售额</span>
            <span class="data-value highlight">￥{{good.saleMoney}}</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: salesProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "IncomeItem",
  props: {
    good: Object,
    index: Number,
    categories: Array
  },
  data() {
    return {
      baseApi: this.$store.state.baseApi,
      salesProgress: Math.min(100, (this.good.saleMoney / 10000) * 100) // 示例进度计算
    }
  },
  methods: {
    hoverScale(scale) {
      this.$el.querySelector('.image-wrapper').style.transform = `scale(${scale})`
    }
  }
}
</script>

<style scoped>
/* 整体容器 */
.card-container {
  position: relative;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  overflow: hidden;
  margin-bottom: 20px;
}

.card-container:hover {
  transform: translateY(-4px);
}

/* 销量徽章 */
.sales-badge {
  position: absolute;
  top: -10px;
  left: -10px;
  display: flex;
  align-items: center;
  background: #ff4757;
  padding: 8px 15px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(255,71,87,0.3);
}

.badge-text {
  color: white;
  font-weight: 600;
  margin-right: 8px;
}

.badge-icon {
  width: 20px;
  height: 20px;
  color: #ffdd59;
}

/* 主体内容 */
.card-body {
  display: flex;
  padding: 20px;
  gap: 30px;
}

.product-image-link {
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.image-wrapper {
  width: 140px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 商品信息 */
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.info-header {
  margin-bottom: 15px;
}

.product-id {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 5px;
}

.product-title-link {
  text-decoration: none;
  transition: color 0.2s ease;
}

.product-title {
  color: #2d3436;
  font-size: 20px;
  margin: 0;
  transition: color 0.2s ease;
}

.product-title:hover {
  color: #0984e3;
}

/* 销售数据 */
.sales-data {
  background: rgba(241, 242, 246,0.4);
  padding: 15px;
  border-radius: 8px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.data-label {
  color: #636e72;
  font-size: 16px;
}

.highlight {
  color: #00b894;
  font-size: 22px;
  font-weight: 700;
}

/* 进度条 */
.progress-bar {
  height: 6px;
  background: #dfe6e9;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00cec9, #00b894);
  transition: width 0.8s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-body {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .product-info {
    width: 100%;
  }

  .product-title {
    font-size: 18px;
  }
}
</style>