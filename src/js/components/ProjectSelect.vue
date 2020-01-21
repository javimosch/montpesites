<template lang="pug">
    .ProjectSelect(v-show="!project.isSelected")
        h1 Project Select
        ul
          li(v-for="(item, key) in projectFolders")
            button(v-html="item" @click="handleSelectProjectFolder(item)")
</template>
<script>
import api from "../api";
export default {
  data() {
    return {
      selectedProjectFolder: "",
      projectFolders: []
    };
  },
  computed: {
    shouldShow() {
      return !this.$store.getters["isSelected"];
    },
    project() {
      return this.$store.getters["getSelected"];
    }
  },
  methods: {
    handleSelectProjectFolder(name) {
      this.selectedProjectFolder = name;

      this.$store.dispatch("setSelectedByProjectFolderName", name);
    }
  },
  async mounted() {
    this.projectFolders = await api("readAppsFolder", {}, function(items) {
      return items.filter(item => item.indexOf(".") === -1);
    });
  }
};
</script>
<style lang="scss" scoped>
</style>