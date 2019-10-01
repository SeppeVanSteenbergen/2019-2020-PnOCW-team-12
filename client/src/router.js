import Vue from "vue"
import Router from "vue-router"
import Home from "./views/Home.vue"
import Master from './views/Master'
import Client from './views/Client'

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: function() {
        return import(/* webpackChunkName: "about" */ "./views/About.vue");
      }
    },
    {
      path: '/master/:room_id?',
      name: 'master',
      component: Master
    },
    {
      path:'/client/:room_id?',
      name: 'client',
      component: Client
    }
  ]
});
