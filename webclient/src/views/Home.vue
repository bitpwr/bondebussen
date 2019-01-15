<template>
  <div class="home">
    <button class="btn btn-primary" v-on:click="get">Update</button>
    <input v-model="stop"/>

    <ul class="nav nav-pills">
      <li class="nav-item">
        <button v-if="gotBusses() && typeCount() > 1" class="nav-link btn" v-bind:class="{ active: type == 0 }"
                v-on:click="type = 0">Buss</button>
      </li>
      <li class="nav-item">
        <button v-if="gotTrains() && typeCount() > 1" class="nav-link btn" v-bind:class="{ active: type == 1 }"
                v-on:click="type = 1">Pendeltåg</button>
      </li>
      <li class="nav-item">
        <button v-if="gotMetros() && typeCount() > 1" class="nav-link btn" v-bind:class="{ active: type == 2 }"
                v-on:click="type = 2">Tunnelbana</button>
      </li>
      <li class="nav-item">
        <button v-if="gotTrams() && typeCount() > 1" class="nav-link btn" v-bind:class="{ active: type == 3 }"
                v-on:click="type = 3">Tvärbana</button>
      </li>
    </ul>

    <div v-if="type == 0 && info.busStops && info.busStops.length > 0">
      <h3>Bussar från {{ info.busStation }}<div class="float-right">{{ info.checktime }}</div></h3>
      <div v-for="stop in info.busStops">
        <Departures v-bind:destinationText="stop.destinationText"
                    v-bind:departures=stop.departures
                    showNumber
                    faIcon="fa-bus text-danger"
                    v-bind:display="stop.display" />
      </div>
    </div>

    <div v-if="type == 1 && info.trainStops && info.trainStops.length > 0">
      <h3>Pendeltåg från {{ info.trainStation }}<div class="float-right">{{ info.checktime }}</div></h3>
      <div class="" v-for="stop in info.trainStops">
        <Departures v-bind:destinationText="stop.destinationText"
                    v-bind:departures=stop.departures
                    faIcon="fa-train text-primary" />
      </div>
    </div>

    <div v-if="type == 2 && info.metroStops && info.metroStops.length > 0">
      <h3>Tunnelbana från {{ info.metroStation }}<div class="float-right">{{ info.checktime }}</div></h3>
      <div class="" v-for="stop in info.metroStops">
        <Departures v-bind:destinationText="stop.destinationText"
                    v-bind:departures=stop.departures
                    faIcon="fa-subway text-success" />
      </div>
    </div>

    <div v-if="type == 3 && info.tramStops && info.tramStops.length > 0">
      <h3>Tvärbana från {{ info.tramStation }}<div class="float-right">{{ info.checktime }}</div></h3>
      <div class="" v-for="stop in info.tramStops">
        <Departures v-bind:destinationText="stop.destinationText"
                    v-bind:departures=stop.departures
                    faIcon="fa-car text-secondary" />
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

// enum DepType {
//   Bus,
//   Train,
//   Metro,
//   Tram
// };

export default {
  name: 'home',
  components: {
    Departures
  },
  data() {
      return {
          stop: 5812,
          info: {},
          type: 0
      }
  },
  methods: {
    get() {
      var self = this;
      fetch('http://192.168.10.137:3100/departures/' + self.stop, {mode: 'cors'}).
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
