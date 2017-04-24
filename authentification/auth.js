var passport = require("passport");
var passportJWT = require("passport-jwt");
var cfg = require("./config.js");

var administrateurs = require('../dao/administrateurs.js');
var invitations = require('../dao/invitationsjson.js');

var async = require('async');

var ExtractJwt = passportJWT.ExtractJwt;  
var Strategy = passportJWT.Strategy;  

var params = {  
    secretOrKey: cfg.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeader()
};

module.exports = function() {
    
    var strategy = new Strategy(params, function(payload, done) {

        if(payload.exp > Date.now()) {
            if(payload.type == 'visiteur') {
                invitations.getByIdentifiant(payload.id, function(result) {
                    if (result.length !== 0) {
                        return done(null, { type: 'visiteur', identifiant: result[0].identifiant, projet: result[0].identifiantProjet });
                    } else {
                        return done(null, false, { message: 'Invalid token' });
                    }
                });  
            } else {
                administrateurs.getByIdentifiant(payload.id, function(result) {
                    if (result.length !== 0) {
                        return done(null, { type: 'administrateur' });
                    } else {
                        return done(null, false, { message: 'Invalid token' });
                    }
                }); 
            }
        } else {
            return done(null, false, { message: 'Expired token' });
        }

    });
    
    passport.use(strategy);
    
    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function(type) {
            return passport.authenticate("jwt", cfg.jwtSession);
        }
    };
};