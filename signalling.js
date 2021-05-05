const namespaceName = 'signalling'
var namespace;

module.exports = function(io) {
    namespace = io.of('/' + namespaceName)
    console.log(namespaceName + " initialized..")
    return namespace
}