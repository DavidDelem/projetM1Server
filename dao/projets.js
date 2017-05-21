const low = require('lowdb');
const db = low('data/projets.json', {storage: require('lowdb/lib/storages/file-async') });
var uuid = require('node-uuid');
var moment = require('moment');

var getAll = function(tris, dateDebut, dateFin, callback) {
    if(tris == 'dateLimite') {
        callback(db.get('projets').filter(projet => projet.dateLimite - 10 >= dateDebut && projet.dateLimite <= dateFin).cloneDeep().sortBy('dateLimite').value());
    } else {
        console.log('Tris par date de Création');
        callback(db.get('projets').filter(projet => projet.dateCreation >= dateDebut && projet.dateCreation <= (dateFin + 10)).cloneDeep().sortBy('dateCreation').value());
    }
}

var getByIdentifiant = function(identifiant, callback) {
    callback(db.get('projets').find({ identifiant: identifiant }).cloneDeep().value());
}

var add = function (nom, dateLimite, profil, langue, callback) {
    var dateCreation = Date.now();
    db.get('projets').push({ identifiant: uuid.v4(),
                             nom: nom,
                             dateCreation: dateCreation,
                             dateLimite: dateLimite,
                             profil: profil,
                             langue: langue,
                             rappels: true,
                             delegation: true
                           }).write().then(function(projets){
        callback(projets);
    });
}

var updateInfos = function(identifiant, nom, dateLimite, profil, langue, callback) {
    db.get('projets').find({ identifiant: identifiant }).assign({ nom: nom,
                                                                  dateLimite: dateLimite,
                                                                  profil: profil,
                                                                  langue: langue}).write().then(function(projets){
        callback(projets);
    });
}

var remove = function(identifiant, callback) {
    db.get('projets').remove({ identifiant: identifiant }).write().then(function(projets) {
        callback(projets);
    });
}

var activerRappels = function(identifiant, callback) {
    db.get('projets').find({ identifiant: identifiant }).assign({ rappels: true }).write().then(function(configuration){
        callback(configuration);
    });
}

var desactiverRappels = function(identifiant, callback) {
    db.get('projets').find({ identifiant: identifiant }).assign({ rappels: false }).write().then(function(configuration){
        callback(configuration);
    });
}

var activerDelegation = function(identifiant, callback) {
    db.get('projets').find({ identifiant: identifiant }).assign({ delegation: true }).write().then(function(configuration){
        callback(configuration);
    });
}

var desactiverDelegation = function(identifiant, callback) {
    db.get('projets').find({ identifiant: identifiant }).assign({ delegation: false }).write().then(function(configuration){
        callback(configuration);
    });
}
    
module.exports = {
    /* Récupération de la liste de tous les projets */
    getAll: getAll,
    /* Récupération du détail d'un projet à partir de son identifiant */
    getByIdentifiant: getByIdentifiant,
    /* Ajout d'un projet */
    add: add,
    /* Mise à jours de la date limite, du nom et du profil associé à un projet à partir de son identifiant */
    updateInfos: updateInfos,
    /* Suppression d'un projet à partir de son identifiant */
    remove: remove,
    activerRappels: activerRappels,
    desactiverRappels: desactiverRappels,
    activerDelegation: activerDelegation,
    desactiverDelegation: desactiverDelegation
}