import config from '../config/config'
import Config from '@/config/config'
import Vue from 'vue'
import axios from '../plugins/axios'

import store from '../store'

class AuthenticationService {
  constructor() {}

  async login() {
    let response = {
    	success:false
    }
    await axios.get('/login/guest').then((result) => {
    	store.commit('setUser', result.data.user)
    	store.commit('setLoggedIn', true) 
      
    	console.log(result)
    	response.success = true
    	response.data = result.data
    }).catch(err => {
    	response.data = err
    })

    return response
  }

  async sessionLogin() {
    let response = {
    	success: false
    }
    await axios
      .get('/login/session')
      .then(res => {
        // set the store to logged in
        store.commit('setLoggedIn', true) 
        store.commit('setUser', res.data.user)
        console.log(res)
        response.success = true
        response.data = res.data
      })
      .catch(err => {
        console.log('User not logged in')
        console.log(err)
        response.data = err
      })

    return response
  }

  async logout() {
    console.log('now loggin out')
    await axios
      .get('/logout')
      .then(res => {
        store.commit('setLoggedIn', false)
        store.commit('setUser', {})
      })
      .catch(err => {
        console.log(err)
      })
  }
}

Vue.prototype.$auth = new AuthenticationService()

Vue.$auth = new AuthenticationService()

