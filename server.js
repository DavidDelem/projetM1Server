#!/usr/bin/env nodejs

var express = require('express');
var cors = require('cors');
const https = require('https');
const fs = require('fs');

const options = {
//    cert: fs.readFileSync('./ssl/server.crt'),
//    key: fs.readFileSync('./ssl/server.key')
};

// Clients autorisés à communiquer avec l'API REST

var whitelist = [
    'http://localhost:8080',
    'http://127.0.0.1',
    'http://192.168.224.212',
    'https://localhost:8080',
    'https://127.0.0.1',
    'https://192.168.224.212',
    'https://projetbiodata.delemottedavid.fr',
    'https://164.132.199.14',
    'http://projetbiodata.delemottedavid.fr',
    'http://164.132.199.14',
    'https://194.250.113.93',
    'http://194.250.113.93',
    'https://biodata.seatestbase.com'
];

var corsOptions = {
    origin: function(origin, callback){
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },
    credentials: true
};

var app = express();
app.use(cors(corsOptions));

// ROUTES
require('./routes/login.js')(app);

require('./routes/authentification.js')(app);
require('./routes/invitations.js')(app);
require('./routes/actions.js')(app);
require('./routes/historique.js')(app);
require('./routes/historiquedossier.js')(app);
require('./routes/rappels.js')(app);
require('./routes/profilsformulaires.js')(app);
require('./routes/formulaires.js')(app);
require('./routes/delegation.js')(app);
require('./routes/administrateurs.js')(app);

// CRON
require('./cron');

app.listen(8088);
https.createServer(options, app).listen(8443);
