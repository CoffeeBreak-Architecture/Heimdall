const expect = require('chai').expect
const userRepo = require('../userRepo')
const roomRepo = require('../roomRepo')
const axios = require('axios').default

describe('Repository integration', function () {

    describe('Room repository', function () {
        const url = process.env.ROOM_REPOSITORY

        this.afterEach('Room clean up', async function () {
            let rooms = await axios.get(url + '/rooms')
            rooms.data.forEach(async x => {
                await axios.delete(url + '/rooms/' + x.id)
            })
        })

        it ('getRoom', async function() {
            let room = await axios.post(url + '/rooms', {name: 'someName', socketUrl: 'someSocketUrl', signallingUrl: 'someSignallingUrl'})
            let recieved = await roomRepo.getRoom(room.data.id)
            expect(recieved.id).to.equal(room.data.id)
        })
    })

    describe('User repository', function () {
        const url = process.env.USER_REPOSITORY

        this.afterEach('User clean up', async function () {
            let rooms = await axios.get(url + '/users')
            rooms.data.forEach(async x => {
                await axios.delete(url + '/users/user/' + x.id)
            })
        })
        
        it ('addUser', async function () {
            let post = await userRepo.addUser('someName', 'someRoomId')
            let user = await axios.get(url + '/users/user/' + post.id)
            expect(post.id).to.equal(user.data.id)
        })

        it ('getMembers', async function () {
            await userRepo.addUser('someName', 'someRoomId')
            await userRepo.addUser('someName', 'someRoomId')
            let members = await userRepo.getMembers('someRoomId')
            expect(members.length).to.equal(2)
        })

        it ('setPosition', async function () {
            let post = await userRepo.addUser('someName', 'someRoomId')
            await userRepo.setPosition(post.id, {clientId: post.id, x: 200, y: 200})
            let user = await axios.get(url + '/users/user/' + post.id)
            expect(user.data.x).to.equal(200)
            expect(user.data.y).to.equal(200)
        })

        it ('getNearby', async function () {
            await userRepo.addUser('someName', 'someRoomId')
            await userRepo.addUser('someName', 'someRoomId')
            let post = await userRepo.addUser('someName', 'someRoomId')
            let nearby = await userRepo.getNearby(post.id, 512)
            expect(nearby.length).to.equal(2)
        })

        it ('setName', async function () {
            let post = await userRepo.addUser('someName', 'someRoomId')
            await userRepo.setName(post.id, 'someNewName')
            let user = await axios.get(url + '/users/user/' + post.id)
            expect(user.data.nickname).to.equal('someNewName')
        })

        it ('deleteUser', async function () {
            let post = await userRepo.addUser('someName', 'someRoomId')
            await userRepo.deleteUser(post.id)

            try {
                let response = await axios.get(url + '/users/' + post.id)
                expect(response.status).to.equal(404)
            }catch (error) {
                expect(error.response.status).to.equal(404)
            }
        })
    })
})