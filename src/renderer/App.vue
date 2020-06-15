<template>
  <div id="app">
    <controls></controls>
  </div>
</template>

<script>
import Controls from "./components/controls/Index";

export default {
  name: "App",
  components: {
    Controls
  },
  methods: {},
  created() {},
  mounted() {
    this.$electron.ipcRenderer.on("will-close", () => {
      this.$electron.ipcRenderer.send("app-exit");
    });
  }
};
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  font-size: 0;
  background-color: transparent;
}
</style>
