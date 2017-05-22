const config = require('../config.json');
const low = require('lowdb');
const db = low(config.baseDossierData + 'historique.json', {storage: require('lowdb/lib/storages/file-async') });
var _ = require('lodash');
var uuid = require('node-uuid');

var get = function(date, callback) {
    callback(_.reverse(db.get('historique').filter(historique => date <= historique.date).sortBy('date').cloneDeep().value()));
}

var add = function (type, details, callback) {
    
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