<template>
    <el-dialog
      title="地图数据导入"
      :visible.sync="visible"
      width="30%"
      @close="handleClose"
    >
      <el-upload
        class="upload-demo"
        action="/api/map/import"
        :show-file-list="false"
      >
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">
          支持JSON格式地图数据文件，最大50MB
        </div>
      </el-upload>
  
      <div class="import-options">
        <el-input
          v-model="apiUrl"
          placeholder="输入数据API地址"
          style="margin-top: 15px;"
          @keyup.enter.native="handleApiImport"
        >
          <el-button 
            slot="append" 
            icon="el-icon-link"
            @click="handleApiImport"
          ></el-button>
        </el-input>
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
        apiUrl: ''
      }
    },
    methods: {
      handleClose() {
        this.$emit('update:visible', false)
      },
      handleApiImport() {
        if (this.apiUrl) {
          this.$emit('import-from-api', this.apiUrl)
          this.apiUrl = ''
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .upload-demo {
    text-align: center;
  }
  .import-options {
    margin-top: 20px;
  }
  </style>