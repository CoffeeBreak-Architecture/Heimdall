const express = require("express");
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const rooms = require('./rooms')
const signalling = require('./signalling')

app.get("/", (req, res) => {
    res.send("Test");
})

rooms.init(io, app)
signalling.init(io)

http.listen("3001", () => {
    console.log("Heimdall is running!")
})