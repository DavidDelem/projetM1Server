//var knex = require('knex')({
//    dialect: 'mysql',
//    connection: {
//        host     : '127.0.0.1',
//        user     : 'root',
//        password : '',
//        database : 'seatestbase'
//    }
//});
//
//var getByProjet = function(nomProjet, callback) {
//    knex('invitations').where({nom_projet: nomProjet}).select('email', 'nom', 'prenom', 'identifiant_parent').then(function(result) { 
//        callback(result);
//    });
//}
//
//var getByInvitationParent = function(identifiantParent, callback) {
//    knex('invitations').select('email').where('identifiant_parent', '=', identifiantParent).then(function(result) { 
//        callback(result);
//    });
//}
//
//var add = function (invitationDTO, callback) {
//     knex('invitations').returning(['identifiant', 'password']).insert({identifiant: invitationDTO.nom,
//                                                                        password: invitationDTO.password,
//                                                                        email: invitationDTO.email,
//                                                                        nom: invitationDTO.nom,
//                                                                        prenom: invitationDTO.prenom,
//                                                                        nom_projet: invitationDTO.nomProjet,
//                                                                        identifiant_parent: invitationDTO.identifiantParent}).then(function(result) {
//        callback(result);
//     }); 
//}
//
//var updateIdentite = function (invitationDTO, callback) {
//    knex('invitations').where('identifiant', '=', invitationDTO.identifiant).update({nom: invitationDTO.nom, prenom: invitationDTO.prenom}).then(function(result){  
//       callback(result);
//    });
//}
//
//var remove = function (identifiant, callback) {
//    knex('invitations').where('identifiant', '=', identifiant).del().then(function(result){
//        callback(result);
//    });
//}
//    
//module.exports = {
//    getByProjet: getByProjet,
//    getByInvitationParent: getByInvitationParent,
//    add: add,
//    updateIdentite: updateIdentite,
//    remove: remove
//}