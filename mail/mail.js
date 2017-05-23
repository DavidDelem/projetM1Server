const config = require('../config.json');

const nunjucks = require( 'nunjucks' );
nunjucks.configure('mail/templates', { autoescape: true });
var fs = require('fs');

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const transporter = nodemailer.createTransport(smtpTransport({
        host: config.emailSmtpServer,
        port: config.emailSmtpPort,
        secureConnection: true, //true or false
        tls: { rejectUnauthorized: false },
        auth: {
            user: config.emailAdresse,
            pass: config.emailPassword
        },
        debug: true
    }));

var sendInvitation = function(email, identifiant, password, langue, dateLimite, callback) {

    var datas = {
        identifiant: identifiant,
        password: password,
        dateLimite: dateLimite,
        langue: langue
    }
    
    var mailContentHtml = renderMailContentHtml('invitation.html', datas);
    sendMail(email, 'SeaTestBase Biodatas - Invitation', mailContentHtml, function(response) {
        callback();
    });
}

var sendRappel = function(email, dateLimite, callback) {
    
    var datas = {
        dateLimite: dateLimite
    }

    var mailContentHtml = renderMailContentHtml('rappel.html', datas);
    sendMail(email, 'SeaTestBase Biodatas - Rappel important', mailContentHtml, function(response) {
        callback();
    });
}

var sendPass = function(email, identifiant, password, callback) {

    var datas = {
        identifiant: identifiant,
        password: password,
    }
    
    var mailContentHtml = renderMailContentHtml('recuperation-mot-pass.html', datas);
    sendMail(email, 'SeaTestBase Biodatas - Vos identifiants de connexion', mailContentHtml, function(response) {
        callback();
    });
}

var sendReponseValidationAutoritees = function(email, langue, message, callback) {
    
    var datas = {
        message: message,
        langue: langue
    }
        
    var mailContentHtml = renderMailContentHtml('reponse-finale-positive.html', datas);
    sendMail(email, 'Réponse des autorités concernant votre venue', mailContentHtml, function(response) {
        callback();
    });
}

var sendReponseRefusAutoritees = function(email, langue, message, callback) {
    
    var datas = {
        message: message,
        langue: langue
    }
    
    var mailContentHtml = renderMailContentHtml('reponse-finale-negative.html', datas);
    sendMail(email, 'Sea Test Base Biodatas - Réponse des autorités concernant votre venue', mailContentHtml, function(response) {
        callback();
    });
}

var sendReponseRefusBiodatas = function(email, langue, messageExplicatif, callback) {
    
    var datas = {
        messageExplicatif: messageExplicatif,
        langue: langue
    }
    
    var mailContentHtml = renderMailContentHtml('reponse-negative.html', datas);
    sendMail(email, 'Sea Test Base Biodatas - Problème concernant les données reçues', mailContentHtml, function(response) {
        callback();
    });
}

var sendMessage = function(email, langue, message, callback) {
    
    var datas = {
        message: message,
        langue: langue
    }
    
    var mailContentHtml = renderMailContentHtml('message.html', datas);
    sendMail(email, 'Sea Test Base Biodatas - Message d\'un administrateur', mailContentHtml, function(response) {
        callback();
    });
}

var sendConfirmationBiodatas = function(email, projet, langue, biodatas, fichiers, callback) {
    
    var datas = {
        biodatas: biodatas,
        langue: langue
    }
    
    var mailContentHtml = renderMailContentHtml('confirmation-biodatas.html', datas);
    sendMailFiles(email, 'Sea Test Base Biodatas - Récapitulatif des données envoyées', mailContentHtml, fichiers, function(response) {
        callback();
    });
}

var sendBiodatas = function(email, projet, biodatas, fichiers, callback) {
    
    var datas = {
        biodatas: biodatas
    }
    
    var mailContentHtml = renderMailContentHtml('biodatas-administrateur.html', datas);
     var mailFichier = renderMailContentHtml('biodatas-fichier.csv', datas);

    var wstream = fs.createWriteStream('biodatas.csv');
    wstream.write(mailFichier);
    wstream.end();

    fichiers.push(wstream);
    
    sendMailFiles('biodataisen@gmail.com', 'Biodatas - ' + projet + ' - ' + email, mailContentHtml, fichiers, function(response) {
        callback();
    });
}

/* Génère l'email au format html à partir d'un fichier et de données */

var renderMailContentHtml = function(fileName, datas) {
    return nunjucks.render(fileName, datas);
}

/* Envoi d'un email sans piéces jointes */

var sendMail = function(email, subject, htmlContent, callback) {
    var mailOptions = {
        from: 'biodata@celadon.asso.fr',
        to : email,
        subject: subject,
        html: htmlContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        callback();
    });
}

/* Envoi d'un email avec des piéces jointes */

var sendMailFiles = function(email, subject, htmlContent, fichiers, callback) {
    let mailOptions = {
        from: 'biodata@celadon.asso.fr',
        to : email,
        subject: subject,
        html: htmlContent,
        attachments: fichiers
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        callback();
    });
}

module.exports = {
    sendInvitation: sendInvitation,
    sendRappel: sendRappel,
    sendBiodatas: sendBiodatas,
    sendConfirmationBiodatas: sendConfirmationBiodatas,
    sendPass: sendPass,
    sendReponseValidationAutoritees: sendReponseValidationAutoritees,
    sendReponseRefusAutoritees: sendReponseRefusAutoritees,
    sendReponseRefusBiodatas: sendReponseRefusBiodatas,
    sendMessage: sendMessage
}