var CronJob = require('cron').CronJob;
var moment = require('moment');

var projets = require('../dao/projets.js');
var rappels = require('../dao/rappels.js');
var invitations = require('../dao/invitations.js');


var administrateursjson = require('../dao/administrateurs.js');

var mail = require('../mail/mail.js');

/* Envoi des emails de rappel */

new CronJob('*/2 * * * * *', function() {
//    administrateursjson.add('david.delemotte@gmail.com', 'abcd1234', function(rappels) {
//        console.log(rappels); 
//    });

}, null, true, 'America/Los_Angeles');

new CronJob('*/60 * * * * *', function() {
    
//      rappels.getAll(function(rappels) {
//          
//          for(var rappel of rappels) {
//              var date = moment().add(rappel.nbjours, 'days').format('YYYY-MM-DD');
//              
//              projets.getByDate(date, function(projets) {
//                  
//                  for(var projet of projets) {
//                      invitations.getByProjet(projet.nom, function(invitations) {
//                          for(var invitation of invitations) {
//                              // sendmail invitation.email rappel.nbjours
//                              mail.sendRappel(invitation.email, rappel.nbjours, function() {
//                                  
//                              });
//                          }
//                      });
//                  }
//                  
//                  
//              });
//              
//              
//          }
//      });
    
    
}, null, true, 'America/Los_Angeles');

// Contrôle si tout les gens liés à un projet ont envoyé leurs biodatas 