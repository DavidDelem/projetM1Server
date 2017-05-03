const low = require('lowdb');
const db = low('data/invitations.json', {storage: require('lowdb/lib/storages/file-async') });
var _ = require('lodash');
var uuid = require('node-uuid');
var shortid = require('shortid');

var getByProjet = function(identifiantProjet, callback) {

    var invitations = [];
    _.mapValues(db.get('invitations').filter({identifiantProjet: identifiantProjet}).cloneDeep().value(), function(invitation) {
        invitations.push({ identifiant: invitation.identifiant,
                           email: invitation.email,
                           nom: invitation.nom,
                           prenom: invitation.prenom,
                           identifiantParent: invitation.identifiantParent,
                           historique: invitation.historique });
    });
    callback(invitations);
}

var getByIdentifiantAndPassword = function(identifiant, password, callback) {
    callback(db.get('invitations').filter({identifiant: identifiant, password: password}).take(1).value());
}

var getByIdentifiant = function(identifiant, callback) {
    callback(db.get('invitations').filter({identifiant: identifiant}).take(1).value());
}

var getByInvitationParent = function(identifiantParent, callback) {
    callback(db.get('invitations').filter({identifiantParent: identifiantParent}).sortBy('date').value());
}

var getByEmail = function(email, callback) {
    callback(db.get('invitations').filter({email: email}).value());
}

var add = function (identifiantProjet, email, identifiantParent, callback) {
    var historique = {
        date: Date.now(),
        type: "RECEPTION_INVITATION"
    };
    
    var identifiant = shortid.generate();
    
    db.get('invitations').push({identifiant: identifiant,
                                password: shortid.generate(),
                                email: email,
                                nom: "",
                                prenom: "",
                                identifiantProjet: identifiantProjet,
                                identifiantParent: identifiantParent,
                                historique: [ historique ]}).write().then(function(invitations) {
        callback(identifiant);
    });
}

var updateIdentite = function (identifiant, nom, prenom, callback) {
    
    db.get('invitations').find({ identifiant: identifiant }).assign({ nom: nom, prenom: prenom}).write().then(function(invitations){
        callback(invitations);
    });
    
}

var remove = function (identifiant, callback) {
    db.get('invitations').remove({ identifiant: identifiant }).write().then(function(invitations){
        callback(invitations);
    });
}

var removeByProjet = function (identifiantProjet, callback) {
    db.get('invitations').remove({ identifiantProjet: identifiantProjet }).write().then(function(invitations){
        callback(invitations);
    });
}

var getHistorique = function(identifiant, callback) {
    var historique = [];
    _.mapValues(db.get('invitations').filter({identifiant: identifiant}).cloneDeep().value(), function(invitation) {
        historique.push({historique: invitation.historique});
    });
    callback(historique[0].historique);
}

var addToHistorique = function(identifiant, type, callback) {
    getHistorique(identifiant, function(historique) {
        
       var nouvelHistorique = historique;
       nouvelHistorique.push({date: Date.now(), type: type});

       db.get('invitations').find({ identifiant: identifiant }).assign({ historique: nouvelHistorique }).write().then(function(invitation){
            callback(invitation);
       });
   });
}

var removeHistorique = function(identifiant, callback) {
    db.get('invitations').filter({identifiant: identifiant}).assign({ historique: []}).write().then(function(invitations){
            callback(invitations);
    });
}

var retourHistorique = function(identifiant, callback) {
    getHistorique(identifiant, function(historique) {
        
       var nouvelHistorique = historique;
       nouvelHistorique.pop();
     

       db.get('invitations').find({ identifiant: identifiant }).assign({ historique: nouvelHistorique }).write().then(function(invitation){
            callback(invitation);
     });
   });
}


module.exports = {
    /* Récupération de la liste des invitations liés à un projet à partir de l'identifiant d'un projet */
    getByProjet: getByProjet,
    /* Récupération d'une invitation à partir d'un identifiant et d'un mot de passe */
    getByIdentifiantAndPassword: getByIdentifiantAndPassword,
    /* Récupération d'une invitation à partir d'un identifiant */
    getByIdentifiant: getByIdentifiant,
    /* Récupération de la liste des invitations déléguées à partir d'un identifiant */
    getByInvitationParent: getByInvitationParent,
    /* Ajout d'une invitation à partir d'un mot de passe, email, nom de projet */
    add: add,
    /* Mise à jours du nom et du prénom d'une invitation à partir d'un identifiant */
    updateIdentite: updateIdentite,
    /* Suppression d'une invitation à partir de l'identifiant */
    remove: remove,
    /* Suppression des invitations à partir d'un identifiant de projets */
    removeByProjet: removeByProjet,
    /* Récupération de l'historique */
    getHistorique: getHistorique,
    /* Ajouter un élément à l'historique */
    addToHistorique: addToHistorique,
    /* Suppression d'un élément de l'historique */
    removeHistorique: removeHistorique,
    /* Annulation de la dernier action */
    retourHistorique: retourHistorique,
    /*oublie du mot de pass */
    getByEmail: getByEmail
}