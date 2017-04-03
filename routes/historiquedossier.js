module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var invitationsDAO = require('../dao/invitationsjson.js');
    
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
     
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    
    app.get("/invitations/:invitation/historique", auth.authenticate(), function(req, res) {  
        if (req.user.type === 'visiteur' || req.user.type === 'administrateur') {
            invitationsDAO.getHistorique(req.params.invitation, function(historique) {
                res.json(historique);
            });
        } else {
            res.sendStatus(401);
        }
    });    
    
}