var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var username = req.cookies.username;
    if (!username)
        username = "";
    res.render('index', { title: 'GPS share', name: username});
});

router.get('/gps', function(req, res) {
    //if (req.params.name)
    if (!req.query.name) {
        res.render('index', { title: 'GPS share', message: "Please fill your name" });
        return;
    }
    res.cookie('username', req.query.name, { expires: new Date(Date.now() + 900000), httpOnly: false });
    res.render('gps', {name: req.query.name});
});

module.exports = router;
