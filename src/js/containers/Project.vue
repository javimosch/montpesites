<template lang="pug">
    div
        h3 Project
        label name
        input(v-model="name")
        label repoUrl
        input(v-model="repoUrl")
</template>
<script>
export default {
  data() {
    return {
      name: "",
      repoUrl: ""
    };
  },
  created() {
    //console.log(this.$route);
  },
  async mounted() {
    Object.assign(this.$data, this.$store.state.profile.project);
    this.$forceUpdate();
  }
};
</script>
<style lang="scss" scoped>
</style>