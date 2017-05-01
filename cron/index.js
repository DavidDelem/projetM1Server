var CronJob = require('cron').CronJob;
var moment = require('moment');

var projets = require('../dao/projets.js');
var rappels = require('../dao/rappels.js');
var invitations = require('../dao/invitationsjson.js');
var historique = require('../dao/historique.js');

var mail = require('../mail/mail.js');

/* Controle de l'atteinte de la date limite */
new CronJob('00 00 06 * * *', function() { // */3 * * * * *
    
    var date = moment().startOf('day').format('x');
    projets.getAll('dateLimite', date - 10, date, function(projets) {
        for(var projet of projets) {  
            historique.add('DATE_LIMITE_ATTEINTE', projet.identifiant, function(response) {           
            });
        }      
    }); 
    
}, null, true, 'America/Los_Angeles');

/* Controle de l'envoi de toutes les biodatas */
new CronJob('00 00 08 * * *', function() { // */3 * * * * *
    
    var dateDebut = moment().startOf('day').format('x');
    var dateFin = moment().add(2, 'years').startOf('day').format('x');
    var toutesBiodatasEnvoyees = true;
    
    projets.getAll('dateLimite', dateDebut - 10, dateFin, function(projets) {
        for(var projet of projets) {  
            invitations.getByProjet(projet.identifiant, function(invitations) {
                for(var invitation of invitations) {
                    var lastHistorique = invitation.historique[invitation.historique.length-1];
                        if(lastHistorique.type == 'RECEPTION_INVITATION') {
                            toutesBiodatasEnvoyees = false;
                        }
                }
                
                if(toutesBiodatasEnvoyees) {
                     historique.add('TOUTES_BIODATAS_ENVOYEES', projet.identifiant, function(response) {
                     });
                }
            });
        }      
    }); 
    
}, null, true, 'America/Los_Angeles');

/* Envoi des emails de rappel */
new CronJob('00 00 14 * * *', function() { // */3 * * * * *
    
      rappels.getAll(function(rappels) {
          for(var rappel of rappels) {
              var date = moment().add(rappel.nbJours, 'days').startOf('day').format('x');
              projets.getAll('dateLimite', date - 10, date, function(projets) {
                  for(var projet of projets) {
                      invitations.getByProjet(projet.identifiant, function(invitations) {
                          for(var invitation of invitations) {
                              var lastHistorique = invitation.historique[invitation.historique.length-1];
                              if(lastHistorique.type == 'RECEPTION_INVITATION') {
                                mail.sendRappel(invitation.email, projet.dateLimite, function(response) {
                                    res.sendStatus(200);
                                });
                              }
                          }
                      });
                  }      
              });  
          }
      });
    
    
}, null, true, 'America/Los_Angeles');

// Contrôle si tout les gens liés à un projet ont envoyé leurs biodatas 