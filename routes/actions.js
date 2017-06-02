module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');

    var invitationsDAO = require('../dao/invitations.js');
    var projetsDAO = require('../dao/projets.js');
    var mail = require('../mail/mail.js');
    
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    /* Action validation des biodatas                           */
    /* Type: PUT                                                */
    /* Paramètres: invitation -> identifiant de l'invitation    */
    
    app.put("/administration/invitations/:invitation/validationbiodatas", function(req, res) {  
        invitationsDAO.getByIdentifiant(req.params.invitation, function(invitation) {
            projetsDAO.getByIdentifiant(invitation[0].identifiantProjet, function(projet) {
                invitationsDAO.addToHistorique(invitation[0].identifiant, 'VALIDATION_BIODATAS', function(historique) {
                    mail.sendReponseValidationBiodatas(invitation[0].email, projet.langue, function(response) {
                        res.sendStatus(200);
                    });
                });
            });
        });
    });
    
    /* Action refus des biodatas                                         */
    /* Type: PUT                                                         */
    /* Paramètres: invitation -> identifiant de l'invitation             */
    /*             envoiMail -> envoi d'un mail au visiteur si true      */
    /*             messageExplicatif -> message personalisé dans le mail */
    
    app.put("/administration/invitations/:invitation/refusbiodatas", function(req, res) {  
            invitationsDAO.getByIdentifiant(req.params.invitation, function(invitation) {
                projetsDAO.getByIdentifiant(invitation[0].identifiantProjet, function(projet) {
                    invitationsDAO.addToHistorique(invitation[0].identifiant, 'REFUS_BIODATAS', function(historique) {
                        if(req.body.envoiMail) {
                            mail.sendReponseRefusBiodatas(invitation[0].email, projet.langue, req.body.messageExplicatif || '', function(response) {
                                res.sendStatus(200);
                            });
                        } else {
                            res.sendStatus(200);
                        }
                    });
                });
            });
    });
    
    /* Action transfert aux autorités                               */
    /* Type: PUT                                                    */
    /* Paramètres: invitation -> identifiant de l'invitation        */
    
    app.put("/administration/invitations/:invitation/transfertautorites", function(req, res) {  
            invitationsDAO.addToHistorique(req.params.invitation, 'TRANSFERT_AUTORITES', function(historique) {
                res.sendStatus(200);
            });
    });
    
    /* Action validation de la demande d'accèspar les autorités          */
    /* Type: PUT                                                         */
    /* Paramètres: invitation -> identifiant de l'invitation             */
    /*             envoiMail -> envoi d'un mail au visiteur si true      */
    /*             message -> message personalisé dans le mail           */
    
    app.put("/administration/invitations/:invitation/demandeaccessok", function(req, res) {  
            invitationsDAO.getByIdentifiant(req.params.invitation, function(invitation) {
                projetsDAO.getByIdentifiant(invitation[0].identifiantProjet, function(projet) {
                    invitationsDAO.addToHistorique(invitation[0].identifiant, 'DEMANDE_ACCESS_OK', function(historique) {
                        if(req.body.envoiMail) {
                            mail.sendReponseValidationAutoritees(invitation[0].email, projet.langue, req.body.message || '', function(response) {
                                res.sendStatus(200);
                            });
                        } else {
                            res.sendStatus(200);
                        }
                    });
                });
            });
    });
    
    /* Action refus de la demande d'accès par les autorités              */
    /* Type: PUT                                                         */
    /* Paramètres: invitation -> identifiant de l'invitation             */
    /*             envoiMail -> envoi d'un mail au visiteur si true      */
    /*             message -> message personalisé dans le mail           */
    
    app.put("/administration/invitations/:invitation/demandeaccessko", function(req, res) {  

            invitationsDAO.getByIdentifiant(req.params.invitation, function(invitation) {
                projetsDAO.getByIdentifiant(invitation[0].identifiantProjet, function(projet) {
                    invitationsDAO.addToHistorique(invitation[0].identifiant, 'DEMANDE_ACCESS_KO', function(historique) {
                        if(req.body.envoiMail) {
                            var message = req.body.message || '';
                            mail.sendReponseRefusAutoritees(invitation[0].email, projet.langue, req.body.message || '', function(response) {
                                res.sendStatus(200);
                            });
                        } else {
                            res.sendStatus(200);
                        }
                    });
                });      
            });
    });
        
    /* Action retour à l'état précédent                         */
    /* Type: PUT                                                */
    /* Paramètres: invitation -> identifiant de l'invitation    */
    
    app.put("/administration/invitations/:invitation/retour", function(req, res) {  

        invitationsDAO.retourHistorique(req.params.invitation, function(historique) {
            res.sendStatus(200);
        });
        
    });
    
    /* Action envoi d'un message par mail à un visiteur         */
    /* Type: PUT                                                */
    /* Paramètres: invitation -> identifiant de l'invitation    */
    /* Paramètres: message -> message contenu dans l'email      */
    
    app.put("/administration/invitations/:invitation/message", function(req, res) {  

         if(req.body.message && req.body.message != '') {
            invitationsDAO.getByIdentifiant(req.params.invitation, function(invitation) {
                projetsDAO.getByIdentifiant(invitation[0].identifiantProjet, function(projet) {
                    mail.sendMessage(invitation[0].email, projet.langue, req.body.message, function(response) {
                        res.sendStatus(200);
                    });
                });
            });   
         } else {
            res.sendStatus(400);
         }
        
    });
    
    /* Action envoi d'un message aux administrateurs            */
    /* Type: PUT                                                */
    /* Paramètres: invitation -> identifiant de l'invitation    */
    /* Paramètres: message -> message contenu dans l'email      */
    
    app.put("/visiteurs/message", function(req, res) {  

         if(req.body.message && req.body.message != '') {
            console.log(req.body.message);
            res.sendStatus(200);
         } else {
            res.sendStatus(400);
         }
        
    });
}