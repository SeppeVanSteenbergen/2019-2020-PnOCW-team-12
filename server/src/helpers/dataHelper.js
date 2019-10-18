/*

the connected clients have a format
key: user_id
{
  socket:
  room:  (-1 not in room, >= 0 in a room)
  (connected: (possible to know if socket exists))
  disconnect_time: (time/date when the client was last connected, -1 if still connected, time/date if disconnected)
}
*/

/*
dictionary with room_id as key

value:
{
  master: (user_id of master)
  clients:[] (user_id list of all clients of rooom)
  name: (name of the room)
  open: (true if open room, false if closed room)
}
*/
module.exports = {
  addUser(user_id) {
    clientList[user_id] = {
      socket_id: -1,
      room: -1,
      disconnect_time: -1
    }
    return 0
  },
  /**
   * Links the active socket connection to the user_id
   */
  registerUserSocket(user_id, socket_id) {

    if (typeof clientList[user_id] === 'undefined') this.addUser(user_id)

    if(clientList[user_id].socket_id !== -1) {
      return 1
    }

    clientList[user_id].socket_id = socket_id

    console.log(clientList)

    console.log(roomList)

    return 0
  },

  removeUser(user_id) {
    if (typeof clientList[user_id] === 'undefined') return 0

    this.exitRoom(user_id)

    delete clientList[user_id]

    return 0
  },

  addClientToRoom(client_user_id, room_id) {
    if (!this.canAddToRoom(client_user_id, room_id)) {
      console.log('not possible to add user to room')
      return 1
    }

    roomList[room_id].clients.push(client_user_id)
    clientList[client_user_id].room = room_id

    return 0
  },

  createRoom(master_user_id, name = null) {
    console.log(master_user_id)
    console.log(clientList)
    console.log(roomList)
    if (!this.canCreateRoom(master_user_id)) {
      console.log('Not possible to create a room')
      return 1
    }

    for (let i = 0; i < Object.keys(roomList).length + 10; i++) {
      if (!roomList.hasOwnProperty(i)) {
        console.log('ROOM CREATE')
        console.log(roomList[i])
        roomList[i] = {
          master: master_user_id,
          clients: [],
          open: true
        }
        console.log(roomList[i])
        if (name !== null) {
          roomList[i].name = name
        } else {
          roomList[i].name = 'Room ' + i
        }

        clientList[master_user_id].room = i
        console.log('---------------------')
        console.log('CREATED ROOM SUCCESSFULLY')
        console.log(clientList)
        console.log(roomList)
        return 0
      }
    }

    console.log('UNABLE TO FIND ROOM ID')

    return 1
  },

   exitRoom(user_id) {
    console.log('start exit room func')
    if (clientList[user_id].room === -1) {
      console.log('Client is not in a room')
      return 0
    }

    console.log(1)

    const room_id = clientList[user_id].room

    console.log('room_id: ' + room_id)
    console.log(roomList[room_id])

    console.log('try disconnecting master')
    if (roomList[room_id].master === user_id) {
      this.disconnectAllClientsFromRoom(room_id)
      console.log('removing master')
      console.log(roomList)
      delete roomList[room_id]
      console.log('master removed')
      console.log(roomList)
    } else {
      if (roomList[room_id].clients.includes(user_id))
        roomList[room_id].clients.splice(
          roomList[room_id].clients.indexOf(user_id),
          1
        )
    }

    clientList[user_id].room = -1

    return 0
  },

  disconnectAllClientsFromRoom(room_id) {
    if (typeof roomList[room_id] === 'undefined') {
      return 0
    }

    for (let i = 0; i < roomList[room_id].clients.length; i++) {
      this.exitRoom(roomList[room_id].clients[i])
    }

    return 0
  },

  /**
   * Returns the room_id of the room the user is in. Or -1 if not in a room.
   */
  getUserRoom(user_id) {
    return clientList[user_id].room
  },

  isMasterUser(user_id) {
    if (this.getUserRoom(user_id) === -1) {
      return false
    }

    if (roomList[this.getUserRoom(user_id)].master === user_id) return true

    return false
  },

  isClientUser(user_id) {
    if (this.getUserRoom(user_id) === -1) return false

    for (
      let i = 0;
      i < roomList[this.getUserRoom(user_id)].clients.length;
      i++
    ) {
      if (roomList[this.getUserRoom(user_id)].clients[i] === user_id)
        return true
    }

    return false
  },

  isConnected(user_id) {
    return clientList[user_id].socket_id !== -1
  },

  canAddToRoom(user_id, room_id) {
    if (clientList[user_id].room !== -1) return false

    if (!roomList[room_id].open) return false

    return true
  },
  canCreateRoom(user_id) {
    if (clientList[user_id].room !== -1) return false

    return true
  },
  // TODO This is not an efficient algorithm. Too much overhead
  getUserIDFromSocketID(socket_id) {
    for (let user_id in clientList) {
      if (clientList[user_id].socket_id === socket_id) {
        return user_id
      }
    }
    console.log(clientList)
    console.log('socket_id ' + socket_id + ' not linked to user_id')
    throw new Error('socket_id ' + socket_id + ' not linked to user_id')
  },

  // TODO Handle errors
  getSocketIDFromUserID(user_id) {
    return clientList[user_id].socket_id
  },

  getRoomList() {
    return roomList
  },

  getAllActiveSocketIDs() {
    let result = []

    for (let user_id in clientList) {
      if (clientList[user_id].socket_id !== -1) {
        result.push(clientList[user_id].socket_id)
      }
    }
    return result
  },

  closeRoom(user_id) {
    //TODO check can be written more efficiently without searching all the rooms
    if (!this.isMasterUser(user_id)) {
      console.log('The user is not allowed to send the close room command')
      return 1
    }

    roomList[this.getUserRoom(user_id)].open = false
  },

  openRoom(user_id) {
    //TODO check can be written more efficiently without searching all the rooms
    if (!this.isMasterUser(user_id)) {
      console.log('The user is not allowed to send the close room command')
      return 1
    }

    roomList[this.getUserRoom(user_id)].open = true
  },

  toggleRoom(user_id) {
    if (!this.isMasterUser(user_id)) {
      console.log('The user is not allowed to send the close room command')
      return 1
    }

    roomList[this.getUserRoom(user_id)].open = !roomList[
      this.getUserRoom(user_id)
    ].open
  },

  getClientsOfRoom(room_id) {
    return roomList[room_id].clients
  },
  addUserRegistration(user_id, key) {
    registrationList.push({
      user_id: user_id,
      key: key
    })
  },
  validRegistration(user_id, key) {
    for(let i = 0; i < Object.keys(registrationList).length; i++) {
      if(registrationList[i].user_id === user_id && registrationList[i].key === key) {
        registrationList.splice(i, 1)
        return true

      }
    }
    return false
  },
  isRegisteredSocket(socket_id) {
    for(let user_id in clientList) {
      if(clientList[user_id].socket_id === socket_id) {
        return true
      }
    }
    return false
  },
  disableSocket(user_id) {
    if(typeof clientList[user_id] !== 'undefined') {
      clientList[user_id].socket_id = -1
      return 0
    }
    return 1
  }
}
