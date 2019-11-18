<template>
  <v-app id="app">
    <v-card>
      <v-toolbar color="light-blue" dark>
        <v-toolbar-title>
          <span v-text="config.description"></span>
          <span class="caption ml-2"
            >v{{ config.version }}</span
          ></v-toolbar-title
        >
      </v-toolbar>

      <v-card-actions class="pa-3">
        <input
          type="file"
          ref="fileImport"
          style="display:none;"
          multiple="false"
        />
        <span>
          <v-btn
            title="原样导出所有种子文件"
            @click="exportTorrent(null)"
            depressed
            color="success"
            class="mr-2"
          >
            <v-icon>save</v-icon>
            <span>导出所有</span>
          </v-btn>

          <v-btn
            title="导出并重新设置保存目录"
            @click="exportTorrent(null, true)"
            depressed
            color="primary"
          >
            <v-icon>save_alt</v-icon>
            <span>导出并重新设置保存目录</span>
          </v-btn>

          <v-divider class="mx-2 mt-0" vertical></v-divider>

          <v-btn
            title="从已备份的zip文件中导入种子文件"
            @click="importTorrent()"
            depressed
            color="info"
            :loading="importing"
          >
            <v-icon>restore</v-icon>
            <span>导入种子文件</span>
          </v-btn>
        </span>
        <v-spacer></v-spacer>
      </v-card-actions>

      <v-list two-line subheader>
        <template v-for="(item, key, index) in paths">
          <v-divider :key="index"></v-divider>
          <v-list-item :key="item.path">
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
              <div>
                <v-btn
                  icon
                  title="原样导出"
                  @click="exportTorrent(item)"
                  color="success"
                >
                  <v-icon>save</v-icon>
                </v-btn>

                <v-btn
                  icon
                  title="导出并重新设置保存目录"
                  @click="exportTorrent(item, true)"
                  color="primary"
                >
                  <v-icon>save_alt</v-icon>
                </v-btn>
              </div>
            </v-list-item-action>
          </v-list-item>
        </template>
      </v-list>
    </v-card>

    <v-snackbar v-model="haveError" top :timeout="3000" color="error">{{
      errorMsg
    }}</v-snackbar>
    <v-snackbar v-model="haveSuccess" bottom :timeout="3000" color="success">{{
      successMsg
    }}</v-snackbar>
  </v-app>
</template>

<script lang="ts">
import { FileDownloader, ERequestMethod } from "./downloader";

export default {
  name: "App",

  data() {
    return {
      paths: {},
      config: {
        description: "",
        version: ""
      },
      fileInput: null as any,
      importing: false,

      haveError: false,
      haveSuccess: false,
      errorMsg: "",
      successMsg: ""
    };
  },
  created() {
    this.getConfig();
    this.loadList();
  },
  mounted() {
    this.fileInput = this.$refs.fileImport;
    this.fileInput.addEventListener("change", this.importFile);
  },
  beforeDestroy() {
    this.fileInput.removeEventListener("change", this.importFile);
  },
  methods: {
    getConfig() {
      $.getJSON("./api/config", result => {
        this.config = result.data;
      });
    },

    loadList() {
      let url = "./api/paths";
      $.getJSON(url, result => {
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
        from: item ? item.path : "",
        to
      };

      file.start();
    },

    importTorrent() {
      this.fileInput.click();
    },

    importFile(event: Event) {
      this.clearMessage();
      let selectedFile: any = event.srcElement;
      if (
        selectedFile.files.length > 0 &&
        selectedFile.files[0].name.length > 0
      ) {
        let file = selectedFile.files[0];
        if (file.name.substr(-4) === ".zip") {
          this.importing = true;
          const formData = new FormData();
          formData.append("name", file.name);
          formData.append("data", file);
          $.ajax({
            url: "./api/import",
            method: "POST",
            dataType: "json",
            data: formData,
            processData: false,
            contentType: false
          })
            .done(result => {
              if (result.data) {
                this.successMsg = `操作完成，共导入：${result.data.success} ；跳过：${result.data.skip}`;
              }

              this.importing = false;
              this.loadList();
            })
            .fail(error => {
              console.log(error);
              this.errorMsg = `导入失败。${error}`;
              this.importing = false;
            });
          selectedFile.value = "";
        }
      }
    },
    clearMessage() {
      this.successMsg = "";
      this.errorMsg = "";
    }
  },

  watch: {
    successMsg() {
      this.haveSuccess = this.successMsg != "";
    },
    errorMsg() {
      this.haveError = this.errorMsg != "";
    }
  }
};
</script>
