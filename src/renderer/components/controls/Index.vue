<template>
  <div id="top-bar">
      <sys-controls></sys-controls>
      <app-controls></app-controls>
  </div>
</template>

<script>
import SysControls from "./SysControls";
import AppControls from "./AppControls";
export default {
  components: {
      SysControls,
      AppControls
  }
};
</script>

<style>
</style>