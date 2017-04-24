module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var invitationsDAO = require('../dao/invitationsjson.js');
    var mail = require('../mail/mail.js');
        
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
    
    var moment = require('moment');
    var _ = require('lodash');
    
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());



	/* Ajout d'une invitation dans un projet */
    
    app.post("/invitation/delegation", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'visiteur') {
            if(req.body.emails && req.user.projet && req.user.identifiant) {
                async.eachSeries(req.body.emails, function iteratee(email, callback) {
                    if(email.value && email.value != '') {
                        invitationsDAO.add(req.user.projet, email.value, req.user.identifiant, function(invitation) {
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

}