<template>
  <nav class="demo">
    <router-link :to="{name:'home'}" class="brand">
      <i class="fas fa-fan"></i>
      <span>Montpesites</span>
    </router-link>

    <!--
    <select @change="onProjectSelection" v-model="projectName">
      <option v-for="(pr) in projects" :key="pr.name" :value="pr.name">{{pr.name}}</option>
    </select>
    -->

    <!-- responsive-->
    <input id="bmenub" type="checkbox" class="show" />
    <label for="bmenub" class="burger pseudo button">&#8801;</label>

    <div class="menu">
      <router-link :to="{name:'home'}" class="pseudo button icon-picture">Home</router-link>
      <!--
      <router-link :to="{name:'profile'}" class="button icon-puzzle">Profile</router-link>
      -->
    </div>
  </nav>
</template>
<script>
import { default as apiCall, prepareApi } from "../api";
export default {
  data() {
    return {
      projectName: "other",
      projects: []
    };
  },
  computed: {},
  async mounted() {
    this.projects = await apiCall("getAvailableProjects");
  },
  methods: {
    async onProjectSelection() {
      let c = await apiCall("getProjectConfig", [this.projectName]);
      this.$store.dispatch("profile/setProject", c);
      this.$router.push({ name: "editor" });
    }
  }
};
</script>
<style lang="scss" scoped>
select {
  max-width: 200px;
}
</style>