<template>
  <el-menu :default-openeds="['2', 'good']" style="height: 100%;"
           background-color="rgb(48,65,86)"
           text-color ="#fff"
           :collapse-transition="false"
           :collapse="isCollapse"
           router
  >
    <div style="height: 60px;margin-left: 30px; line-height: 60px">
      <router-link to="/manage/home">
        <img src="../resource/logo.png" style="width: 32px;position: relative; top: 7px;right: 6px;">
      </router-link>
      <span slot="title" style="color: aliceblue;font-size: 20px" v-show="!isCollapse">数智化商城后台管理</span>
    </div>
    <el-menu-item index="/manage/home">
      <i class="el-icon-a-011" style="font-size: 22px;color: white;"></i><span slot="title">主页</span>
    </el-menu-item>
    <el-menu-item index="/">
      <i class="el-icon-a-02" style="font-size: 22px;color: white;"></i><span slot="title">前台</span>
    </el-menu-item>

    <el-submenu index="2">
      <template slot="title" >
        <i class="el-icon-a-031" style="font-size: 22px;color: white;"></i><span slot="title">系统管理</span></template>
      <el-submenu v-show="userGroup" index="user" >
        <template slot="title" ><i class="el-icon-a-01" style="font-size: 22px;color: white;"></i>用户</template>
        <el-menu-item index="/manage/user" v-if="menuFlags.userMenu"> 用户管理</el-menu-item>
      </el-submenu>
      <el-submenu v-if="fileGroup" index="file">
        <template slot="title"><i class="el-icon-a-061" style="font-size: 22px;color: white;"></i>文件</template>
        <el-menu-item index="/manage/file" v-if="menuFlags.fileMenu">文件管理</el-menu-item>
        <el-menu-item index="/manage/avatar" v-if="menuFlags.avatarMenu">头像管理</el-menu-item>
      </el-submenu>
      <el-submenu v-if="GoodGroup" index="good">
        <template slot="title"><i class="el-icon-a-041" style="font-size: 22px;color: white;"></i>店铺</template>
        <el-menu-item index="/manage/category" v-if="menuFlags.categoryMenu">店铺分类管理</el-menu-item>
        <el-menu-item index="/manage/carousel" v-if="menuFlags.carouselMenu">轮播图管理</el-menu-item>
        <el-menu-item index="/manage/good" v-if="menuFlags.goodMenu">店铺管理</el-menu-item>
        <el-menu-item index="/manage/order" v-if="menuFlags.orderMenu">订单管理</el-menu-item>
      </el-submenu>
      <el-submenu v-if="incomeGroup" index="income">
        <template slot="title"><i class="el-icon-a-021" style="font-size: 22px;color: white;"></i>营收</template>
        <el-menu-item index="/manage/incomeChart" v-if="menuFlags.incomeChartMenu">图表分析</el-menu-item>
        <el-menu-item index="/manage/incomeRank" v-if="menuFlags.incomeRankMenu">收入排行榜</el-menu-item>
      </el-submenu>
    </el-submenu>
  </el-menu>
</template>

<script>
import request from "@/utils/request";

export default {
  name: "Aside",
  props: {
    isCollapse: Boolean,
  },
  data() {
    return{
      role : 'user',
      menuFlags: {
        userMenu: false,
        fileMenu: false,
        avatarMenu: false,
        goodMenu: false,
        carouselMenu: false,
        orderMenu: false,
        categoryMenu: false,
        incomeChartMenu: false,
        incomeRankMenu: false,
      }
    }
  },
  computed: {
    userGroup: function (){
      return this.menuFlags.userMenu
    },
    fileGroup: function (){
      return this.menuFlags.fileMenu || this.menuFlags.avatarMenu
    },
    GoodGroup: function (){
      return this.menuFlags.goodMenu ||this.menuFlags.orderMenu || this.menuFlags.categoryMenu || this.menuFlags.carouselMenu
    },
    incomeGroup: function () {
      return this.menuFlags.incomeChartMenu || this.menuFlags.incomeRankMenu
    }
  },
  created() {
    request.post("http://localhost:9191/role").then(res=>{
      if(res.code==='200'){
        this.role = res.data;
        console.log("asider，role："+this.role)
        if(this.role === 'admin'){
          this.menuFlags.userMenu = true
          this.menuFlags.fileMenu = true
          this.menuFlags.avatarMenu = true
          this.menuFlags.categoryMenu = true
          this.menuFlags.goodMenu = true
          this.menuFlags.carouselMenu = true
          this.menuFlags.orderMenu = true
          this.menuFlags.incomeChartMenu = true
          this.menuFlags.incomeRankMenu = true
        }
        else if(this.role==='user'){

        }
        console.log(this.menuFlags)
      }
    })
  }
}
</script>

<style scoped>

</style>