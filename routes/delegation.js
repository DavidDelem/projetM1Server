module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var invitationsDAO = require('../dao/invitationsjson.js');
    var projetsDAO = require('../dao/projets.js');
    var profilsDAO = require('../dao/profilsformulaires.js');
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
             console.log(req.body.email);
            if(req.body.email) {
              //  invitationsDAO.add(req.params.projet, req.body.email, "", function(invitation) {
                    // ENVOI DU MAIL
                   
                        res.sendStatus(200);
               // }); 
            } else {
                res.sendStatus(400);
            }
       	}else {
            	res.sendStatus(401);
        }
    });

}