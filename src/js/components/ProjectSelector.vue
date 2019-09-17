<template>
  <div>
    <h3 class="title">
      Repository
      <button @click="$router.push({name:'profile'})" class="switch_btn">Switch</button>
    </h3>
    <p class="repo_link">{{$store.state.profile.repoUrl}}</p>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {}
};
</script>
<style scoped>
.title {
  margin: 0px;
  padding: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.repo_link {
  margin: 0px;
  padding: 0px;
  font-size: 12px;
  text-align: center;
  font-weight: 100;
  font-style: italic;
  margin-top: 10px;
}
button {
  font-size: 14px;
}
.switch_btn {
  font-size: 10px;
  margin-left: 10px;
}
@media (max-width: 639px) {
  button {
    padding: 20px;
  }
}
</style>