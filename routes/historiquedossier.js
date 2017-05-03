module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var invitationsDAO = require('../dao/invitations.js');
    
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
     
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());  

    /* Historique du dossier d'une invitation pour le visiteur               */
    /* Type: GET                                                             */
    /* Paramètres: AUCUNS                                                    */
    
    app.get("/visiteurs/invitation/historique", function(req, res) {  
        invitationsDAO.getHistorique(req.user.identifiant, function(historique) {
            res.json(historique);
        });
    });    
    
}