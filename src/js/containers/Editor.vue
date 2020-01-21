<template lang="pug">
.editor
    .phases
        .build(@click="switchToPhase(0)")
            h3 BUILD
        .test(@click="switchToPhase(1)")
            h3 TEST
        .deploy(@click="switchToPhase(2)")
            h3 DEPLOY
    .phaseContent
        vue-editor-build(v-show="phase===0")
        vue-editor-test(v-show="phase===1")
        vue-editor-deploy(v-show="phase===2")
</template>
<script>
import loadLocalSession from "../mixins/loadLocalSession";
import EditorBuild from "../components/EditorBuild.vue";
import EditorTest from "../components/EditorTest.vue";
import EditorDeploy from "../components/EditorDeploy.vue";
export default {
  mixins: [loadLocalSession],
  components: {
    "vue-editor-build": EditorBuild,
    "vue-editor-test": EditorTest,
    "vue-editor-deploy": EditorDeploy
  },
  data() {
    return {
      phase: 0
    };
  },
  async created() {
    if (!(await this.$store.dispatch("profile/isProjectDataOK"))) {
      let isSelected = !!this.$store.state.profile.project.name;
      if (!isSelected) {
        this.$router.push({ name: "home" });
      } else {
        this.$router.push({
          name: "project",
          params: {
            name: this.$store.state.profile.project.name
          }
        });
      }
      this.$emit("isProjectDataOK_false");
    }
  },
  methods: {
    switchToPhase(index = 0) {
      this.phase = index;
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../styles/variables.scss";

.editor {
  @media (max-width: $breakSmall) {
  }
}
.phases {
  display: grid;
  grid-template-columns: 33% 33% 33%;
}
.phases > div {
  display: flex;
  justify-items: center;
  align-items: center;
  background-color: grey;
  min-height: 150px;
  cursor: pointer;
}
.phases > div.test {
  background-color: #7d7474;
}
.phases > div h3 {
  margin: 0 auto;
  color: white;
}
.phases > div:hover {
  background-color: #848492;
}
.phaseContent {
  margin: 5px;
}
</style>