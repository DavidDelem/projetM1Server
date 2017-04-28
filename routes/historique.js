module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var historiqueDAO = require('../dao/historique.js');
    
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
    var moment = require('moment');
    
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    
    app.get("/historique", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            historiqueDAO.get(moment().subtract(30, 'days').format('x'), function(historique) {
                res.json(historique);
            });
        } else {
            res.sendStatus(401);
        }
    });  
    
    app.put("/historique/:identifiant", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'administrateur') {
            if(req.params.identifiant && req.body.lu == true || req.body.lu == false) {
                historiqueDAO.update(req.params.identifiant, req.body.lu, function(historique) {
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