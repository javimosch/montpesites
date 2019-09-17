<template>
  <div>
    <h3 class="title">Profile</h3>
    <div class="form">
      <label>Username</label>
      <input placeholder="username" v-model="profile.username" />
      <label>Public Repo URL</label>
      <input placeholder="repoURL" v-model="profile.repoUrl" />
      <button @click="saveProfile">Save Profile</button>
    </div>
  </div>
</template>
<script>
import loadLocalSession from "../mixins/loadLocalSession";
export default {
  mixins: [loadLocalSession],
  data() {
    return {
      profile: {
        username: this.$store.state.profile.username,
        repoUrl: this.$store.state.profile.repoUrl
      }
    };
  },
  methods: {
    async saveProfile() {
      await this.$store.dispatch("profile/assignProfile", this.profile);
      window.localStorage.setItem(
        "user",
        btoa(JSON.stringify(Object.assign({}, this.profile)))
      );
      this.$router.push({ name: "home" });
    }
  },
  mounted() {
    this.$watch(
      "$store.state.profile",
      () => {
        this.profile = this.$store.state.profile;
      },
      true
    );
  }
};
</script>
<style  scoped>
.form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px;
}
.title {
  background-color: rgb(95, 197, 94);
  color: white;
  width: 100%;
  text-align: center;
}
input {
  max-width: 250px;
  margin-top: 5px;
}
button {
  display: block;
  max-width: 200px;
  font-size: 18px;
  margin-top: 20px;
  padding: 20px;
}
label {
  display: block;
  margin-top: 10px;
}

@media (max-width: 639px) {
  input {
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 1047px) {
}

@media (min-width: 1048px) {
}
</style>