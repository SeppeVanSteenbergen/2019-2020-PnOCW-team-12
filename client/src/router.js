import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Master from './views/Master'
import Client from './views/Client'
import Controller from './views/Controller.vue'
Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/index.html',
      alias: '/',
      component: Home
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/master/:room_id?',
      name: 'master',
      component: Master
    },
    {
      path: '/client/:room_id?',
      name: 'client',
      component: Client
    },
    {
      path: '/controller/:room_id?',
      name: 'controller',
      component: Controller
    }
  ]
})
