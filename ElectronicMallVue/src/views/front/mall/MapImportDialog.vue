<template>
    <el-dialog
      title="导入"
      :visible.sync="visible"
      width="80%"
      @close="handleClose"
    >
      <el-upload
        class="upload-demo"
        action="#"
        :show-file-list="false"
        :auto-upload="false"
        :on-change="handleImageUpload"
        accept="image/*"
      >
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">
          支持JPG/PNG格式图片，最大5MB
        </div>
      </el-upload>
  
      <div class="editor-container" v-if="imageUrl">
        <div 
          class="image-container"
          ref="imageContainer"
          @mousemove="handleDrag"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
        >
          <img 
            :src="imageUrl" 
            alt="上传的图片"
            ref="image"
            @load="initPoints"
          >
          <div
            v-for="(point, index) in points"
            :key="index"
            class="control-point"
            :style="{
              left: point.x + 'px',
              top: point.y + 'px'
            }"
            @mousedown="startDrag(index, $event)"
          ></div>
          <svg class="polygon" v-if="points.length > 1">
            <polygon 
              :points="polygonPoints"
              fill="rgba(64, 158, 255, 0.3)"
              stroke="#409eff"
            />
          </svg>
        </div>
  
        <div class="property-sidebar">
            <el-form label-position="top">
              <el-form-item label="店铺X坐标">
                <el-input v-model.number="shopX"></el-input>
              </el-form-item>
              <el-form-item label="店铺Y坐标">
                <el-input v-model.number="shopY"></el-input>
              </el-form-item>
              <el-form-item label="店铺长度">
                <el-input v-model.number="shopWidth"></el-input>
              </el-form-item>
              <el-form-item label="店铺宽度">
                <el-input v-model.number="shopHeight"></el-input>
              </el-form-item>
              <el-form-item label="店铺名称">
                <el-input v-model="shopName"></el-input>
              </el-form-item>
              <el-form-item label="所在楼层">
                <el-input v-model="shopFloor"></el-input>
              </el-form-item>
            </el-form>
            <el-button type="primary" class="confirm-btn">确认</el-button>
          </div>
      </div>
    </el-dialog>
  </template>
  
  <script>
  export default {
    props: {
      visible: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        imageUrl: '',
        points: [],
        draggingIndex: -1,
        containerRect: null
      }
    },
    computed: {
    polygonPoints() {
      return this.points.map(p => `${p.x},${p.y}`).join(' ')
    },
    // 自动计算左上角坐标
    topLeftPoint() {
      if(this.points.length === 0) return {x:0, y:0}
      return this.points.reduce((prev, curr) => {
        return {
          x: Math.min(prev.x, curr.x),
          y: Math.min(prev.y, curr.y)
        }
      })
    }
  },watch: {
    // 当锚点变化时更新坐标
    topLeftPoint(newVal) {
      this.shopX = newVal.x
      this.shopY = newVal.y
    },
    // 当手动修改坐标时更新锚点
    shopX(newVal) {
      this.updateTopLeftPoint(newVal, 'x')
    },
    shopY(newVal) {
      this.updateTopLeftPoint(newVal, 'y')
    }
  },
    methods: {
      handleClose() {
        this.$emit('update:visible', false)
        this.imageUrl = ''
        this.points = []
      },
      updateTopLeftPoint(value, axis) {
        const tlIndex = this.findTopLeftIndex()
        if(tlIndex >= 0) {
            const newPoint = {...this.points[tlIndex]}
            newPoint[axis] = value
            this.points.splice(tlIndex, 1, newPoint)
        }
        },
        findTopLeftIndex() {
      if(this.points.length === 0) return -1
      let minX = Infinity
      let minY = Infinity
      let index = 0
      
      this.points.forEach((p, i) => {
        if(p.x < minX || (p.x === minX && p.y < minY)) {
          minX = p.x
          minY = p.y
          index = i
        }
      })
      return index
    },
  
      
      handleImageUpload(file) {
        const isImage = file.raw.type.startsWith('image/')
        const isLt5M = file.raw.size / 1024 / 1024 < 5
        
        if (!isImage) {
          this.$message.error('只能上传图片文件!')
          return false
        }
        if (!isLt5M) {
          this.$message.error('图片大小不能超过5MB!')
          return false
        }
        
        this.imageUrl = URL.createObjectURL(file.raw)
        return false
      },
      
      initPoints() {
        const img = this.$refs.image
        this.containerRect = this.$refs.imageContainer.getBoundingClientRect()
        
        // 初始化四个角点
        this.points = [
          { x: 10, y: 10 },          // 左上
          { x: img.width - 10, y: 10 }, // 右上
          { x: img.width - 10, y: img.height - 10 }, // 右下
          { x: 10, y: img.height - 10 }  // 左下
        ]
      },
      
      startDrag(index, e) {
        this.draggingIndex = index
        e.preventDefault()
      },
      
      handleDrag(e) {
        if (this.draggingIndex === -1) return
        
        const container = this.$refs.imageContainer
        const rect = container.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        this.points.splice(this.draggingIndex, 1, {
          x: Math.max(0, Math.min(x, container.clientWidth)),
          y: Math.max(0, Math.min(y, container.clientHeight))
        })
      },
      
      stopDrag() {
        this.draggingIndex = -1
      }
    }
  }
  </script>
  <style scoped>
  .control-point {
    position: absolute;
    width: 12px;
    height: 12px;
    background: #409eff;
    border: 2px solid white;
    border-radius: 50%;
    cursor: move;
    transform: translate(-50%, -50%);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 2;  
  }
  
  .polygon {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
   z-index: 1;  
  }
  
  .image-container {
    flex: 1;
    border: 1px dashed #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    position: relative;
    margin: 0; 
  }
  .editor-container {
    display: flex;
    gap: 20px;
    margin-top: 20px;
    height: 80vh; 
    align-items: stretch;
  }
  
  .property-sidebar {
    width: 300px;
    padding: 20px;
    border-left: 1px solid #ebeef5;
    display: flex;
    flex-direction: column;
    height: 100%; 
    overflow: hidden; 
  }
  .el-form {
    flex: 1;
    overflow-y: auto; /* 表单区域滚动 */
    margin-right: -15px; /* 补偿滚动条宽度 */
    padding-right: 15px; /* 防止内容被滚动条遮挡 */
  }
  
  .confirm-btn {
    flex-shrink: 0; /* 防止按钮被压缩 */
    margin-top: 20px;
  }
  
  </style>