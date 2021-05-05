const namespaceName = 'rooms'
var namespace;

module.exports = function(io) {
    namespace = io.of('/' + namespaceName)
    console.log(namespaceName + " initialized..")
    return namespace
}