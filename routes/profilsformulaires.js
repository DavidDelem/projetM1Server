module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var profilsDAO = require('../dao/profilsformulaires.js');
    var champsDAO = require('../dao/champs.js');
    var projetsDAO = require('../dao/projets.js');
    
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
    var _ = require('lodash');
     
    app.use(auth.initialize());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    /* Récupération de la liste des profils de formulaires */
    
    app.get("/profils", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            profilsDAO.getAll(function(profils) {
                res.json(profils);
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Récupération du détail d'un profil de formulaire */
    
    app.get("/administrateur/profils/champs", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
                profilsDAO.getOne(req.query.profil, function(profil) {
                    champsDAO.getAll(function(champs) {
                        async.eachSeries(champs, function iteratee(champ, callback) {

                            if(_.find(profil.champs, { 'identifiant': champ.identifiant, 'obligatoire': true })) {
                                champ.coche = true;
                                champ.obligatoire = true;
                            } else if(_.find(profil.champs, { 'identifiant': champ.identifiant, 'obligatoire': false })) {
                                champ.coche = true;
                                champ.obligatoire = false;

                            } else {
                                champ.coche = false;
                                champ.obligatoire = false;
                            }
                            callback();

                        }, function done() {
                            res.json(champs);
                        });

                    });
                });
        } else {
            res.sendStatus(401);
        }
    });
    
        /* Récupération du détail d'un profil de formulaire */
    
    app.get("/visiteur/profils/champs", auth.authenticate(), function(req, res) {  
        if (req.user.type == 'visiteur') {
            projetsDAO.getByIdentifiant(req.user.projet, function(projet) {
                console.log(projet);
                profilsDAO.getOne(projet.profil, function(profil) {
                    champsDAO.getAll(function(champs) {
                        async.eachSeries(champs, function iteratee(champ, callback) {

                            if(_.find(profil.champs, { 'identifiant': champ.identifiant, 'obligatoire': true })) {
                                champ.coche = true;
                                champ.obligatoire = true;
                            } else if(_.find(profil.champs, { 'identifiant': champ.identifiant, 'obligatoire': false })) {
                                champ.coche = true;
                                champ.obligatoire = false;

                            } else {
                                champ.coche = false;
                                champ.obligatoire = false;
                            }
                            callback();

                        }, function done() {
                            var champsFinaux = _.filter(champs, function(champ) {
                                return champ.coche === true;
                            });
                            res.json(champsFinaux);
                        });

                    });
                });
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Modification des champs d'un profil de formulaire         */
    /* Type: POST                                                */
    /* Paramètres: profil -> nom du profil                       */ 
    /* Paramètres: champs -> liste des champs                    */ 
    
    app.post("/administration/profils/champs", function(req, res) {  

            var champs = [];
            async.eachSeries(req.body.champs, function iteratee(champ, callback) {
                if(champ.coche === true) {
                    champs.push({"identifiant": champ.identifiant, "obligatoire": champ.obligatoire});
                }
                callback();
                        
            }, function done() {
                profilsDAO.setChamps(req.body.profil, champs, function(result) {
                    res.json(result);
                });
            });
        
    });
    
    /* Création d'un profil de formulaire                        */
    /* Type: POST                                                */
    /* Paramètres: profil -> nom du profil                       */ 
    
    app.post("/administration/profils", function(req, res) {  
        profilsDAO.add(req.body.profil, function(profils) {
            res.sendStatus(200);
        });
    });
    
    /* Modificationd'un profil de formulaire                     */
    /* Type: PUT                                                 */
    /* Paramètres: profil -> identifiant du profil à supprimer   */  
    
//    app.put("/profils/:profil", auth.authenticate(), function(req, res) {  
//        if (req.user.type === 'administrateur') {
//            profilsDAO.update(req.params.profil, req.body.nouveauNom, function(profils) {
//                res.sendStatus(200);
//            });
//        } else {
//            res.sendStatus(401);
//        }
//    });
    
    /* Suppression d'un profil de formulaire                     */
    /* Type: DELETE                                              */
    /* Paramètres: profil -> identifiant du profil à supprimer   */  
    
    app.delete("/administration/profils", function(req, res) {  
        profilsDAO.remove(req.body.profil, function(result) {
            res.sendStatus(200);
        });
    });
    
}