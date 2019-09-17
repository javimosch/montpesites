

<template>
  <div class="home"></div>
</template>
<script>
import ProjectSelector from "../components/ProjectSelector.vue";
import loadLocalSession from "../mixins/loadLocalSession";
export default {
  components: {
    "vue-project-selector": ProjectSelector
  },
  mixins: [loadLocalSession],
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
  mounted() {
    if (!this.hasValidSession()) {
      console.log("INVALID SESSION?m GOINT TO PROFILE");
      setTimeout(() => {
        this.$router.push({
          name: "profile"
        });
      }, 2000);
    }
  }
};
</script>
<style scoped>
.home {
  margin: 5px;
}
</style>