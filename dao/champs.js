const config = require('../config.json');
const low = require('lowdb');
const db = low(config.baseDossierData + 'champs.json', {storage: require('lowdb/lib/storages/file-async') });

var getAll = function(callback) {
    callback(db.get('champs').value());
}

module.exports = {
    /* Récupération de la liste de tout les champs de formulaire possibles */
    getAll: getAll
}