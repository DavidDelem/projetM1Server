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
    
    /* Envoi des biodatas */
    
    app.post("/biodatas", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'visiteur') {
            var champs = [];
            async.eachSeries(req.body.champs, function iteratee(champ, callback) {
                if(champ.saisie) {
                    // Traitement de la saisie
                }
                callback();
                        
            }, function done() {
               //envoi ou non des biodatas
            });
        } else {
            res.sendStatus(401);
        }
    });
    
}