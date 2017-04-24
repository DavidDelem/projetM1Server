module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var profilsDAO = require('../dao/profilsformulaires.js');
    var champsDAO = require('../dao/champs.js');
    
    var auth = require("../authentification/auth.js")();  
    var cfg = require("../authentification/config.js");  
    var _ = require('lodash');
    
    var multer  = require('multer');
    //var upload = multer({ dest: 'upload/' });
    var storage = multer.memoryStorage();
    var upload = multer({ storage: storage });
    
    app.use(auth.initialize());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    /* Envoi des biodatas */
    
    app.post("/biodatas", auth.authenticate(), upload.single('image'), function(req, res) {  
        if (req.user.type === 'visiteur') {
            console.log(req.file);
            console.log(req.body.champs);
//            var champs = [];
//            async.eachSeries(req.body.fichiers, function iteratee(champ, callback) {
//                console.log(champ);
//                if(champ.saisie) {
//                    console.log(champ.saisie);
////                }
//                callback();
//                        
//            }, function done() {
                res.sendStatus(200);
//            });
        } else {
            res.sendStatus(401);
        }
    });
    
}