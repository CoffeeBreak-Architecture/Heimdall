const axios = require('axios')

module.exports = {
    addUser: async function(name, roomId) {
        return (await axios.post(process.env.USER_REPOSITORY + '/users', {nickname: name, roomId: roomId})).data
    },

    getMembers: async function(roomId) {
        return (await axios.get(process.env.USER_REPOSITORY + '/users/members/' + roomId)).data
    },

    setPosition: async function (clientId, movement) {
        return await axios.patch(process.env.USER_REPOSITORY + '/users/position', {x: movement.x, y: movement.y, clientId: clientId})
    },

    getNearby: async function (clientId, threshold) {
        return (await axios.post (process.env.USER_REPOSITORY + '/users/nearby', {userId: clientId, threshold: threshold})).data
    },

    setName: async function (clientId, name) {
        return axios.patch(process.env.USER_REPOSITORY + '/users/nickname', {nickname: name, clientId: clientId})
    },

    deleteUser: async function (clientId) {
        axios.delete(process.env.USER_REPOSITORY + '/users/user/' + clientId)
    }
}