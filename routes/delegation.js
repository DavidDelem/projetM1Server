module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var invitationsDAO = require('../dao/invitations.js');
    var projetsDAO = require('../dao/projets.js');
    var historiqueDAO = require('../dao/historique.js');
    var mail = require('../mail/mail.js');
        
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
    
    var moment = require('moment');
    var _ = require('lodash');
    
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    
    /* Authentification                                     */
    
    app.use('/visiteurs', auth.authenticate(), function (req, res, next) {
        if(req.user.type === 'visiteur') {
            next(); 
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Savoir si la délégation d'invitation est activée ou non  */
    /* Type: GET                                                */
    /* Paramètres: AUCUNS                                       */
    
    app.get("visiteurs/invitation/delegation", auth.authenticate(), function(req, res) {  
        if(req.user.projet) {
            projetsDAO.getByIdentifiant(req.user.projet, function(projet) {
                res.json(projet.delegation);
            });
        } else {
            res.sendStatus(400);
        }
    });

    /* Délégation de son invitation                                          */
    /* Type: POST                                                            */
    /* Paramètres: emails -> Liste d'emails à qui l'invitation sera déléguée */
    
    app.post("visiteurs/invitation/delegation", auth.authenticate(), function(req, res) {  
            if(req.body.emails && req.user.projet && req.user.identifiant) {
                projetsDAO.getByIdentifiant(req.user.projet, function(projet) {
                    if(projet.delegation == true) {
                        async.eachSeries(req.body.emails, function iteratee(email, callback) {
                            if(email.value && email.value != '') {
                                invitationsDAO.add(req.user.projet, email.value, req.user.identifiant, function(identifiantInvitation) {
                                    invitationsDAO.getByIdentifiant(identifiantInvitation, function(invitation) {
                                        mail.sendInvitation(invitation[0].email, invitation[0].identifiant, invitation[0].password, 'DATE_LIMITE', function(response) {
                                            callback();
                                        });
                                    });
                                });   
                            } else {
                                callback();
                            }
                        }, function done() {
                            var details = { nom: projet.nom, identifiant: projet.identifiant }
                            historiqueDAO.add('DELEGATION_INVITATION', details, function(response) {
                                res.sendStatus(200);
                            });
                        });
                    } else {
                        res.sendStatus(400); 
                    } 
                });
                
            } else {
                res.sendStatus(400);
            }
    });

}