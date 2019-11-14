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
            <v-btn icon title="导出" @click="exportTorrent(item)">
              <v-icon>save</v-icon>
            </v-btn>

            <v-btn
              icon
              title="导出并重新设置保存目录"
              @click="exportTorrent(item, true)"
            >
              <v-icon>save_alt</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
  </v-app>
</template>

<script lang="ts">
import { FileDownloader, ERequestMethod } from "./downloader";

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
    },

    exportTorrent(item: any, resetPath: boolean = false) {
      console.log(item);
      let to = "";
      if (resetPath) {
        to = window.prompt("请输入目标路径");
        if (to === null) {
          return;
        }
      }

      let file = new FileDownloader({
        url: "./api/export",
        method: ERequestMethod.POST
      });

      file.postData = {
        from: item.path,
        to
      };

      file.start();
      // $.ajax({
      //   url: "./api/export",
      //   method: "POST",
      //   dataType: "binary",
      //   data: {
      //     from: item.path
      //   },
      //   beforeSend: function(jqXHR, settings) {
      //     if (settings.dataType === "binary") {
      //       settings.xhr().responseType = "blob";
      //       settings.processData = false;
      //     }
      //   },
      //   success: data => {
      //     console.log(data); //ArrayBuffer
      //     FileSaver.saveAs(new Blob([data]), "export.zip");
      //   },
      //   error: error => {
      //     console.log(error);
      //   }
      // });
    }
  }
};
</script>
