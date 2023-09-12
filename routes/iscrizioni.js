const express = require('express');
const router = express.Router();
const pool = require('../db');
const passport = require('passport');
const {ensureAuthenticated} = require("../config/auth");


router.get('/tornei', ensureAuthenticated, (req, res)=>{
    let errors= [];
    pool.query("SELECT * FROM salalan.torneo", (error, results) => {
        if (error) {
            errors.push({msg : "Errori interni al database, riprova più tardi"});
            res.render('prenotazioni', {
                errors
            });
        }
        const tornei = results.rows;
        res.render('tornei', {
            tornei
        });
    });
});

router.get('/prenotazioni', ensureAuthenticated, (req, res)=>{
    res.render('prenotazioni');
});


router.post('/prenotazioni', (req, res)=>{
    const {data, ora_inizio, ora_fine} = req.body;
    console.log(data, ora_inizio, ora_fine);
    pool.query("SELECT from salalan.prenotazioni where nome=$1, data=$2, ora_inizio=$3, ora_fine=$4", [req.user.nome, data, ora_inizio, ora_fine], (error, results)=>{
        console.log(typeof results);
        //Controlla che non vi siano prenotazioni con quei dati già presenti nel database
        if(typeof results === 'undefined'){
           const text = "INSERT INTO salalan.prenotazioni(nome, data, ora_inizio, ora_fine, tipo_prenotazione) values ($1, $2, $3, $4, NULL)";
           const values = [req.user.nome, data, ora_inizio, ora_fine];
           pool.query(text, values, function (error, risposta){
               if(error){
                   errors.push({msg : "Errori interni al database, riprova più tardi"});
                   res.render('prenotazioni', {
                       errors
                   });
               }
               req.flash('success_msg', 'Iscrizione andata a buon fine!');
               res.redirect('../dashboard');
           });
       } else {
           errors.push({msg: "Esiste già una prenotazione a tuo nome!"});
           res.redirect('../dashboard', {
               errors
           });
       }

    });
});


//Handler Tornei
router.post('/tornei', (req, res)=>{
    let errors = [];
    const idTorneo = req.body.idTorneo;
    pool.query("SELECT * FROM salalan.torneo WHERE id_torneo=$1", [idTorneo], (error, results) => {
        console.log(results.rows[0]);
        if (error) {
            errors.push({msg : "Errori interni al database, riprova più tardi"});
            res.render('prenotazioni', {
                errors
            });
        }
        const torneoIscrizione = results.rows[0];
        pool.query("SELECT * FROM salalan.iscrizione WHERE id_utente=$1 AND id_torneo=$2", [req.user.nome, idTorneo], (error, results)=>{
            //Controlla che non esista già una prenotazione del torneo per l'utente loggato
            if(typeof results == 'undefined'){
                const text = "INSERT INTO salalan.prenotazioni(nome, data, ora_inizio, ora_fine, tipo_prenotazione) values ($1, $2, $3, $4, 'Torneo')";
                const values = [req.user.nome, torneoIscrizione.data, torneoIscrizione.ora_inizio, torneoIscrizione.ora_fine];
                pool.query(text, values, (err, risposta)=>{
                    if(err){
                        errors.push({msg: "Il torneo ha raggiunto il numero massimo di iscritti"});
                        res.render('tornei', {
                            errors
                        })
                    }
                    req.flash('success_msg', 'Iscrizione andata a buon fine!');
                    res.redirect('../dashboard');
                });
            }else{
                pool.query("SELECT * FROM salalan.torneo", (error, results) => {
                    let tornei = results.rows;
                    if(error){
                        errors.push({msg : "Errori interni al database, riprova più tardi"});
                        res.render('tornei', {
                            tornei,
                            errors
                        });
                    }
                    errors.push({msg: "Sei già iscritto a questo torneo!"});
                    res.render('tornei', {
                        tornei,
                        errors
                    })
                });
            }
        });
    });

})
module.exports = router;