<template>
  <div id="app">
    <div class="d-flex justify-content-between bg-light text-dark pt-2">
      <a href="/" class="btn ml-2"><div class="h2 brand">Bondebussen</div></a>
      <a href="/about"><i class="fa fa-2x fa-info text-warning mr-3 mt-2"></i></a>
    </div>
    <div class="container">
      <router-view/>
    </div>
  </div>
</template>

<style>
.brand {
  letter-spacing: 4px
}
</style>
