const nunjucks = require( 'nunjucks' );
nunjucks.configure('mail/templates', { autoescape: true });

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'biodataisen@gmail.com',
        pass: '###'
    }
});

var sendRappel = function(email, nbjours, callback) {
    console.log(email, nbjours);
    callback();
}

var sendReponse = function(email, nbjours, callback) {
    console.log(email, nbjours);
    callback();
}

var sendMail = function(email, text, callback) {

    
    var mailContentHtml = nunjucks.render('invitation.html', { foo: 'bar' });
    console.log(mailContentHtml);
//    
//    let mailOptions = {
//        from: 'biodataisen@gmail.com', // sender address
//        to : email, // list of receivers
//        subject: 'Hello ✔', // Subject line
//        html: text// html body
//    };
//
//// send mail with defined transport object
//transporter.sendMail(mailOptions, (error, info) => {
//    if (error) {
//        return console.log(error);
//    }
//    console.log('Message %s sent: %s', info.messageId, info.response);
//});

    callback("ok");
}

module.exports = {
    sendRappel: sendRappel,
    sendReponse: sendReponse,
    sendMail: sendMail
    
}

