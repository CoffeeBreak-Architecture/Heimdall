const clientMap = require('./clientMap')
const roomRepo = require('./roomRepo')
const userRepo = require('./userRepo')

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
                    let newClient = await userRepo.addUser(nickname, roomId)
                    let room = await roomRepo.getRoom(roomId)
                    let clientId = newClient.id
                    rid = roomId

                    clientMap.addClient(clientId, socket.id, namespaceName)
                    let members = await userRepo.getMembers(roomId)

                    socket.join(rid)
                    socket.emit('onLoggedIn', {room: room, self: newClient, all: members})
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
                userRepo.setPosition(clientId, movement)
                let nearby = await userRepo.getNearby(clientId, nearbyThreshold)
                roomio.to(rid).emit('onMovePlayer', {id: clientId, x: movement.x, y: movement.y})
                socket.emit('nearby', {nearby: nearby, threshold: nearbyThreshold})
            })

            socket.on('onNameChanged', async name => {
                let clientId = await clientMap.getClientId(socket.id)
                await userRepo.setName(clientId, name)

                roomio.to(rid).emit('onNameChanged', {id: clientId, name: name})
            })

            socket.on('disconnect', async () => {
                let clientId = await clientMap.getClientId(socket.id)
                await userRepo.deleteUser(clientId)

                roomio.to(rid).emit('onUserDisconnected', clientId)
            })
        })

        return roomio
    },
}