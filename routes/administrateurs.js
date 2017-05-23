module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var administrateursDAO = require('../dao/administrateurs.js');

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    /* Récupération de la liste des administrateurs         */
    /* Type: GET                                            */
    /* Paramètres: AUCUNS                                   */
    
    app.get("/administration/administrateurs", function(req, res) {  
        administrateursDAO.getAll(function(administrateurs) {
            res.json(administrateurs);
        });
    });
    
    /* Ajout d'un ou plusieurs administrateurs                          */
    /* Type: POST                                                       */
    /* Paramètres: administrateurs -> liste d'emails et mots de passe   */
    
    app.post("/administration/administrateurs", function(req, res) {  
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
    });
    
    /* Ajout d'un ou plusieurs administrateurs                          */
    /* Type: POST                                                       */
    /* Paramètres: administrateurs -> liste d'emails et mots de passe   */
    
    app.put("/administration/administrateurs", function(req, res) {  
        if(req.body.identifiant && req.body.password && req.body.password.length > 5) {
            administrateursDAO.update(req.body.identifiant, req.body.password, function(result) {
                res.sendStatus(200);    
            });
        } else {
            res.sendStatus(400);
        }
    });
    
    /* Suppression d'un administrateur                                  */
    /* Type: DELETE                                                     */
    /* Paramètres: identifiant -> identifiant d'un administrateur       */
    
    app.delete("/administration/administrateurs", function(req, res) {  
        if(req.body.identifiant) {
            administrateursDAO.remove(req.body.identifiant, function(result) {
                res.sendStatus(200);
            });    
        } else {
            res.sendStatus(400);
        }
    });
    
}