import Vue from "vue";
import App from "./App.vue";
import { filters } from "./filters";
import vuetify from "./plugins/vuetify"; // path to vuetify export

// 初始化全局过滤器
for (const key in filters) {
  if (filters.hasOwnProperty(key)) {
    Vue.filter(key, (...result: any) => {
      return filters[key].call(filters, result);
    });
  }
}

new Vue({
  vuetify,
  render: h => h(App)
}).$mount("#app");
