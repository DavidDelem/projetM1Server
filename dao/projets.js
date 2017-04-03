const low = require('lowdb');
const db = low('data/projets.json', {storage: require('lowdb/lib/storages/file-async') });
var uuid = require('node-uuid');
var moment = require('moment');

var getAll = function(dateDebut, dateFin, callback) {
    //callback(db.get('projets').cloneDeep().value());
    dateDebut = moment(dateDebut, 'DD/MM/YYYY').format('YYYY-MM-DD');
    dateFin = moment(dateFin, 'DD/MM/YYYY').format('YYYY-MM-DD');

    callback(db.get('projets').filter(projet => moment(moment(projet.dateCreation, 'DD/MM/YYYY').format('YYYY-MM-DD')).isSameOrAfter(dateDebut)
                                      && moment(moment(projet.dateCreation, 'DD/MM/YYYY').format('YYYY-MM-DD')).isSameOrBefore(dateFin)).cloneDeep().value());
}

var getByIdentifiant = function(identifiant, callback) {
    callback(db.get('projets').find({ identifiant: identifiant }).cloneDeep().value());
}

var add = function (nom, dateLimite, profil, callback) {
    var dateCreation = moment().format('DD/MM/YYYY');
    db.get('projets').push({ identifiant: uuid.v4(),
                             nom: nom,
                             dateCreation: dateCreation,
                             dateLimite: dateLimite,
                             profil: profil}).write().then(function(projets){
        callback(projets);
    });
}

var updateInfos = function(identifiant, nom, dateLimite, profil, callback) {
    db.get('projets').find({ identifiant: identifiant }).assign({ nom: nom,
                                                                  dateLimite: dateLimite,
                                                                  profil: profil }).write().then(function(projets){
        callback(projets);
    });
}

var remove = function(identifiant, callback) {
    db.get('projets').remove({ identifiant: identifiant }).write().then(function(projets) {
        callback(projets);
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
    remove: remove
}