const clientMap = require('./clientMap')
const axios = require("axios");

const namespaceName = 'rooms'
const nearbyThreshold = 512
var roomio;

module.exports = {
    init: function (io, app) {
        roomio = io.of('/' + namespaceName)
        console.log(namespaceName + " initialized..")

        roomio.on('connection', socket => {

            var rid = undefined

            socket.on('login', async (nickname, roomId) => {

                try {
                    let newClient = (await axios.post(process.env.USER_REPOSITORY + '/users', {nickname: nickname, roomId: roomId})).data
                    let clientId = newClient.id

                    rid = roomId

                    clientMap.addClient(clientId, socket.id, namespaceName)

                    let members = (await axios.get(process.env.USER_REPOSITORY + '/users/members/' + rid)).data

                    socket.join(rid)
                    socket.emit('onLoggedIn', {self: newClient, all: members})
                    roomio.to(rid).emit('onUserConnected', newClient)
            
                    console.log(clientId + " succesfully logged in to room " + rid)
                } catch(error) {
                    console.log(error)
                }
            })

            socket.on('onChatMessage', message => {
                roomio.to(rid).emit('onChatMessage', message)
            })

            socket.on('onMovePlayer', async movement => {
                let clientId = await clientMap.getClientId(socket.id)
                await axios.patch(process.env.USER_REPOSITORY + '/users/position', {x: movement.x, y: movement.y, clientId, clientId})
                let nearby = (await axios.post (process.env.USER_REPOSITORY + '/users/nearby', {userId: clientId, threshold: nearbyThreshold})).data

                roomio.to(rid).emit('onMovePlayer', {id: clientId, x: movement.x, y: movement.y})
                socket.emit('nearby', {nearby: nearby, threshold: nearbyThreshold})
            })

            socket.on('onNameChanged', async name => {
                let clientId = await clientMap.getClientId(socket.id)
                await axios.patch(process.env.USER_REPOSITORY + '/users/nickname', {nickname: name, clientId: clientId})
                roomio.to(rid).emit('onNameChanged', {id: clientId, name: name})
            })

            socket.on('disconnect', async () => {
                let clientId = await clientMap.getClientId(socket.id)
                await axios.delete(process.env.USER_REPOSITORY + '/users/user/' + clientId)
                roomio.to(rid).emit('onUserDisconnected', clientId)
            })
        })

        return roomio
    },
}