const nunjucks = require( 'nunjucks' );
nunjucks.configure('mail/templates', { autoescape: true });

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'biodataisen@gmail.com',
        pass: 'biodataisen1234'
    },
    tls:{
        rejectUnauthorized: false
    }
});

var sendInvitation = function(email, identifiant, password, dateLimite, callback) {

    var datas = {
        identifiant: identifiant,
        password: password,
        dateLimite: dateLimite
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

var sendReponse = function(email, nbjours, callback) {
    console.log(email, nbjours);
    callback();
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

var sendReponseValidationAutoritees = function(email, message, callback) {
    
    var datas = {
        message: message
    }
        
    var mailContentHtml = renderMailContentHtml('reponse-finale-positive.html', datas);
    sendMail(email, 'Réponse des autorités concernant votre venue', mailContentHtml, function(response) {
        callback();
    });
}

var sendReponseRefusAutoritees = function(email, message, callback) {
    
    var datas = {
        message: message
    }
    
    console.log('message:');
    console.log(message);
    
    var mailContentHtml = renderMailContentHtml('reponse-finale-negative.html', datas);
    sendMail(email, 'Sea Test Base Biodatas - Réponse des autorités concernant votre venue', mailContentHtml, function(response) {
        callback();
    });
}

var sendReponseRefusBiodatas = function(email, messageExplicatif, callback) {
    
    var datas = {
        messageExplicatif: messageExplicatif
    }
    
    var mailContentHtml = renderMailContentHtml('reponse-negative.html', datas);
    console.log(mailContentHtml);
    sendMail(email, 'Sea Test Base Biodatas - Problème concernant les données reçues', mailContentHtml, function(response) {
        callback();
    });
}

var sendConfirmationBiodatas = function(email, projet, biodatas, fichiers, callback) {
    
    var datas = {
        biodatas: biodatas
    }
    
    var mailContentHtml = renderMailContentHtml('confirmation-biodatas.html', datas);
    console.log(mailContentHtml);
    sendMailFiles(email, 'Sea Test Base Biodatas - Récapitulatif des données envoyées', mailContentHtml, fichiers, function(response) {
        callback();
    });
}

var sendBiodatas = function(email, projet, biodatas, fichiers, callback) {
    
    var datas = {
        biodatas: biodatas
    }
    
    var mailContentHtml = renderMailContentHtml('biodatas-administrateur.html', datas);
    console.log(mailContentHtml);
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
        from: 'biodataisen@gmail.com',
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
        from: 'biodataisen@gmail.com',
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
    sendReponse: sendReponse,
    sendBiodatas: sendBiodatas,
    sendConfirmationBiodatas: sendConfirmationBiodatas,
    sendPass: sendPass,
    sendReponseValidationAutoritees: sendReponseValidationAutoritees,
    sendReponseRefusAutoritees: sendReponseRefusAutoritees,
    sendReponseRefusBiodatas: sendReponseRefusBiodatas
}