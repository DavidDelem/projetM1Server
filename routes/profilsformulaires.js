module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var profilsDAO = require('../dao/profilsformulaires.js');
    var champsDAO = require('../dao/champs.js');
    
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
    
    app.get("/profils/champs", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur' || req.user.type == 'visiteur') {
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
                        
                        if(req.user.type == 'visiteur') {
                            var champsFinaux = _.filter(champs, function(champ) {
                                return champ.coche === true;
                            });
                            res.json(champsFinaux);
                        } else {
                            res.json(champs);
                        }
                    });
                    
                });
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Mdification des champs d'un profil de formulaire */
    
    app.post("/profils/champs", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            //profilsDAO.setChamps(req.params.profil, JSON.parse(req.body.champs), function(profils) {
            var champs = [];
            async.eachSeries(req.body.champs, function iteratee(champ, callback) {
                if(champ.coche === true) {
                    champs.push({"identifiant": champ.identifiant, "obligatoire": champ.obligatoire});
                }
                callback();
                        
            }, function done() {
               // console.log(champs);
                profilsDAO.setChamps(req.body.profil, champs, function(result) {
                    res.json(result);
                });
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Création d'un nouveau profil de formulaire */
    
    app.post("/profils", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            profilsDAO.add(req.body.profil, function(profils) {
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Modification du nom d'un profil de formulaire */
    
    app.put("/profils/:profil", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            profilsDAO.update(req.params.profil, req.body.nouveauNom, function(profils) {
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    app.delete("/profils", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            profilsDAO.remove(req.body.profil, function(result) {
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(401);
        }
    });

//    
//    /* VALIDE Création d'un profil de formulaire avec toutes les données associées */
//    
//    app.post("/profils/:profil", auth.authenticate(), function(req, res) {  
//        if (req.user.type === 'admin') {
//            var champs = JSON.parse(req.body.champs);
//
//            // Création du profil de formulaire
//            profilsDAO.add(req.params.profil, 'description', function(result) {
//                
//                // Enregistrement des champs associés
//                async.eachSeries(champs, function iteratee(champ, callback) {
//                    console.log(champ.nom_champ);
//                    profilsDAO.addChampToProfil(req.params.profil, champ.nom_champ, champ.statut, function(result) {
//                        callback();
//                    });
//                }, function done() {
//                    res.json('ok');
//                });
//                
//            });
//        }
//    });
//    
//    /* VALIDE Modification d'un profil de formulaire */
//    
//    app.put("/profils/:profil", auth.authenticate(), function(req, res) {  
//        if (req.user.type === 'admin') {
//            var champs = JSON.parse(req.body.champs);
//
//            // Suppression de tout les champs associés
//            profilsDAO.removeAllChampsFromProfil(req.params.profil, function(result) {
//                
//                // Enregistrement des champs associés
//                async.eachSeries(champs, function iteratee(champ, callback) {
//                    console.log(champ.nom_champ);
//                    profilsDAO.addChampToProfil(req.params.profil, champ.nom_champ, champ.statut, function(result) {
//                        callback();
//                    });
//                }, function done() {
//                    res.json('ok');
//                });
//                
//            });
//        }
//    });

    
}