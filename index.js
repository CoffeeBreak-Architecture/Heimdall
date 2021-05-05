const express = require("express");
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors');
const { allowedNodeEnvironmentFlags } = require("process");
const axios = require("axios").default;

const rooms = require('./rooms')(io)
const signalling = require('./signalling')(io)

http.listen("3001", () => {
    console.log("Heimdall is running!")
})