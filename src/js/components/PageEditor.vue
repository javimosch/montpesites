<template lang="pug">
.editor(v-show="$store.state.project.isSelected")
    h2 Page editor
    .flex.one.two-800
      .pageContentArea
        h3 Content Area
        select.PageSelector(v-model="selectedPage" @change="selectPage")
          option(v-for="(item, key) in $store.state.project.pages" :key="key" v-html="item")
        .editorArea(ref="editor")
      .pageConfigArea
        h3 Config area
</template>
<script>
import api from "../api";
export default {
  data() {
    return {
      selectedPage: "",
      page: {
        name: "",
        contents: "",
        config: {}
      }
    };
  },
  destroyed() {},
  computed: {
    shouldShow() {
      return this.$store.state.project.isSelected;
    },
    project() {
      return this.$store.getters.getSelected;
    }
  },
  methods: {
    async selectPage() {
      this.page = await api(
        "getPage",
        {
          projectFolderName: this.project.folderName,
          pageName: this.selectedPage
        },
        {
          namespace: "pages"
        }
      );
      this.editor.setValue(this.page.contents, -1);
    }
  },
  async mounted() {
    var editor = (this.editor = ace.edit(this.$refs.editor));
    editor.setTheme("ace/theme/clouds");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setShowFoldWidgets(false);
    editor.setValue(``, -1);
  }
};
</script>
<style lang="scss" scoped>
.editorArea {
  width: 100%;
  height: 400px;
}
.PageSelector {
  margin-bottom: 15px;
}
</style>