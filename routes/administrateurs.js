module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var administrateursDAO = require('../dao/administrateurs.js');
    
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
     
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    
    /* Récupération de la liste des rappels */
    
    app.get("/administrateurs", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            administrateursDAO.getAll(function(administrateurs) {
                res.json(administrateurs);
            });
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Ajout d'un administrateur */
    
    app.post("/administrateurs", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.body.administrateurs) {
                async.eachSeries(req.body.administrateurs, function iteratee(administrateur, callback) {
                    if(administrateur.email != '' && administrateur.password != '') {
                        administrateursDAO.add(administrateur.email, administrateur.password, function(result) {
                            callback();
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
    
    /* Suppression d'un administreur */
    
    app.delete("/administrateurs", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') { 
            if(req.body.identifiant) {
                administrateursDAO.remove(req.body.identifiant, function(result) {
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