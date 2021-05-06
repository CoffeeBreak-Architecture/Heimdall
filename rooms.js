const clientMap = require('./clientMap')
const axios = require("axios");

const namespaceName = 'rooms'
var roomio;

module.exports = {
    init: function (io, app) {
        roomio = io.of('/' + namespaceName)
        console.log(namespaceName + " initialized..")

        roomio.on('connection', socket => {

            var roomId = undefined

            socket.on('login', async clientId => {

                clientMap.addClient(clientId, socket.id, namespaceName)
                
                try {
                    roomId = (await axios.get(process.env.USER_REPOSITORY + '/users/' + clientId)).data.roomId
                    let members = (await axios.get(process.env.USER_REPOSITORY + '/users/members/' + roomId)).data
                    socket.join(roomId)

                    let newLogin = members.find(x => x.id == clientId)

                    socket.emit('onLoggedIn', {self: newLogin, all: members})
                    roomio.to(roomId).emit('onUserConnected', newLogin)
            
                    console.log(clientId + " succesfully logged in to room " + roomId)
                } catch(error) {
                    console.log(error)
                }
            })

            socket.on('onChatMessage', message => {
                roomio.to(roomId).emit('onChatMessage', message)
            })

            socket.on('onMovePlayer', async movement => {
                let clientId = await clientMap.getClientId(socket.id)
                await axios.patch(process.env.USER_REPOSITORY + '/users/' + clientId + '/position', {x: movement.x, y: movement.y})
                roomio.to(roomId).emit('onMovePlayer', {id: clientId, x: movement.x, y: movement.y})
            })

            socket.on('onNameChanged', async name => {
                let clientId = await clientMap.getClientId(socket.id)
                await axios.patch(process.env.USER_REPOSITORY + '/users/' + clientId + '/nickname', {nickname: name})
                roomio.to(roomId).emit('onNameChanged', {id: clientId, name: name})
            })

            socket.on('disconnect', async () => {
                let clientId = await clientMap.getClientId(socket.id)
                await axios.delete(process.env.USER_REPOSITORY + '/users/' + clientId)
                roomio.to(roomId).emit('onUserDisconnected', clientId)
            })
        })

        return roomio
    },
}