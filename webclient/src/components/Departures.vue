<template>
  <div class="card">
    <div class="card-header">Mot {{destinationText}}</div>
    <!-- <div class="card-body"> -->
      <ul class="list-group list-group-flush">
        <div v-for="dep in departures">
          <li class="list-group-item list-group-item-action border-bottom">
            <i class="fa" v-bind:class="[faIcon]" area-hidden=true></i>
            <span v-if="showNumber"> {{ dep.number }}</span>
            <span> {{ dep.destination }} - {{ dep.time }}</span>
            <span v-if="display" class="">({{display}})</span>
          </li>
        </div>
      </ul>
    <!-- </div> -->
  </div>
</template>

<script>
export default {
  props: {
    destinationText: String,
    departures: Array,
    showNumber: Boolean,
    faIcon: String,
    display: String
  }
};
</script>

<style>
</style>
