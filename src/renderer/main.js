import Vue from "vue";
import App from "./App.vue";
import VueElectron from "vue-electron";

if (!process.env.IS_WEB) Vue.use(VueElectron);
Vue.config.productionTip = false;

new Vue({
  components: { App },
  template: "<App/>",
}).$mount("#app");
