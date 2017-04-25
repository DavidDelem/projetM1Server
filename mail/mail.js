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
    sendMail(email, 'invitation seaTestBase', mailContentHtml, function(response) {
        callback();
    });
}

var sendRappel = function(email, dateLimite, callback) {
    
    var datas = {
        dateLimite: dateLimite
    }

    var mailContentHtml = renderMailContentHtml('rappel.html', datas);
    sendMail(email, 'rappel seaTestBase', mailContentHtml, function(response) {
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
    sendMail(email, 'recupPass', mailContentHtml, function(response) {
        callback();
    });
}

var sendReponseValider = function(email, callback) {
    var mailContentHtml = renderMailContentHtml('reponse-finale-positive.html');
    sendMail('biodataisen@gmail.com', 'biodatas', mailContentHtml, function(response) {
        callback();
    });
}

var sendReponseNonValider = function(email, callback) {
    var mailContentHtml = renderMailContentHtml('reponse-finale-negative.html');
    sendMail('biodataisen@gmail.com', 'biodatas', mailContentHtml, function(response) {
        callback();
    });
}

var sendBiodatas = function(user, biodatas, callback) {
    
    var datas = {
        biodatas: biodatas
    }
    
    var mailContentHtml = renderMailContentHtml('biodatas-administrateur.html', datas);
    console.log(mailContentHtml);
    sendMail('biodataisen@gmail.com', 'biodatas', mailContentHtml, function(response) {
        callback();
    });
}


//var sendMail = function(email, text, callback) {
//
//    
//    var mailContentHtml = nunjucks.render('invitation.html', { foo: 'bar' });
//    console.log(mailContentHtml);
////    
////    let mailOptions = {
////        from: 'biodataisen@gmail.com', // sender address
////        to : email, // list of receivers
////        subject: 'Hello ✔', // Subject line
////        html: text// html body
////    };
////
////// send mail with defined transport object
////transporter.sendMail(mailOptions, (error, info) => {
////    if (error) {
////        return console.log(error);
////    }
////    console.log('Message %s sent: %s', info.messageId, info.response);
////});
//
//    callback("ok");
//}

var renderMailContentHtml = function(fileName, datas) {
    return nunjucks.render(fileName, datas);
}

var sendMail = function(email, subject, htmlContent, callback) {
    var mailOptions = {
        from: 'biodataisen@gmail.com',
        to : email,
        subject: subject,
        html: htmlContent,

        attachments: [
            {   // utf-8 string as an attachment
                 filename: 'text1.txt',
                 content: 'hello world!'
             },
            /*{   // file on disk as an attachment
                   filename: 'text3.txt',
                   path: '/path/to/file.txt' // stream this file
             }*/
        ]
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
    sendPass: sendPass,
    sendReponseValider: sendReponseValider,
    sendReponseNonValider: sendReponseNonValider
}

