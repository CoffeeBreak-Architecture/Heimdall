const clientMap = require('./clientMap')

const namespaceName = 'signalling'
var namespace;

module.exports = {
    init: function(io) {
        namespace = io.of('/' + namespaceName)
        console.log(namespaceName + " initialized..")
    
        io.on('connection', socket => {

            socket.on('login', clientId => {
                clientMap.addClient(clientId, socket.id, namespaceName)
            })

            socket.on('message', message => {
                socketId = clientMap.getSocketId(message.to, namespaceName)
                io.to(socketId).emit('message', message)
            })
        })
    
        return namespace
    }
}