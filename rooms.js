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
            console.log("connection")
            var rid = undefined

            socket.on('login', async (nicknames) => {

                try {
                
                    let nicknameRoomid = nicknames.split(":")
                    let nickname = nicknameRoomid[0]
                    let roomId = nicknameRoomid[1]
                    // Figure out client and room information.
                    let newClient = await userRepo.addUser(nickname, roomId)
                    let room = await roomRepo.getRoom(roomId)
                    let clientId = newClient.id
                    rid = roomId

                    // Track client locally.
                    clientMap.addClient(clientId, socket.id, namespaceName)
                    let members = await userRepo.getMembers(roomId)

                    // Join the client to the socket room.
                    socket.join(rid)

                    socket.emit('onLoggedIn', {room: room, self: newClient, all: members})
                    // Notify everyone of login.
                    roomio.to(rid).emit('onUserConnected', newClient)
            
                    console.log(clientId + " succesfully logged in to room " + rid)
                    io.emit("hello")
                } catch(error) {
                    console.log(error)
                }
            })

            // Simple relay
            socket.on('onChatMessage', message => {
                roomio.to(rid).emit('onChatMessage', message)
            })

            // Update client position in database, relay to everyone in room.
            socket.on('onMovePlayer', async movement => {
                let clientId = await clientMap.getClientId(socket.id)
                await userRepo.setPosition(clientId, movement)
                let nearby = await userRepo.getNearby(clientId, nearbyThreshold)
                roomio.to(rid).emit('onMovePlayer', {id: clientId, x: movement.x, y: movement.y})
                socket.emit('nearby', {nearby: nearby, threshold: nearbyThreshold})
            })

            // Update client name in database, relay to everonye in room.
            socket.on('onNameChanged', async name => {
                let clientId = await clientMap.getClientId(socket.id)
                await userRepo.setName(clientId, name)

                roomio.to(rid).emit('onNameChanged', {id: clientId, name: name})
            })

            // Remove the client from databases and notify everyone of disconnect in room.
            socket.on('disconnect', async () => {
                let clientId = await clientMap.getClientId(socket.id)
                await userRepo.deleteUser(clientId)

                roomio.to(rid).emit('onUserDisconnected', clientId)
            })
        })

        return roomio
    },
}