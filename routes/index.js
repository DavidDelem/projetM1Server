module.exports = function(app) {
    
//    var multer  = require('multer');
//    var upload = multer({ dest: 'upload/' });
//    var Tesseract = require('tesseract.js');
//    
//    var jwt = require("jwt-simple");  
//    var bodyParser = require('body-parser');  
//    var async = require('async');
//    
//    var dao = require('../dao/index.js');
//    
//    var auth = require("../authentification/auth.js")();  
//    var cfg = require("../authentification/config.js");  
//     
//    app.use(auth.initialize());
//    app.use(bodyParser.urlencoded({ extended: false }));
//    app.use(bodyParser.json());
//    
//    app.post("/token5", function(req, res) { 
//        if (req.body.email && req.body.password) { // req.body.type
//            
//            var inviteDTO = { email: req.body.email, password: req.body.password };
//            console.log(inviteDTO);
//            dao.select(inviteDTO).then(function(result) {
//                console.log(result);
//                if (result.length !== 0) {
//                    var payload = { id: result[0].email, exp: Date.now() + 3600000 };
//                    var token = jwt.encode(payload, cfg.jwtSecret);
//                    res.json({ token: token });
//                } else {
//                    res.sendStatus(401);
//                }
//                  
//            });
//            
//        } else {
//            res.sendStatus(401);
//        }
//        
//    });
//    
//    /* Routes avec authentification */
//    
//    app.get("/routeinvite2", auth.authenticate(), function(req, res) {  
//        res.json(req.user.type);
//    });
//    
//    app.post("/routeadmin1", auth.authenticate(), upload.single('image'), function(req, res) {  
//       // res.setHeader('Access-Control-Allow-Origin', '*');
//        console.log(req.body.test);
//        res.json(req.file);
//    });
//    
//    /* Test images */
//    
//    app.get('/image', auth.authenticate(), function(req, res) {
//        
//        Tesseract.recognize('upload/carteidentite/numris10.jpg').then(function(result){
//                console.log(result.text);
//                res.header("Access-Control-Allow-Origin", "*");
//                res.json(result.text);
//        });
//        
//    });
//
//    app.post('/image1', upload.single('image'), function(req, res) {
//        res.header("Access-Control-Allow-Origin", "*");
//        res.json(req.file);
//    });
    
}