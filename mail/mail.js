const config = require('../config.json');
const objets = require('./objets.json');


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
    
    if(langue == 'fr') {
        var objet = objets.invitation.fr;
    } else {
        var objet = objets.invitation.en;
    }
    
    var mailContentHtml = renderMailContentHtml('invitation.html', datas);
    sendMail(email, objet, mailContentHtml, function(response) {
        callback(response);
    });
}

var sendRappel = function(email, langue, dateLimite, callback) {
    
    var datas = {
        dateLimite: dateLimite,
        langue: langue
    }
    
    if(langue == 'fr') {
        var objet = objets.rappel.fr;
    } else {
        var objet = objets.rappel.en;
    }
    
    var mailContentHtml = renderMailContentHtml('rappel.html', datas);
    sendMail(email, objet, mailContentHtml, function(response) {
        callback();
    });
}

var sendPass = function(email, identifiant, password, callback) {

    var datas = {
        identifiant: identifiant,
        password: password,
    }
    
    if(langue == 'fr') {
        var objet = objets.password.fr;
    } else {
        var objet = objets.password.en;
    }
    
    var mailContentHtml = renderMailContentHtml('recuperation-mot-pass.html', datas);
    sendMail(email, objet, mailContentHtml, function(response) {
        callback();
    });
}

var sendReponseValidationAutoritees = function(email, langue, message, callback) {
    
    var datas = {
        message: message,
        langue: langue
    }
    
    if(langue == 'fr') {
        var objet = objets.reponsefinale.fr;
    } else {
        var objet = objets.reponsefinale.en;
    }
    
    var mailContentHtml = renderMailContentHtml('reponse-finale-positive.html', datas);
    sendMail(email, objet, mailContentHtml, function(response) {
        callback();
    });
}

var sendReponseRefusAutoritees = function(email, langue, message, callback) {
    
    var datas = {
        message: message,
        langue: langue
    }
    
    if(langue == 'fr') {
        var objet = objets.reponsefinale.fr;
    } else {
        var objet = objets.reponsefinale.en;
    }
    
    var mailContentHtml = renderMailContentHtml('reponse-finale-negative.html', datas);
    sendMail(email, objet, mailContentHtml, function(response) {
        callback();
    });
}

var sendReponseRefusBiodatas = function(email, langue, messageExplicatif, callback) {
    
    var datas = {
        messageExplicatif: messageExplicatif,
        langue: langue
    }
    
    if(langue == 'fr') {
        var objet = objets.erreurbiodata.fr;
    } else {
        var objet = objets.erreurbiodata.en;
    }
    
    var mailContentHtml = renderMailContentHtml('reponse-negative.html', datas);
    sendMail(email, objet, mailContentHtml, function(response) {
        callback();
    });
}

var sendReponseValidationBiodatas = function(email, langue, callback) {
    
    var datas = {
        langue: langue
    }
    
    if(langue == 'fr') {
        var objet = objets.validitebiodata.fr;
    } else {
        var objet = objets.validitebiodata.en;
    }
    
    var mailContentHtml = renderMailContentHtml('reponse-positive.html', datas);
    sendMail(email, objet, mailContentHtml, function(response) {
        callback();
    });
}

var sendMessage = function(email, langue, message, callback) {
    
    var datas = {
        message: message,
        langue: langue
    }
    
    if(langue == 'fr') {
        var objet = objets.message.fr;
    } else {
        var objet = objets.message.en;
    }
    
    var mailContentHtml = renderMailContentHtml('message.html', datas);
    sendMail(email, objet, mailContentHtml, function(response) {
        callback();
    });
}

var sendConfirmationBiodatas = function(email, projet, langue, biodatas, fichiers, callback) {
    
    var datas = {
        biodatas: biodatas,
        langue: langue
    }
    
    if(langue == 'fr') {
        var objet = objets.confirmation.fr;
    } else {
        var objet = objets.confirmation.en;
    }
    
    var mailContentHtml = renderMailContentHtml('confirmation-biodatas.html', datas);
    sendMailFiles(email, objet, mailContentHtml, fichiers, function(response) {
        callback();
    });
}

var sendBiodatas = function(email, projet, biodatas, fichiers, callback) {
    
    var datas = {
        biodatas: biodatas
    }
    
    var mailContentHtml = renderMailContentHtml('biodatas-administrateur.html', datas);
    var mailFichier = renderMailContentHtml('biodatas-fichier.csv', datas);

    var wstream = fs.createWriteStream(config.cheminCsv);
    wstream.write(mailFichier);
    wstream.end();

    fichiers.push(wstream);
    
    sendMailFiles(config.emailAdresse, 'Biodatas - ' + projet + ' - ' + email, mailContentHtml, fichiers, function(response) {
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
        from: config.emailAdresse,
        to : email,
        subject: subject,
        html: htmlContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            callback(false);
        } else {
            console.log('Message %s sent: %s', info.messageId, info.response);
            callback(true); 
        }
    });
}

/* Envoi d'un email avec des piéces jointes */

var sendMailFiles = function(email, subject, htmlContent, fichiers, callback) {
    let mailOptions = {
        from: config.emailAdresse,
        to : email,
        subject: subject,
        html: htmlContent,
        attachments: fichiers
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error || info.messageId == undefined || info.response == undefined) {
            console.log(error);
            callback(false);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        callback(true);
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
    sendReponseValidationBiodatas: sendReponseValidationBiodatas,
    sendReponseRefusBiodatas: sendReponseRefusBiodatas,
    sendMessage: sendMessage
}