<template>
  <div class="mb-2">
    <div class="input-group mt-1">
      <div class="input-group-prepend">
        <span class="input-group-text" id="basic-addon1">Hållplats</span>
      </div>
      <input type="text" v-bind:value="searchText" @input="updateSearchText($event.target.value)"
            class="form-control" aria-describedby="basic-addon1"/>
    </div>
      <div class="list-group list-group-flush shadow">
          <div v-for="station in result"
              class="list-group-item list-group-item-action btn"
              @mouseover="active = true"
              @mouseout="active = false"
              @click="selected(station.id)"
          >
          <span>{{ station.name }}</span>
          </div>
      </div>
  </div>
</template>

<script>
import _ from 'lodash'

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
  data() {
      return {
          searchText: '',
          result: []
      }
  },
  props: {
      selectedCallback: {
          type: Function,
          required: true
      }
  },
  methods: {
    search() {
      var self = this;
      if (self.searchText.length < 3) {
        this.result = [];
        return;
      }
      fetch(process.env.VUE_APP_API_URL + '/search?stop=' + self.searchText, {mode: 'cors'}).
      then(checkStatus).then(toJson).
      then(res => { self.result = res; }).
      catch(err => console.log("Error: " + err))
    },
    updateSearchText(text) {
      this.searchText = text;
      this.textChanged()
    },
    textChanged: _.debounce(function (e) {
      this.search()
    }, 500),
    selected(station) {
      this.result = [];
      this.searchText = '';
      // TODO: use callback or event?
      // this.$emit('selected', station)
      this.selectedCallback(station)
    }
  }
};

</script>

<style>
</style>
