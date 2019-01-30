<template>
  <div class="home">
    <Search :selectedCallback="get" />

    <div class="mb-2">
      <b-button-group v-if="typeCount() > 1">
        <b-button v-if="gotType(0) && typeCount() > 1" v-bind:class="{ active: type == 0 }"
          @click="type = 0">Buss</b-button>
        <b-button v-if="gotType(1) && typeCount() > 1" v-bind:class="{ active: type == 1 }"
          @click="type = 1">Pendeltåg</b-button>
        <b-button v-if="gotType(2) && typeCount() > 1" v-bind:class="{ active: type == 2 }"
          @click="type = 2">Tunnelbana</b-button>
        <b-button v-if="gotType(3) && typeCount() > 1" v-bind:class="{ active: type == 3 }"
          @click="type = 3">Tvärbana</b-button>
      </b-button-group>
    </div>

    <div class="d-flex justify-content-between">
      <h4>{{ stationName }}</h4>
      <b-button variant="primary" @click="get(stationId)">Update</b-button>
    </div>
    <p class="text-muted">Avgångar efter {{ info.checktime }}</p>

    <div v-if="type == 0 && gotType(type)" v-for="stop in info.busStops">
      <Departures v-bind:destinationText="stop.destinationText"
                  v-bind:departures=stop.departures
                  showNumber
                  faIcon="fa-bus"
                  textColor="text-danger"
                  borderColor="border-danger" />
    </div>

    <div v-if="type == 1 && gotType(type)" v-for="stop in info.trainStops">
      <Departures v-bind:destinationText="stop.destinationText"
                  v-bind:departures=stop.departures
                  faIcon="fa-train"
                  textColor="text-primary"
                  borderColor="border-primary" />
    </div>

    <div v-if="type == 2 && gotType(type)" v-for="stop in info.metroStops">
      <Departures v-bind:destinationText="stop.destinationText"
                  v-bind:departures=stop.departures
                  faIcon="fa-subway"
                  textColor="text-success"
                  borderColor="border-success" />
    </div>

    <div v-if="type == 3 && gotType(type)" v-for="stop in info.tramStops">
      <Departures v-bind:destinationText="stop.destinationText"
                  v-bind:departures=stop.departures
                  faIcon="fa-car"
                  textColor="text-secondary"
                  borderColor="border-secondary" />
    </div>

  </div>
</template>

<style>
.btn {
    padding-right: 9px;
    padding-left: 9px;
}
</style>

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
          stationId: 0,
          type: 0
      }
  },
  mounted: function () {
    this.$nextTick(function () {
      this.get(5812);
    })
  },
  computed: {
    stationName: function () {
      if (this.info == []) {
        return ""
      }
      if (this.type == 0) {
        return this.info.busStation
      }
      else if (this.type == 1) {
        return this.info.trainStation
      }
      else if (this.type == 2) {
        return this.info.metroStation
      }
      else if (this.type == 3) {
        return this.info.tramStation
      }
    }
  },
  methods: {
    get(stationId) {
      var self = this;
      self.stationId = stationId;
      var url = process.env.VUE_APP_API_URL + '/departure/' + stationId;
      fetch(url, {mode: 'cors'}).
      then(checkStatus).then(toJson).
      then(res => { self.info = res;
          if (!self.gotType(self.type)) {
            if (self.gotType(0)) {
              self.type = 0;
            }
            else if (self.gotType(1)) {
              self.type = 1;
            }
            else if (self.gotType(2)) {
              self.type = 2;
            }
            else if (self.gotType(3)) {
              self.type = 3;
            }
            else {
              self.type = 0;
            }
          }
        }).
      catch(err => console.log("Error: " + err))
    },
    gotType(i) {
      switch (i) {
        case 0:
          return this.info.busStops && this.info.busStops.length > 0;
        case 1:
          return this.info.trainStops && this.info.trainStops.length > 0;
        case 2:
          return this.info.metroStops && this.info.metroStops.length > 0;
        case 3:
          return this.info.tramStops && this.info.tramStops.length > 0;
        default:
          return false;
      }
    },
    typeCount: function() {
      var count = 0;
      if (this.gotType(0)) ++count;
      if (this.gotType(1)) ++count;
      if (this.gotType(2)) ++count;
      if (this.gotType(3)) ++count;
      return count;
    }
  }
}
</script>
