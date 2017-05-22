module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var invitationsDAO = require('../dao/invitations.js');
    var projetsDAO = require('../dao/projets.js');
    var profilsDAO = require('../dao/profilsformulaires.js');
    var mail = require('../mail/mail.js');
    
    var moment = require('moment');
    var _ = require('lodash');
    
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    
    /* Récupération de la liste des projets                                  */
    /* Type: GET                                                             */
    /* Paramètres: tris -> critère de tris                                   */
    /*             dateDebut -> date de début de la recherche                */
    /*             dateFin -> date de fin de la recherche                    */
    
    app.get("/administration/projets", function(req, res) {  
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
    });
    
    /* Récupération du détail d'un projet                                    */
    /* Type: GET                                                             */
    /* Paramètres: projet -> identifiant du projet                           */
    
    app.get("/administration/projets/:projet", function(req, res) {  
        if(req.params.projet) {
            projetsDAO.getByIdentifiant(req.params.projet, function(detail) {
                profilsDAO.getOne(detail.profil, function(profil) {
                    if(profil && profil.nom) {
                        console.log(detail);
                        detail.nomProfil = profil.nom;
                    }
                    res.json(detail);
                });
            }); 
        } else {
            res.json(400);
        }
    });
    
    /* Modification des caractéristiques d'un projet                         */
    /* Type: PUT                                                             */
    /* Paramètres: projet -> identifiant du projet                           */
    /*             nom -> nouveau nom                                        */
    /*             dateLimite -> nouvelle date limite                        */
    /*             profil -> nouveau profil                                  */
    /*             langue -> nouvelle langue                                 */
    
    app.put("/administration/projets/:projet", function(req, res) {  
        if(req.params.projet && req.body.nom && req.body.dateLimite && req.body.profil && req.body.langue) {
            projetsDAO.updateInfos(req.params.projet, req.body.nom, parseInt(req.body.dateLimite), req.body.profil, req.body.langue, function(projet) {
                res.sendStatus(200);
            }); 
        } else {
            res.sendStatus(400);
        }
    });
    
    /* Activation et désactivation des rappels pour le projet                */
    /* Type: PUT                                                             */
    /* Paramètres: projet -> identifiant du projet                           */
    /*             rappels -> true ou false                                  */
    
    app.put("/administration/projets/:projet/rappels", function(req, res) { 
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
    });
    
    /* Activation et désactivation de la délégation d'invitation pour le projet     */
    /* Type: PUT                                                                    */
    /* Paramètres: projet -> identifiant du projet                                  */
    /*             delegation -> true ou false                                      */
    
    app.put("/administration/projets/:projet/delegation", function(req, res) {
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
    });
    
    
    /* Suppression d'un projet                                                      */
    /* Type: DELETE                                                                 */
    /* Paramètres: projet -> identifiant du projet                                  */
    
    app.delete("/administration/projets/:projet", function(req, res) {  
        if(req.params.projet) {
            projetsDAO.remove(req.params.projet, function(detail) {
                invitationsDAO.removeByProjet(req.params.projet, function(invitations) {
                    res.json(invitations);
                });
            }); 
        } else {
            res.json(400);
        }
    });
        
    /* Récupération de la liste des invitations d'un projet pour un administrateur  */
    /* Type: GET                                                                    */
    /* Paramètres: projet -> identifiant du projet                                  */
    
    app.get("/administration/projets/:projet/invitations", function(req, res) {  
        if(req.params.projet) {
            invitationsDAO.getByProjet(req.params.projet, function(champs) {
                res.json(champs);
            }); 
        } else {
            res.sendStatus(400);
        }
    });

    /* Récupération de la liste des invitations d'un projet pour un visiteur        */
    /* Type: GET                                                                    */
    /* Paramètres: AUCUNS                                                           */
    
    app.get("/visiteurs/projets/invitations", function(req, res) {  
        invitationsDAO.getByProjet(req.user.projet, function(champs) {
            res.json(champs);
        }); 
    });
    
    /* Récupération des informations d'un projet pour un visiteur                   */
    /* Type: GET                                                                    */
    /* Paramètres: AUCUNS                                                           */
    
    app.get("/visiteurs/projets/datelimite", function(req, res) {  
        projetsDAO.getByIdentifiant(req.user.projet, function(projet) {
            console.log(projet);
            res.json(projet.dateLimite);
        }); 
    });
    
    /* Création d'un nouveau projet                     */
    /* Type: POST                                       */
    /* Paramètres: projet -> identifiant du projet      */
    /*             dateLimite -> date limite du projet  */
    /*             profil -> profil du projet           */
    /*             langue -> profil du projet           */
    
    app.post("/administration/projets", function(req, res) {  
        if(req.body.projet && req.body.dateLimite && req.body.profil && req.body.langue) { 
            projetsDAO.add(req.body.projet, parseInt(req.body.dateLimite), req.body.profil, req.body.langue, function(projets) {
                res.json(projets);
            }); 
        } else {
            res.sendStatus(400);
        }
    });
    
    /* Ajout d'invitations dans un projet                   */
    /* Type: POST                                           */
    /* Paramètres: projet -> identifiant du projet          */
    /*             emails -> liste d'emails de visiteurs    */
    
    app.post("/administration/projets/:projet/invitations", function(req, res) {  
        if(req.params.projet && req.body.emails) {
            projetsDAO.getByIdentifiant(req.params.projet, function(projet) {
                async.eachSeries(req.body.emails, function iteratee(email, callback) {
                    if(email.value != '') {
                        invitationsDAO.add(req.params.projet, email.value, "", function(identifiantInvitation) {
                            invitationsDAO.getByIdentifiant(identifiantInvitation, function(invitation) {
                                mail.sendInvitation(invitation[0].email,
                                                    invitation[0].identifiant,
                                                    invitation[0].password,
                                                    projet.langue,
                                                    moment(projet.dateLimite, 'x').format('DD/MM/YYYY'),
                                                    function(response) {
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
            });
        } else {
            res.sendStatus(400);
        }
    });
    
    /* Suppression d'invitation dans un projet par un administrateur    */
    /* Type: DELETE                                                     */
    /* Paramètres: identifiant -> identifiant du visiteur               */
    
    app.delete("/administration/projets/:projet/invitations", function(req, res) {  
        if(req.body.identifiant) {
            invitationsDAO.remove(req.body.identifiant, function(champs) {
                /* ENVOI MAIL */
                res.sendStatus(200);
            });  
        } else {
            res.sendStatus(400);
        }

    });
    
    /* Suppression d'invitation dans un projet par un visiteur   */
    /* Type: DELETE                                              */
    /* Paramètres: identifiant -> identifiant du visiteur        */
    
    app.delete("/visiteurs/projets/invitations", function(req, res) {  

        if(req.body.identifiant) {
            invitationsDAO.getByIdentifiant(req.body.identifiant, function(invitation) {
                if(invitation[0].identifiantProjet == req.user.projet && invitation[0].identifiantParent != '') {
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

    });

//    app.delete("/invitation", auth.authenticate(), function(req, res) {  
//        console.log("ttttt");
//       if (req.user.type === 'visiteur') {
//            console.log("ttttt");
//            if(req.user.identifiant) {
//                console.log("hhh");
//                invitationsDAO.remove(req.user.identifiant, function(champs) {
//                    console.log("hhh");
//                   
//                    res.sendStatus(200);
//                });  
//            } else {
//                res.sendStatus(400);
//            }
//        } else {
//            res.sendStatus(401);
//        }
//        
//    });

}