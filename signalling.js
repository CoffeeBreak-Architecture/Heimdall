const clientMap = require('./clientMap')

const namespaceName = 'signalling'
var signalling;

module.exports = {
    init: function(io) {
        signalling = io.of('/' + namespaceName)
        console.log(namespaceName + " initialized..")
    
        signalling.on('connection', socket => {

            socket.on('login', clientId => {
                clientMap.addClient(clientId, socket.id, namespaceName)
            })

            // Recieve, figure out who to send it to through clientMap, send it to figured out person.
            socket.on('message', async message => {
                socketId = await clientMap.getSocketId(message.to, namespaceName)
                console.log('sending ' + message.message.type + ' type message to ' + message.to + ' from ' + message.from)
                signalling.to(socketId).emit('message', message)
            })
        })
    
        return signalling
    }
}