<template>
    <!--<div>
        <v-btn @click="action">
            Do Something
        </v-btn>
        <h1>
            output data: {{something}}
        </h1>
    </div>-->
    <v-container
        class="fill-height"
        fluid
      >
        <v-row
          align="center"
          justify="center"
          min-height='300px'
        >
          <MasterClientCard v-on:master='master' v-on:client='client'/>
    </v-row>
  </v-container>
</template>
<script>
import axios from '../plugins/axios'
import MasterClientCard from '../components/MasterClientCard'
export default {
    name: "home",
    components: {
    	MasterClientCard
    },
    data() {
        return {
            something: ''
        }
    },
    methods: {
        async action() {
            console.log('sending request')
            let result = await axios.get('/login/guest').then(function (data) {
            	this.something = result.data
            }).catch(err => {
                console.log(err)
            })

        },
        master() {
            console.log('master')
            this.$router.push({name: 'master'})
        },
        client() {
            this.$router.push({name: 'client'})
        }
    }
};
</script>