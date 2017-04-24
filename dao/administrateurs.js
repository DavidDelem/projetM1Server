const low = require('lowdb');
const db = low('data/administrateurs.json', {storage: require('lowdb/lib/storages/file-async') });

var getAll = function(callback) {
    callback(db.get('administrateurs').value());
}

var getByIdentifiantAndPassword = function(identifiant, password, callback) {
    callback(db.get('administrateurs').filter({identifiant: identifiant, password: password}).take(1).value());
}

var getByIdentifiant = function(identifiant, callback) {
    callback(db.get('administrateurs').filter({identifiant: identifiant}).take(1).value());
}

var add = function (identifiant, password, callback) {
    db.get('administrateurs').push({ identifiant: identifiant, password: password }).write().then(function(administrateurs) {
        callback(administrateurs);
    });
}

var remove = function (identifiant, callback) {
    db.get('administrateurs').remove({ identifiant: identifiant }).write().then(function(administrateurs){
        callback(administrateurs);
    });
}

module.exports = {
    /* Récupération de la liste de tous les administrateurs */
    getAll: getAll,
    /* Récupération d'un administrateur à partir d'un identifiant et d'un mot de passe */
    getByIdentifiantAndPassword: getByIdentifiantAndPassword,
    /* Récupération d'un administrateur à partir d'un identifiant */
    getByIdentifiant: getByIdentifiant,
    /* Ajout d'un compte administrateur à partir d'un identifiant et d'un mot de passe */
    add: add,
    /* Suppression d'un compte administrateur à partir d'un identifiant */
    remove: remove
}