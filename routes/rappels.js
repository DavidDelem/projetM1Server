module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var rappelsDAO = require('../dao/rappels.js');
    
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
     
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    
    /* Récupération de la liste des rappels */
    
    app.get("/rappels", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            rappelsDAO.getAll(function(rappels) {
                res.json(rappels);
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    app.get("/rappels/configuration", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            rappelsDAO.getConfiguration(function(configuration) {
                res.json(configuration);
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Ajout d'un rappel */
    
    app.post("/rappels", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            
            if(req.body.nbJours) {
                    rappelsDAO.count(req.body.nbJours, function(result) {
                        if(result == 0) {
                            rappelsDAO.add(req.body.nbJours , function(result) {
                            res.json(result);
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
    
    /* Suppression d'un rappel */
    
    app.delete("/rappels", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') { 
            if(req.body.nbJours) {
                rappelsDAO.remove(req.body.nbJours , function(result) {
                    res.json(result);
                });    
            } else {
                res.sendStatus(400);
            }
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Activation et désactivation globale des rappels */
    
    app.put("/rappels/configuration/activation", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.body.activation) {
                if(req.body.activation == "true") {   
                    rappelsDAO.activerRappels(function(result) {
                        res.json(result);
                    });
                } else {
                    rappelsDAO.desactiverRappels(function(result) {
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
    
}