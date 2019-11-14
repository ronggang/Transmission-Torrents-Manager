<template>
  <v-app id="app">
    <v-card>
      <v-toolbar color="light-blue" dark>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>

        <v-toolbar-title>目录列表</v-toolbar-title>
      </v-toolbar>

      <v-list two-line subheader>
        <v-list-item v-for="item in paths" :key="item.path">
          <v-list-item-avatar>
            <v-icon class="grey lighten-1 white--text" v-text="item.icon"
              >folder</v-icon
            >
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-text="item.path"></v-list-item-title>
            <v-list-item-subtitle class="mt-1"
              >{{ item.count }} 个种子, 共
              {{ item.size | formatSize }}</v-list-item-subtitle
            >
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon>
              <v-icon color="grey lighten-1">mdi-information</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
  </v-app>
</template>

<script lang="ts">
export default {
  name: "App",

  data() {
    return {
      paths: {}
    };
  },
  created() {
    this.loadList();
  },
  methods: {
    loadList() {
      $.getJSON("./api/paths", result => {
        console.log(result);
        this.paths = result.data;
      });
    }
  }
};
</script>
