module.exports = function(app) {
    
    var jwt = require("jwt-simple");  
    var bodyParser = require('body-parser');  
    var async = require('async');
    
    var profilsDAO = require('../dao/profilsformulaires.js');
    var invitationsDAO = require('../dao/invitations.js');
    var champsDAO = require('../dao/champs.js');
    var projetsDAO = require('../dao/projets.js');
    var mail = require('../mail/mail.js');
    
    var moment = require('moment');
    var _ = require('lodash');
    
    var multer  = require('multer');
    var storage = multer.memoryStorage();
    var upload = multer({ storage: storage });
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    /* Savoir si les biodatas sont envoyées ou non */
    app.get("/visiteurs/biodatas", function(req, res) {  
        invitationsDAO.getHistorique(req.user.identifiant, function(historique) {
            if(historique[historique.length-1].type != "RECEPTION_INVITATION") {
                res.json(true);
            } else {
                res.json(false);
            }
        });
    });
    
    /* Envoi des biodatas */
    
    app.post("/visiteurs/biodatas", upload.array('fichiers', 10), function(req, res) {  
        
            var erreurs = [];
            var biodatas = [];
            var fichiers = [];
            
            var champs = JSON.parse(req.body.champs);
        
            // Traitement de chaque champ
            async.eachSeries(champs, function iteratee(champ, callback) { 
                if(champ.obligatoire == true && _.isEmpty(champ.saisie) && champ.type.indexOf('fichier') == -1) {
                    erreurs.push(champ);
                    console.log('erreur obligatoire vide ' + champ.type);
                } else if(champ.obligatoire == false && _.isEmpty(champ.saisie)) {
                    // On ne fait rien, c'est un champ facultatif
                } else {
                    if(champ.type.indexOf('fichier') !== -1) {
                        if(req.files) {
                            fichier = _.find(req.files, { 'originalname': champ.saisie.fichier });
                            traitementFichier(champ, fichier, function(fichier) {
                                if(fichier != false) {
                                    fichiers.push(fichier);
                                } else {
                                    erreurs.push(champ);
                                }
                            });
                        } else {
                            erreurs.push(champ);
                        }
                        
                    } else if (champ.type.indexOf('texte') !== -1 || champ.type == 'identite_nationalite') {
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
                    console.log(biodatas);
                    projetsDAO.getByIdentifiant(req.user.projet, function(projet) {
                        mail.sendBiodatas(req.user.email, projet.nom, biodatas, fichiers, function(response) {
                            mail.sendConfirmationBiodatas(req.user.email, projet.nom, projet.langue, biodatas, fichiers, function(response) {
                                invitationsDAO.addToHistorique(req.user.identifiant, 'ENVOI_BIODATAS', function(historique) {
                                    res.json(true);
                                });
                            });
                        });
                    });
                } else {
                    res.json(erreurs);
                }
            });
        
    });
    
    function traitementFichier(champ, fichier, callback) {
        console.log('TRAITEMENT FICHIER');
        
        if(fichier.size != undefined && fichier.mimetype != undefined && fichier.size <= 5000000 && fichier.size >= 1000 && (fichier.mimetype == 'application/pdf' || fichier.mimetype == 'image/png' || fichier.mimetype == 'image/jpeg'  || fichier.mimetype == 'image/pjpeg')) {
            var fichierMail = {
                filename: champ.nom + '.' + fichier.originalname.split('.')[1],
                content: fichier.buffer,
                contentType: fichier.mimetype
            }
            callback(fichierMail);
        } else {
            callback(false);
        }
    };
    
    function traitementTexte(champ, callback) {
        
        if(champ.type == 'texte_nomprenom') {
            if(champ.saisie.nom && champ.saisie.prenom && champ.saisie.nom != '' && champ.saisie.prenom != '') {
                callback(champ.saisie.nom + ' ' + champ.saisie.prenom);
            } else {
                callback(false);
            }
        } else if(champ.type == 'texte_chiffre') {
            if(champ.saisie.texte && !isNaN(champ.saisie.texte) && champ.saisie.texte.length > 1 && champ.saisie.texte.length < 4) {
                callback(champ.saisie.texte);
            } else {
                callback(false);
            }
        } else if (champ.type == 'texte_telephone_personnel' || champ.type == 'texte_telephone_profesionnel') {
            if(/([0-9\s\-]{7,})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/.test(champ.saisie.telephone)) {
                callback(champ.saisie.telephone);
            } else {
                callback(false);
            }
        } else if(champ.type == 'texte_adresse') {
            if(champ.saisie.numero && champ.saisie.rue && champ.saisie.codePostal && champ.saisie.ville && champ.saisie.pays
               && champ.saisie.numero != '' && champ.saisie.rue != ''
               && champ.saisie.codePostal != '' && champ.saisie.ville != '' && champ.saisie.pays != '') {
                
                callback(champ.saisie.numero + ' ' + champ.saisie.rue + ' ' + champ.saisie.codePostal + ' ' + champ.saisie.autreReponse || '' + ' ' + champ.saisie.ville + ' ' + champ.saisie.pays);
            } else {
                callback(false);
            }
        } else if(champ.type == 'texte_date' || champ.type == 'identite_texte_date_delivrance' || champ.type == 'identite_texte_date_expiration') {
            if(champ.saisie.date && moment(champ.saisie.date).isValid()) {
                callback(champ.saisie.date);
            } else {
                callback(false);
            }
        } else if(champ.type == 'identite_nationalite') {
            console.log(champ.saisie.nationalite);
            if(champ.saisie.nationalite && champ.saisie.nationalite != "") {
                callback(champ.saisie.nationalite);
            } else {
                callback(false);
            }
        } else if(champ.type == 'vehicule_texte') {
            if(/^[A-Z]{1,2}-[0-9]{1,3}-[A-Z]{1,2}$/.test(champ.saisie.immatriculation) || /^[0-9]{1,4}-[A-Z]{1,4}-[0-9]{1,2}$/.test(champ.saisie.immatriculation)) {
                callback(champ.saisie.immatriculation);
            } else {
                callback(false);
            }
        } else if(champ.type == 'texte_textarea') {
            callback(champ.saisie.remarques);
        } else if(champ.type == 'identite_texte_delivrance' || champ.type == 'texte_lieu') {
            if(champ.saisie.texte && champ.saisietexte != '') {
                callback(champ.saisie.texte);
            } else {
                callback(false);
            }
        } else {
            callback(false); 
        }
    };
    
}