module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var invitationsDAO = require('../dao/invitationsjson.js');
    var projetsDAO = require('../dao/projets.js');
    var profilsDAO = require('../dao/profilsformulaires.js');
    var mail = require('../mail/mail.js');
        
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
    
    var moment = require('moment');
    var _ = require('lodash');
    
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    /* Récupération de la liste des projets */
    
    app.get("/projets", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.query.tris && req.query.dateDebut && req.query.dateFin) {
                projetsDAO.getAll(req.query.tris, req.query.dateDebut, req.query.dateFin, function(projets) {
                    async.eachSeries(projets, function iteratee(projet, callback) {
                        invitationsDAO.getByProjet(projet.identifiant, function(invitations) {

                            var etatProjet = { enAttente: 0, enCours: 0, termine: 0 }

                            async.eachSeries(invitations, function iteratee(invitation, callback) {
                                var lastHistorique = _.last(invitation.historique);

                                if(lastHistorique) {
                                    if(lastHistorique.type == 'DEMANDE_ACCESS_OK' || lastHistorique.type == 'DEMANDE_ACCESS_KO') {
                                        etatProjet.termine++;
                                    } else if(lastHistorique.type == 'RECEPTION_INVITATION') {
                                        etatProjet.enAttente++;
                                    } else if(lastHistorique.type == 'ENVOI_BIODATAS' || lastHistorique.type == 'REFUS_BIODATAS' || lastHistorique.type == 'VALIDATION_BIODATAS' || lastHistorique.type == 'TRANSFERT_AUTORITES') {
                                        etatProjet.enCours++;
                                    }
                                }
                                callback();
                            }, function done() {
                                projet.etatProjet = etatProjet;
                                callback();
                            });

                        });
                    }, function done() {
                        res.json(projets.reverse());
                    });
                });
            } else {
                res.json(400);
            }
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Récupération du détail d'un projet */
    
    app.get("/projets/:projet", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.params.projet) {
                projetsDAO.getByIdentifiant(req.params.projet, function(detail) {
                    profilsDAO.getOne(detail.profil, function(profil) {
                        if(profil && profil.nom) {
                            detail.nomProfil = profil.nom;
                        }
                        res.json(detail);
                    });
                }); 
            } else {
                res.json(400);
            }
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Modification des caractéristiques d'un projet */
    
    app.put("/projets/:projet", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.params.projet && req.body.nom && req.body.dateLimite && req.body.profil) {
                projetsDAO.updateInfos(req.params.projet, req.body.nom, parseInt(req.body.dateLimite), req.body.profil, function(projet) {
                   res.json(projet)
                }); 
            } else {
                res.json(400);
            }
        } else {
            res.sendStatus(401);
        }
    });
    
    
    /* Activation et désactivation des rappels pour le projet */
    
    app.put("/projets/:projet/rappels", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.body.rappels) {
                if(req.body.rappels == "true") {   
                    projetsDAO.activerRappels(req.params.projet, function(result) {
                        res.json(result);
                    });
                } else {
                    projetsDAO.desactiverRappels(req.params.projet, function(result) {
                        res.json(result);
                    });
                }
            } else {
                res.sendStatus(400);
            }
            
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Activation et désactivation de la délégation d'invitation pour le projet */
    
    app.put("/projets/:projet/delegation", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.body.delegation) {
                if(req.body.delegation == "true") {   
                    projetsDAO.activerDelegation(req.params.projet, function(result) {
                        res.json(result);
                    });
                } else {
                    projetsDAO.desactiverDelegation(req.params.projet, function(result) {
                        res.json(result);
                    });
                }
            } else {
                res.sendStatus(400);
            }
            
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Suppression d'un projet */
    
    app.delete("/projets/:projet", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.params.projet) {
                projetsDAO.remove(req.params.projet, function(detail) {
                    invitationsDAO.removeByProjet(req.params.projet, function(invitations) {
                        res.json(invitations);
                    });
                }); 
            } else {
                res.json(400);
            }
        } else {
            res.sendStatus(401);
        }
    });
    
        /* Récupération de la liste des invitations d'un projet */
    
    app.get("/projets/:projet/invitations", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.params.projet) {
                invitationsDAO.getByProjet(req.params.projet, function(champs) {
                    res.json(champs);
                }); 
            } else {
                res.sendStatus(400);
            }

        } else if(req.user.type === 'visiteur') {
            invitationsDAO.getByProjet(req.user.projet, function(champs) {
                res.json(champs);
            }); 
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Création d'un nouveau projet */
    
    app.post("/projets", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.body.projet && req.body.dateLimite && req.body.profil) { 
                projetsDAO.add(req.body.projet, parseInt(req.body.dateLimite), req.body.profil, function(projets) {
                    res.json(projets);
                }); 
            } else {
                res.sendStatus(400);
            }
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Ajout d'invitations dans un projet */
    
    app.post("/projets/:projet/invitations", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.params.projet && req.body.emails) {
                async.eachSeries(req.body.emails, function iteratee(email, callback) {
                    if(email.value != '') {
                        invitationsDAO.add(req.params.projet, email.value, "", function(identifiantInvitation) {
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
                    res.sendStatus(200);
                });
            } else {
                res.sendStatus(400);
            }
        } else {
            res.sendStatus(401);
        }
    });
    
    
    app.delete("/projets/:projet/invitations", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.body.identifiant) {
                invitationsDAO.remove(req.body.identifiant, function(champs) {
                    /* ENVOI MAIL */
                    res.json(champs);
                });  
            } else {
                res.sendStatus(400);
            }
        } else if(req.user.type === 'visiteur') {
            if(req.body.identifiant) {
                invitationsDAO.getByIdentifiant(req.body.identifiant, function(invitation) {
                    if(invitation[0].identifiantProjet == req.user.projet && invitation[0].identifiantParent != '') {
                        console.log(req.body.identifiant);
                        invitationsDAO.remove(req.body.identifiant, function(response) {
                            res.sendStatus(200);
                        });   
                    } else {
                        res.sendStatus(400);
                    }
                });
            } else {
                res.sendStatus(400);
            }
        } else {
            res.sendStatus(401);
        }

    });

    app.delete("/invitation", auth.authenticate(), function(req, res) {  
        console.log("ttttt");
       if (req.user.type === 'visiteur') {
            console.log("ttttt");
            if(req.user.identifiant) {
                console.log("hhh");
                invitationsDAO.remove(req.user.identifiant, function(champs) {
                    console.log("hhh");
                   
                    res.sendStatus(200);
                });  
            } else {
                res.sendStatus(400);
            }
        } else {
            res.sendStatus(401);
        }
        
    });

}