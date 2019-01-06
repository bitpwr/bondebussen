<template>
  <div class="home">
    <button class="btn btn-primary" v-on:click="get">Update</button>
    <input v-model="stop"/>

    <div v-if="info.busStops && info.busStops.length > 0">
      <h3>Bussar från {{ info.busStation }}</h3>
      <div class="" v-for="stop in info.busStops">
        <Departures v-bind:destinationText="stop.destinationText"
                    v-bind:departures=stop.departures
                    showNumber />
      </div>
    </div>

    <div v-if="info.trainStops && info.trainStops.length > 0">
      <h3>Pendeltåg från {{ info.trainStation }}</h3>
      <div class="" v-for="stop in info.trainStops">
        <Departures v-bind:destinationText="stop.destinationText"
                    v-bind:departures=stop.departures />
      </div>
    </div>

    <div v-if="info.metroStops && info.metroStops.length > 0">
      <h3>Tunnelbana från {{ info.metroStation }}</h3>
      <div class="" v-for="stop in info.metroStops">
        <Departures v-bind:destinationText="stop.destinationText"
                    v-bind:departures=stop.departures />
      </div>
    </div>

    <div v-if="info.tramStops && info.tramStops.length > 0">
      <h3>Tvärbana från {{ info.tramStation }}</h3>
      <div class="" v-for="stop in info.tramStops">
        <Departures v-bind:destinationText="stop.destinationText"
                    v-bind:departures=stop.departures />
      </div>
    </div>

  </div>
</template>

<script>
// @ is an alias to /src
import Departures from '@/components/Departures.vue'

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}

function toJson(response) {
  return response.json();
}

export default {
  name: 'home',
  components: {
    Departures
  },
  data() {
      return {
          stop: 5812,
          info: {}
      }
  },
  methods: {
    get() {
      var self = this;
      fetch('http://192.168.10.137:3100/departures/' + self.stop, {mode: 'cors'}).
      then(checkStatus).then(toJson).
      then(res => { self.info = res; }).
      catch(err => console.log("Error: " + err))
    }
  }

}
</script>
