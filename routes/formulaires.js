module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var profilsDAO = require('../dao/profilsformulaires.js');
    var champsDAO = require('../dao/champs.js');
    var mail = require('../mail/mail.js');
    
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
    
    app.post("/biodatas", auth.authenticate(), upload.array('fichiers', 10), function(req, res) {  
        if (req.user.type === 'visiteur') {
            //console.log(req.files);
            
            var erreurs = [];
            var biodatas = [];
            var fichiers = [];
            
            var champs = JSON.parse(req.body.champs);
            
            async.eachSeries(champs, function iteratee(champ, callback) { 
                if(champ.obligatoire == true && _.isEmpty(champ.saisie) && champ.type.indexOf('fichier') == -1) {
                    erreurs.push(champ);
                    console.log('erreur obligatoire vide ' + champ.type);
                } else if(champ.obligatoire == false && _.isEmpty(champ.saisie)) {
                    // On ne fait rien, c'est un champ facultatif
                } else {
                    if(champ.type.indexOf('fichier') !== -1) {
                        fichier = _.find(req.files, { 'originalname': champ.saisie.fichier });
                        var resultat = traitementFichier(champ, fichier);
                        if(resultat != false) {
                            fichiers.push(resultat);
                        } else {
                            erreurs.push(champ);
                        }
                        
                    } else if(champ.type.indexOf('texte') !== -1 || champs.type == 'identite_nationalite') {
                        traitementTexte(champ, function(saisie) {
                            if(saisie !== false) {
                                biodatas.push({nom: champ.nom, saisie: saisie})
                            } else if(champ.obligatoire == true && saisie === false) {
                                erreurs.push(champ);
                                console.log('erreur obligatoire remplis mais invalide ' + champ.type);
                            } else if(champ.obligatoire == false && saisie === false && !_.isEmpty(champ.saisie)) {
                                erreurs.push(champ);
                                console.log('erreur facultatif ' + champ.type);
                            }
                        });
                    }
                }
                callback();
            }, function done() {
                if(_.isEmpty(erreurs)) {
                    mail.sendBiodatas(req.user, biodatas, fichiers, function(response) {
                        res.json(true);
                    });
                } else {
                    res.json(erreurs);
                }
            });
        }
    });
    
    function traitementFichier(champ, fichier) {
        var fichierMail = {
            filename: fichier.originalname,
            content: fichier.buffer,
            contentType: fichier.mimetype
        }
        
        return fichierMail;
    };
    
    function traitementTexte(champ, callback) {
        
        if(champ.type == 'texte_nomprenom') {
            if(champ.saisie.nom && champ.saisie.prenom && champ.saisie.nom != '' && champ.saisie.prenom != '') {
                callback(champ.saisie.nom + ' ' + champ.saisie.prenom);
            } else {
                callback(false);
            }
        } else if (champ.type == 'texte_telephone') {
            if(/([0-9\s\-]{7,})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/.test(champ.saisie.telephone)) {
                callback(champ.saisie.telephone);
            } else {
                callback(false);
            }
        } else if(champ.type == 'texte_adresse') {
            if(champ.saisie.numero && champ.saisie.rue && champ.saisie.codePostal && champ.saisie.ville && champ.saisie.pays && champ.saisie.numero != '' && champ.saisie.rue != '' && champ.saisie.codePostal != '' && champ.saisie.ville != '' && champ.saisie.pays != '') {
                callback(champ.saisie.numero + ' ' + champ.saisie.rue + ' ' + champ.saisie.codePostal + ' ' + champ.saisie.ville + ' ' + champ.saisie.pays);
            } else {
                callback(false);
            }
        } else if(champ.type == 'texte_date') {
            if(champ.saisie.date && champ.saisie.date != '') {
                callback(champ.saisie.date);
            }
        } else if(champ.type == 'identite_nationalite') {
            callback(true);
        } else if(champ.type == 'vehicule_texte') {
            callback(true);
        } else if(champ.type == 'texte_textarea') {
            callback(true);
        } else {
            callback(false); 
        }
    };
    
}