import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './resource/font/iconfont.css'
import '@/resource/global.css'
import ElementUI from 'element-ui';
import request from './utils/request';
import './resource/font2/iconfont.css'
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.prototype.request=request;


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
