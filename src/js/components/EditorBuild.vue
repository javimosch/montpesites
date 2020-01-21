<template lang="pug">
.editor(v-show="project.isSelected")
    <article class="card">
      <header>
        <button class="warning" @click="switchProject">Swtich Project</button>
      </header>
    </article>
    page-editor(ref="pageEditor")
</template>
<script>
import PageEditor from "./PageEditor.vue";
import api from "../api";
import { mapGetters, mapState } from "vuex";
export default {
  components: {
    PageEditor
  },
  data() {
    return {};
  },
  destroyed() {},
  computed: mapState(["project"]),
  methods: {
    switchProject() {
      this.$store.dispatch("unselectProject", {});
    }
  },
  async mounted() {}
};
</script>
<style lang="scss" scoped>
</style>