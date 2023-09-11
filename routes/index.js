const express = require('express');
const {ensureAuthenticated} = require("../config/auth");
const router = express.Router();

router.get('/', (req, res)=>{
    res.render('homepage');
});

router.get('/dashboard', ensureAuthenticated, (req, res)=>{
    console.log(req.user);
    res.render('dashboard', {
        nome : req.user.nome
    });
})

module.exports = router;