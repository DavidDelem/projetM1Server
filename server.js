var express = require('express');
var cors = require('cors');

// Clients autorisés à communiquer avec l'API REST

var whitelist = [
    'http://localhost:8080',
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
require('./routes/invitations.js')(app);
require('./routes/actions.js')(app);
require('./routes/historique.js')(app);
require('./routes/historiquedossier.js')(app);
require('./routes/rappels.js')(app);
require('./routes/profilsformulaires.js')(app);
require('./routes/formulaires.js')(app);


// CRON
require('./cron');

app.listen(8088);
