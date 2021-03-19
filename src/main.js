import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
// 以下为bpmn工作流绘图工具的样式
import 'bpmn-js/dist/assets/diagram-js.css' // 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css' // 右边工具栏样式
//bpmn 右边工具栏自定义主题
import '@/css/bpmn-properties-theme-style.css'
// 引入全局的css
import '@/css/app.css'
//xml转json
import x2js from 'x2js'

Vue.use(Element)
Vue.prototype.$x2js = new x2js()
Vue.config.productionTip = false
Vue.prototype.$axios = axios;
new Vue({
    render: h => h(App),
}).$mount('#app')
