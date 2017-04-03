//const low = require('lowdb');
//const db = low('data/invitations.json', {storage: require('lowdb/lib/storages/file-async') });
//var _ = require('lodash');
//var uuid = require('node-uuid');
//var moment = require('moment');
//
//var getHistorique = function(identifiant, callback) {
//    var historique = [];
//    _.mapValues(db.get('invitations').filter({identifiant: identifiant}).cloneDeep().value(), function(invitation) {
//        historique.push({historique: invitation.historique});
//    });
//    console.log(historique);
//    callback(historique[0].historique);
//}
//
//var addToHistorique = function(identifiant, type, callback) {
//    //getHistorique(identifiant, function(historique) {
//        
//       var nouvelHistorique = [ {
//          "date": 1490107493246,
//          "type": "RECEPTION_INVITATION"
//        },
//        {
//          "date": 1490107593246,
//          "type": "ENVOI_BIODATAS"
//        },
//        {
//          "date": 1491083094389,
//          "type": "VALIDATION_BIOTATAS"
//        } ];
//       //nouvelHistorique.push({date: Date.now(), type: type});
//
//       db.get('invitations').find({ identifiant: identifiant }).assign({ historique: nouvelHistorique }).write().then(function(invitation){
//            callback(invitation);
//       });
//   // });
//}
//
//var removeHistorique = function(identifiant, callback) {
//    db.get('invitations').filter({identifiant: identifiant}).assign({ historique: []}).write().then(function(invitations){
//            callback(invitations);
//    });
//}
//
//
//module.exports = {
//    /* Récupération de l'historique du dossier à partir d'un identifiant */
//    getHistorique: getHistorique,
//    /* Insertion d'un nouvel événement dans l'historique à partir d'un identifiant */
//    addToHistorique: addToHistorique,
//    /* Suppression de l'historique à partir d'un identifiant */
//    removeHistorique: removeHistorique,
//}