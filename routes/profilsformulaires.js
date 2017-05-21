module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    var _ = require('lodash');
    
    var profilsDAO = require('../dao/profilsformulaires.js');
    var champsDAO = require('../dao/champs.js');
    var projetsDAO = require('../dao/projets.js');
     
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    /* Récupération de la liste des profils de formulaires */
    
    app.get("/administration/profils", function(req, res) {  
        profilsDAO.getAll(function(profils) {
            res.json(profils);
        });
    });
    
    /* Récupération du détail d'un profil de formulaire */
    
    app.get("/administration/profils/champs", function(req, res) {  
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
    });
    
        /* Récupération du détail d'un profil de formulaire */
    
    app.get("/visiteurs/profils/champs", function(req, res) {  
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
                            console.log(champsFinaux);
                            res.json(champsFinaux);
                        });

                    });
                });
            });
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
    
    /* Suppression d'un profil de formulaire                     */
    /* Type: DELETE                                              */
    /* Paramètres: profil -> identifiant du profil à supprimer   */  
    
    app.delete("/administration/profils", function(req, res) {  
        profilsDAO.remove(req.body.profil, function(result) {
            res.sendStatus(200);
        });
    });
    
}