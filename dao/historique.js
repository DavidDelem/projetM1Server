const low = require('lowdb');
const db = low('data/historique.json', {storage: require('lowdb/lib/storages/file-async') });
var uuid = require('node-uuid');

var get = function(date, callback) {
    callback(db.get('historique').filter(historique => date <= historique.date).sortBy(date).value());
}

var add = function (type, projet, callback) {
    
    var details = {
        projet: projet
    };
    
    db.get('historique').push({identifiant: uuid.v4(),
                                date: Date.now(),
                                type: type,
                                lu: false,
                                details: details}).write().then(function(historique) {
        callback(historique);
    });
}

var update = function (identifiant, lu, callback) {
    db.get('historique').find({ identifiant: identifiant }).assign({ lu: lu}).write().then(function(historique){
        callback(historique);
    });
}

module.exports = {
    get: get,
    add: add,
    update: update
}