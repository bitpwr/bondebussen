<template>
  <div class="home">
    <Search :selectedCallback="get" />

    <ul class="nav nav-pills mb-3">
      <li class="nav-item">
        <button v-if="gotBusses() && typeCount() > 1" class="nav-link btn"
                v-bind:class="{ active: type == 0 }"
                v-on:click="type = 0">Buss</button>
      </li>
      <li class="nav-item">
        <button v-if="gotTrains() && typeCount() > 1" class="nav-link btn"
                v-bind:class="{ active: type == 1 }"
                v-on:click="type = 1">Pendeltåg</button>
      </li>
      <li class="nav-item">
        <button v-if="gotMetros() && typeCount() > 1" class="nav-link btn"
                v-bind:class="{ active: type == 2 }"
                v-on:click="type = 2">Tunnelbana</button>
      </li>
      <li class="nav-item">
        <button v-if="gotTrams() && typeCount() > 1" class="nav-link btn"
                v-bind:class="{ active: type == 3 }"
                v-on:click="type = 3">Tvärbana</button>
      </li>
    </ul>

    <div v-if="type == 0 && info.busStops && info.busStops.length > 0">
      <h4>{{ info.busStation }}</h4>
      <p class="text-muted">Avgångar efter {{ info.checktime }}</p>
      <div v-for="stop in info.busStops">
        <Departures v-bind:destinationText="stop.destinationText"
                    v-bind:departures=stop.departures
                    showNumber
                    faIcon="fa-bus"
                    textColor="text-danger"
                    borderColor="border-danger" />
      </div>
    </div>

    <div v-if="type == 1 && info.trainStops && info.trainStops.length > 0">
      <h4>{{ info.trainStation }}</h4>
      <p class="text-muted">Avgångar efter {{ info.checktime }}</p>
      <div class="" v-for="stop in info.trainStops">
        <Departures v-bind:destinationText="stop.destinationText"
                    v-bind:departures=stop.departures
                    faIcon="fa-train"
                    textColor="text-primary"
                    borderColor="border-primary" />
      </div>
    </div>

    <div v-if="type == 2 && info.metroStops && info.metroStops.length > 0">
      <h4>{{ info.metroStation }}</h4>
      <p class="text-muted">Avgångar efter {{ info.checktime }}</p>
      <div class="" v-for="stop in info.metroStops">
        <Departures v-bind:destinationText="stop.destinationText"
                    v-bind:departures=stop.departures
                    faIcon="fa-subway"
                    textColor="text-success"
                    borderColor="border-success" />
      </div>
    </div>

    <div v-if="type == 3 && info.tramStops && info.tramStops.length > 0">
      <h4>{{ info.tramStation }}</h4>
      <p class="text-muted">Avgångar efter {{ info.checktime }}</p>
      <div class="" v-for="stop in info.tramStops">
        <Departures v-bind:destinationText="stop.destinationText"
                    v-bind:departures=stop.departures
                    faIcon="fa-car"
                    textColor="text-secondary"
                    borderColor="border-secondary" />
      </div>
    </div>

  </div>
</template>

<script>
// @ is an alias to /src
import Departures from '@/components/Departures.vue'
import Search from '@/components/Search.vue'

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

// enum DepType {
//   Bus,
//   Train,
//   Metro,
//   Tram
// };

export default {
  name: 'home',
  components: {
    Departures,
    Search
  },
  data() {
      return {
          info: {},
          type: 0
      }
  },
  mounted: function () {
    this.$nextTick(function () {
      this.get(5812);
    })
  },
  methods: {
    get(stationId) {
      var self = this;
      var url = process.env.VUE_APP_API_URL + '/departure/' + stationId;
      fetch(url, {mode: 'cors'}).
      then(checkStatus).then(toJson).
      then(res => { self.info = res; }).
      catch(err => console.log("Error: " + err))
    },
    gotBusses: function () {
      return (this.info.busStops && this.info.busStops.length > 0)
    },
    gotTrains: function () {
      return this.info.trainStops && this.info.trainStops.length > 0
    },
    gotMetros: function () {
      return this.info.metroStops && this.info.metroStops.length > 0
    },
    gotTrams: function () {
      return this.info.tramStops && this.info.tramStops.length > 0
    },
    typeCount: function() {
      var count = 0;
      if (this.gotBusses()) ++count;
      if (this.gotTrains()) ++count;
      if (this.gotMetros()) ++count;
      if (this.gotTrams()) ++count;
      return count;
    }
  }
}
</script>
