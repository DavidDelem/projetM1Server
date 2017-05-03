module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var rappelsDAO = require('../dao/rappels.js');
    
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
     
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    
    app.use('/administration', auth.authenticate(), function (req, res, next) {
        if(req.user.type === 'administrateur') {
            next(); 
        } else {
            res.sendStatus(401);
        }
    });
    
    /* Récupération de la liste des rappels                 */
    /* Type: GET                                            */
    /* Paramètres: AUCUNS                                   */
    
    app.get("/administration/rappels", function(req, res) {  
        
        rappelsDAO.getAll(function(rappels) {
            res.json(rappels);
        });
        
    });
    
    /* Récupération de la configuration globale des rappels */
    /* Type: GET                                            */
    /* Paramètres: AUCUNS                                   */
    
    app.get("/administration/rappels/configuration", function(req, res) {  
        
        rappelsDAO.getConfiguration(function(configuration) {
            res.json(configuration);
        });
        
    });
    
    /* Ajout d'un rappel                            */
    /* Type: POST                                   */
    /* Paramètres: nbJours -> le nombre de jours    */

    app.post("/administration/rappels", function(req, res) {
        
        if(req.body.nbJours) {
            rappelsDAO.count(req.body.nbJours, function(result) {
                if(result == 0) {
                    rappelsDAO.add(req.body.nbJours , function(result) {
                        res.sendStatus(200);
                    }); 
                } else {
                    res.sendStatus(400);
                }
            });
        } else {
            res.sendStatus(400);
        }
        
    });
    
    /* Suppression d'un rappel                      */
    /* Type: DELETE                                 */
    /* Paramètres: nbJours -> le nombre de jours    */
    
    app.delete("/administration/rappels", function(req, res) { 
        
            if(req.body.nbJours) {
                rappelsDAO.remove(req.body.nbJours , function(result) {
                    res.json(result);
                });    
            } else {
                res.sendStatus(400);
            }
        
    });
    
    
    /* Activation et désactivation globale des rappels  */
    /* Type: PUT                                        */
    /* Paramètres: activation -> true ou false          */
    
    
    app.put("/administration/rappels/configuration/activation", function(req, res) {  
        
            if(req.body.activation && req.body.activation == "true") {
                rappelsDAO.activerRappels(function(result) {
                    res.sendStatus(200);
                });
            } else if (req.body.activation && req.body.activation == "false") {
                 rappelsDAO.desactiverRappels(function(result) {
                    res.sendStatus(200);
                });
            } else {
                res.sendStatus(400);
            }
        
    });
    
}