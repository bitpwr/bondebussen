<template>
  <div class="">
    <h5 class="border-bottom" v-bind:class="[borderColor]">Mot {{destinationText}}</h5>
    <div class="list-group list-group-flush mb-2">
      <div v-for="dep in departures">

        <div class="list-group-item list-group-item-action">
          <i class="fa" v-bind:class="[faIcon, textColor]" area-hidden=true></i>
          <span v-if="showNumber"> {{ dep.number }}</span>
          <span> {{ dep.destination }} - {{ dep.timeExpected }}</span>
          <span v-if="dep.display" class="text-muted"><br>{{display(dep.display)}}</span>
          <span v-if="dep.delayed" class="bg-warning"><br>Försenad {{ dep.delayed }} min</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
      return {
          textColorClass: '',
          borderColorClass: ''
      }
  },
  props: {
    destinationText: String,
    departures: Array,
    showNumber: Boolean,
    faIcon: String,
    textColor: String,
    borderColor: String
  },
  methods: {
    display: function(time) {
      if (time == "Nu") {
        return "Avgår nu"
      }
      else {
        return "Avgår om " + time
      }
    }
  }
};
</script>

<style>
</style>
