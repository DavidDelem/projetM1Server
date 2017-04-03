const low = require('lowdb');
const db = low('data/profils.json', {storage: require('lowdb/lib/storages/file-async') });
var _ = require('lodash');
var uuid = require('node-uuid');

var getAll = function(callback) {
    var profils = [];
    _.mapValues(db.get('profils').value(), function(profil) {
        profils.push({nom: profil.nom, identifiant: profil.identifiant});
    });
    callback(profils);
}

var getOne = function(identifiant, callback) {
    callback(db.get('profils').find({ identifiant: identifiant }).value());
}

var add = function (nom, callback) {
    db.get('profils').push({ identifiant: uuid.v4(), nom: nom, champs: {}}).write().then(function(rappels){
        callback(rappels);
    });
}

var update = function (identifiant, nouveauNom, callback) {
    db.get('profils').find({ identifiant: identifiant }).assign({ nom: nouveauNom}).write().then(function(profils){
        callback(profils);
    });
}

var setChamps = function (identifiant, champs, callback) {
    db.get('profils').find({ identifiant: identifiant }).assign({champs: champs }).write().then(function(profils){
        callback(profils);
    });
}

var remove = function (identifiant, callback) {
    db.get('profils').remove({ identifiant: identifiant }).write().then(function(profils){
        callback(profils);
    });
}
    
module.exports = {
    /* Récupération de la liste de tous les profils de formulaires */
    getAll: getAll,
    /* Récupération du détail d'un profil de formulaire à partir de son identifiant */
    getOne: getOne,
    /* Création d'un profil de formulaire à partir de son nom */
    add: add,
    /* Mise à jours du nom d'un profil de formulaire à partir de son identifiant */
    update: update,
    /* Mise à jours des champs d'un profil de formulaire à partir de son identifiant */
    setChamps: setChamps,
    /* Suppression d'un profil de formulaire à partir de son identifiant*/
    remove: remove
}