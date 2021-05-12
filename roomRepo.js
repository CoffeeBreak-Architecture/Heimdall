const axios = require('axios')

module.exports = {
    getRoom: async function (roomId) {
        return (await axios.get(process.env.ROOM_REPOSITORY + '/rooms/' + roomId)).data
    }
}