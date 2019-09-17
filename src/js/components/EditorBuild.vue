<template lang="pug">
.editor
    h3 Build
    select(v-model="page" @change="loadPage")
        option(v-for="(item, key) in pages" :key="key" v-html="item")
    .editorArea(ref="editor")
</template>
<script>
export default {
  data() {
    return {
      pages: [],
      page: ""
    };
  },
  destroyed() {},
  methods: {
    async loadPage() {
      let r = await (await fetch(
        `/api/editor/page?repo=${btoa(
          this.$store.state.profile.repoUrl
        )}&page=${this.page}`
      )).json();
      editor.setValue(r.contentFile.raw, -1);
    },
    async loadPages() {
      let url = this.$store.state.profile.repoUrl;
      if (url) {
        let r = await (await fetch(
          "/api/editor/pages?repo=" + btoa(url)
        )).json();
        this.pages = r;
        console.log("R", r);
      }
    }
  },
  async mounted() {
    var editor = ace.edit(this.$refs.editor);
    editor.setTheme("ace/theme/clouds");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setShowFoldWidgets(false);
    editor.setValue(``, -1);

    setTimeout(() => {
      this.loadPages();
    }, 2000);
  }
};
</script>
<style lang="scss" scoped>
.editorArea {
  width: 100%;
  height: 400px;
}
</style>