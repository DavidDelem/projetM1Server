const low = require('lowdb');
const db = low('data/rappels.json', {storage: require('lowdb/lib/storages/file-async') });

var getAll = function(callback) {
    callback(db.get('rappels').sortBy('nbJours').value());
}

var add = function (nbJours, callback) {
    db.get('rappels').push({ nbJours: parseInt(nbJours)}).write().then(function(rappels){
        callback(rappels);
    });
}

var remove = function (nbJours, callback) {
    db.get('rappels').remove({ nbJours: parseInt(nbJours) }).write().then(function(rappels){
        callback(rappels);
    });
}

var count = function(nbJours, callback) {
    callback(db.get('rappels').filter({nbJours: parseInt(nbJours)}).size().value());
}

var getConfiguration = function(callback) {
    callback(db.get('configuration').value());
}

var activerRappels = function(callback) {
    db.get('configuration').assign({ activation: true }).write().then(function(configuration){
        callback(configuration);
    });
}

var desactiverRappels = function(callback) {
    db.get('configuration').assign({ activation: false }).write().then(function(configuration){
        callback(configuration);
    });
}
    
module.exports = {
    /* Récupération de la liste des rappels */
    getAll: getAll,
    /* Ajout d'un rappel à partir d'un nombre de jours */
    add: add,
    /* Suppression d'un rappel à partir d'un nombre de jours */
    remove: remove,
    /* Récupération du nombre total de rappels */
    count: count,
    /* Récupération de l'activation des rappels */
    activerRappels: activerRappels,
    desactiverRappels: desactiverRappels,
    getConfiguration: getConfiguration

}