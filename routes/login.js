module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var administrateurs = require('../dao/administrateurs.js');
    var invitations = require('../dao/invitations.js');
    
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  

    var mail = require('../mail/mail.js');
     
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    
    /* Connexion administrateur */

    app.post("/token/administrateur", function(req, res) { 
        if (req.body.identifiant && req.body.password) {
            administrateurs.getByIdentifiantAndPassword(req.body.identifiant, req.body.password, function(result) {
                if (result.length !== 0) {
                    var payload = { id: result[0].identifiant, type: 'administrateur', exp: Date.now() + 3600000 }; 
                    var token = jwt.encode(payload, cfg.jwtSecret);
                    res.json({ token: token });
                } else {
                    res.sendStatus(400);
                }
            });  
        } else {
            res.sendStatus(400);
        }
    });
    
    /* Connexion visiteur */
    
    app.post("/token/visiteur", function(req, res) { 
        if (req.body.identifiant && req.body.password) {
            invitations.getByIdentifiantAndPassword(req.body.identifiant, req.body.password, function(result) {
                if (result.length !== 0) {
                    var payload = { id: result[0].identifiant, type: 'visiteur', exp: Date.now() + 3600000 };
                    var token = jwt.encode(payload, cfg.jwtSecret);
                    res.json({ token: token });
                } else {
                    res.sendStatus(400);
                }
            });
        } else {
            res.sendStatus(400);
        }
    });
    
    /*renvoie mot de pass*/
    
    app.post("/token/visiteur/identifiant", function(req, res) { 
        if (req.body.email) {
            invitations.getByEmail(req.body.email, function(result) {
                if (result.length !== 0) {
                    console.log(result);
                    //var text = "identifiant" + result[0].identifiant + "motDePass" + result[0].password;
                    mail.sendPass(req.body.email, result[0].identifiant, result[0].password, function(toto){
                        res.json(toto);
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