const expect = require('chai').expect
const map = require('../clientMap')

describe('Client map', function () {

    afterEach('Clean up someClientId', async function () {
        await map.removeClient('someSocketId', 'someNamespace')
        await map.removeClient('someOtherSocketId', 'someOtherNamespace')
    })

    this.afterAll('Dispose DB', function () {
        map.disposeDatabase()
    })

    it('addClient', async function () {
        expect(async () => await map.addClient('someClientId', 'someSocketId', 'someNamespace')).to.not.throw(Error)
    })

    it ('getClientId', async function () {
        await map.addClient('someClientId', 'someSocketId', 'someNamespace')
        let client = await map.getClientId('someSocketId')
        expect(client).to.equal('someClientId')
    })

    it ('Negative getClientId', async function () {
        await map.addClient('someClientId', 'someSocketId', 'someNamespace')
        let client = await map.getClientId('someOtherSocketId');
        expect(client).to.equal(undefined)
    })

    it ('getSocketId', async function () {
        await map.addClient('someClientId', 'someSocketId', 'someNamespace')
        await map.addClient('someClientId', 'someOtherSocketId', 'someOtherNamespace')

        expect(await map.getSocketId('someClientId', 'someNamespace')).to.equal('someSocketId')
        expect(await map.getSocketId('someClientId', 'someOtherNamespace')).to.equal('someOtherSocketId')
    })

    it ('removeClient', async function () {
        await map.addClient('someClientId', 'someSocketId', 'someNamespace')
        await map.removeClient('someSocketId', 'someNamespace')
        let client = await map.getClientId('someSocketId');
        expect(client).to.equal(undefined)
    })
})