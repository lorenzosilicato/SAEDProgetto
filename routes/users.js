const express = require('express');
const router = express.Router();
const pool = require('../db');
const passport = require('passport');

router.get('/login', (req, res)=>{
    res.render('login');
});

//Pagina Registrazione
router.get('/signup', (req, res)=>{
    res.render('signup');
});

//Handler Registrazione
router.post('/signup', (req, res)=>{
    const { name, numero_telefono, email, password} = req.body;
    let errors = [];
    if(!name || !numero_telefono || !email || !password){
        errors.push({ msg : "Devi compilare tutti i campi"});
    }
    if(password.length <6){
        errors.push({msg : "La password deve essere di almeno 6 caratteri"});
    }
    if(errors.length >0){
        res.render('signup',{
            errors,
            name,
            numero_telefono,
            email,
            password
        });
    }else{
        //Validation pass
        pool.query("SELECT EXISTS(SELECT email FROM salalan.utente where email=$1)", [email] , function (error, results){
            if (error){
                errors.push({ msg : "Problemi di comunicazione con il database, riprovare"});
                res.render('signup',{
                    errors,
                    name,
                    numero_telefono,
                    email,
                    password
                });
            }
            if(!results.rows[0].exists){
                const text = "INSERT INTO salalan.utente(nome, numero_telefono, email, password,ruolo) values ($1, $2, $3, salalan.crypt($4, salalan.gen_salt('bf')), 'Cliente')";
                const values = [name, numero_telefono, email, password];
                pool.query(text, values, function (error, risposta){

                    if(error){
                        errors.push({ msg : "Problemi di comunicazione con il database, riprovare"});
                        res.render('signup',{
                            errors,
                            name,
                            numero_telefono,
                            email,
                            password
                        });
                    }
                    req.flash('success_msg', 'Ora sei registrato!');
                    res.redirect('/users/login');
                });

            } else {
                errors.push({ msg : "Questa email è già registrata"});
                res.render('signup',{
                    errors,
                    name,
                    numero_telefono,
                    email,
                    password
                });
            }
        });
    }
});

//Handler Login
router.post('/login', (req, res, next)=>{
   passport.authenticate('local', {
       successRedirect : '/dashboard',
       //Cambiare success ruote con una nuova pagina
       failureRedirect : '/users/login',
       failureFlash : true
   })(req, res, next);
});

//Handler Logout
router.get('/logout', (req, res)=>{
   req.logout((err)=>{
       if(err){
           throw err;
       }
       req.flash('success_msg', 'Ti sei disconnesso con successo!');
       res.redirect('/users/login');
   });

});

module.exports = router;
