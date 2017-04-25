module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');

    var invitationsDAO = require('../dao/invitationsjson.js');
    var mail = require('../mail/mail.js');
    
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
     
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());


    app.put("/invitations/:invitation/validationbiodatas", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            invitationsDAO.addToHistorique(req.params.invitation, 'VALIDATION_BIODATAS', function(historique) {
                /* ENVOI MAIL */
                res.json(historique);
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    app.put("/invitations/:invitation/refusbiodatas", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            /* ENVOI MAIL */
                mail.sendReponseNonValider("biodataisen@gmail.com", function(response) {
                 callback();
            });
            invitationsDAO.addToHistorique(req.params.invitation, 'REFUS_BIODATAS', function(historique) {
                res.json(historique);
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    app.put("/invitations/:invitation/transfertautorites", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            /* ENVOI MAIL */
            invitationsDAO.addToHistorique(req.params.invitation, 'TRANSFERT_AUTORITES', function(historique) {
                res.json(historique);
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    app.put("/invitations/:invitation/demandeaccessok", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            /* ENVOI MAIL */
            mail.sendReponseValider("biodataisen@gmail.com", function(response) {
             callback();
        });
            invitationsDAO.addToHistorique(req.params.invitation, 'DEMANDE_ACCESS_OK', function(historique) {
                res.json(historique);
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    app.put("/invitations/:invitation/demandeaccessko", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            /* ENVOI MAIL */
            mail.sendReponseNonValiderAu("biodataisen@gmail.com", function(response) {
             callback();
        });
            invitationsDAO.addToHistorique(req.params.invitation, 'DEMANDE_ACCESS_KO', function(historique) {
                res.json(historique);
            });
        } else {
            res.sendStatus(401);
        }
    });
    
        app.put("/invitations/:invitation/retour", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            invitationsDAO.retourHistorique(req.params.invitation, function(historique) {
                mail.sendMail(function(){
                    res.json(historique);
                });
                
            });
        } else {
            res.sendStatus(401);
        }
    });
}