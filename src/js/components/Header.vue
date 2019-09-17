<template>
  <nav class="demo">
    <router-link :to="{name:'home'}" class="brand">
      <img v-if="false" class="logo" src="/web/img/basket.png" />
      <span>Montpesites</span>
    </router-link>

    <!-- responsive-->
    <input id="bmenub" type="checkbox" class="show" />
    <label for="bmenub" class="burger pseudo button">&#8801;</label>

    <div class="menu">
      <router-link :to="{name:'home'}" class="pseudo button icon-picture">Home</router-link>
      <router-link :to="{name:'profile'}" class="button icon-puzzle">Profile</router-link>
    </div>
  </nav>
</template>
<script>
export default {
  data() {
    return {};
  },
  computed: {},
  mounted() {}
};
</script>