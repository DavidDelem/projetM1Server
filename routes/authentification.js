module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
     
    app.use(auth.initialize());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    
    /* AUTHENTIFICATION ADMINISTRATEURS                                                                                 */
    /* Executé à chaque appel à une route commançant par /administration                                                */
    /* Si le token JWT décodé correspond à un administrateur, laisse la requête continuer vers la route demandée        */
    /* Si le token JWT décodé ne correspond pas à un administrateur, stoppe la requête et renvoi un code HTTP 401       */
    
    app.use('/administration', auth.authenticate(), function (req, res, next) {
        if(req.user.type === 'administrateur') {
            console.log('admin');
            next(); 
        } else {
            res.sendStatus(401);
        }
    });
    
    /* AUTHENTIFICATION VISITEURS                                                                                       */
    /* Executé à chaque appel à une route commançant par /visiteurs                                                     */
    /* Si le token JWT décodé correspond à un visiteur, laisse la requête continuer vers la route demandée              */
    /* Si le token JWT décodé ne correspond pas à un visiteur, stoppe la requête et renvoi un code HTTP 401             */
    
    app.use('/visiteurs', auth.authenticate(), function (req, res, next) {
        if(req.user.type === 'visiteur') {
            console.log('visiteur');
            next(); 
        } else {
            res.sendStatus(401);
        }
    });
    
}