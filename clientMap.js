util = require('util')
mysql = require('mysql2')

const createTableQuery = 'CREATE TABLE IF NOT EXISTS clientSocketIdMap ( socketId VARCHAR(24) PRIMARY KEY, clientId CHAR(36), namespace VARCHAR(32) )'

// This section of code repeats in several services that access databases. Could it be turned into a reusable mordule? Repeating code is a big no-no, but the benifit and complexity of extracting something so specific to it's use case might not be worth it.
const con = mysql.createPool ({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

databaseQuery = util.promisify(con.query).bind(con)

initalizeDatabase()

async function initalizeDatabase () {
    console.log(createTableQuery)
    await databaseQuery(createTableQuery)
}

module.exports = {
    getClientId: async function (socketId) {
        const rows = await databaseQuery('SELECT clientId FROM clientSocketIdMap WHERE socketId = ?', [socketId])
        if (rows.length == 1) {
            return await rows[0].clientId
        }
        return undefined
    },

    getSocketId: async function (clientId, namespace) {
        const rows = await databaseQuery('SELECT socketId FROM clientSocketIdMap WHERE clientId = ? AND namespace = ?', [clientId, namespace])
        if (rows.length == 1) {
            return await rows[0].socketId
        }
        return undefined
    },

    addClient: async function (clientId, socketId, namespace) {
        await databaseQuery('INSERT INTO clientSocketIdMap VALUES (?, ?, ?)', [socketId, clientId, namespace])
    },
    
    removeClient: async function (socketId, namespace) {
        await databaseQuery('DELETE FROM clientSocketIdMap WHERE socketId = ? AND namespace = ?', [socketId, namespace])
    },

    disposeDatabase: function () {
        con.end()
    }
}