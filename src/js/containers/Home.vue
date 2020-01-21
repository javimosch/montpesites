

<template lang="pug">
  .Home
    project-select(ref="prSelect")
    editor-build(ref="build")
</template>
<script>
import ProjectSelect from "../components/ProjectSelect.vue";
import EditorBuild from "../components/EditorBuild.vue";
export default {
  components: {
    ProjectSelect,
    EditorBuild
  },
  mixins: [],
  data() {
    return {
      profile: {
        username: "",
        repoUrl: ""
      }
    };
  },
  methods: {},
  computed: {},
  mounted() {}
};
</script>
<style scoped>
.Home {
  margin: 5px;
}
</style>