<template>
  <div class>
    <h4>{{destinationText}}</h4>
    <div class="list-group list-group-flush">
      <div v-for="dep in departures">
        <div class="list-group-item list-group-item-action">
          <span v-if="showNumber">{{ dep.number }} </span>
          <span>{{ dep.destination }} - {{ dep.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    destinationText: String,
    departures: Array,
    showNumber: Boolean
  }
};
</script>

<style>
</style>
