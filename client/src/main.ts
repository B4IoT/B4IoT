import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import './style.css'
import App from './App.vue'

import features from '../../features.json';

import router from './routing/router'
import { createStore } from 'vuex'


const store = createStore({
  state () {
    return {
      config: {}
    }
  },
  mutations: {
    setConfiguration(state,config) {
      state.config = config
    },
    getConfiguration(state){
        return state.config
    }
  }
})

//const r = await fetch("https://raw.githubusercontent.com/<anon>")
//store.commit("setConfiguration",await r.json())

//const r = await fetch("https://raw.githubusercontent.com/<anon>")
store.commit("setConfiguration",features)

const app = createApp(App);
app.use(router);
app.use(store)
app.mount('#app')

