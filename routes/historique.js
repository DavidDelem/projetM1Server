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
    
    app.use('/administration', auth.authenticate(), function (req, res, next) {
        if(req.user.type === 'administrateur') {
            next(); 
        } else {
            res.sendStatus(401);
        }
    });

    /* Historique des événements pour le fil d'actualité                     */
    /* Type: GET                                                             */
    /* Paramètres: AUCUNS                                                    */
    
    app.get("/administration/historique", function(req, res) {  
        historiqueDAO.get(moment().subtract(30, 'days').format('x'), function(historique) {
            res.json(historique);
        });
    }); 
    
    /* Indiquer que l'historique à été vu ou non                                      */
    /* Type: PUT                                                                      */
    /* Paramètres: identifiant -> Identifiant de l'élément de l'historique            */
    /*             lu -> true pour marquer comme lu, false pour marque comme non-lu   */
    
    app.put("/administration/historique/:identifiant", function(req, res) {  
        if(req.params.identifiant && (req.body.lu == true || req.body.lu == false)) {
            historiqueDAO.update(req.params.identifiant, req.body.lu, function(historique) {
                res.json(req.body.lu);
            }); 
        } else {
            res.sendStatus(400);
        }
    });    
    
}