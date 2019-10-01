<template>
	<v-container class="fill-height" fluid>
        <v-row align="center" justify="center" min-height='300px'>
            <v-card max-width='400px'>
                <v-toolbar color="primary" dark flat>
                    <v-toolbar-title>Choose a room</v-toolbar-title>
                    <div class="flex-grow-1"></div>
                </v-toolbar>
                <v-container>
                    <v-list>
                        <v-list>
                            <v-list-item v-for="item in items" :key="item.title" @click="$router.push({params: {room_id: item.room_id}})">
                                <v-list-item-icon>
                                    <v-icon :color="item.open?'success':'error'">{{item.open?'mdi-lock-open':'mdi-lock'}}</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title v-text="item.title"></v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-list>
                </v-container>
            </v-card>
        </v-row>
    </v-container>
</template>


<script>

export default {
	name: 'client',
	data() {
		return {
			items: [
          { open: true, title: 'Room 0', room_id: 0},
          { open:false, title: 'Room 1' , room_id: 1},
          { open:true, title: 'Room 2' , room_id: 2},
          { open: false, title: 'Room 3', room_id: 3},
        ]
		}
	}
}

</script>


<style>

</style>

