<template>
    <el-dialog
      title="导入"
      :visible.sync="visible"
      width="60%"
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
  
      <div 
        v-if="imageUrl" 
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
      }
    },
    methods: {
      handleClose() {
        this.$emit('update:visible', false)
        this.imageUrl = ''
        this.points = []
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
    position: relative;
    margin-top: 20px;
    border: 1px dashed #ddd;
    min-height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden; 
  }
  </style>