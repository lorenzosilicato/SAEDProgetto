const express = require('express');
const router = express.Router();
const pool = require('../db');
const passport = require('passport');
const {ensureAuthenticated} = require("../config/auth");


router.get('/tornei', ensureAuthenticated, (req, res)=>{
    pool.query("SELECT * FROM salalan.torneo", (error, results) => {
        if (error) {
            //TODO
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
    let errors= [];
    pool.query("SELECT from salalan.prenotazioni where nome=$1, data=$2, ora_inizio=$3, ora_fine=$4", [req.user.nome, data, ora_inizio, ora_fine], (error, results)=>{
        console.log(typeof results);
        if(typeof results === 'undefined'){
           const text = "INSERT INTO salalan.prenotazioni(nome, data, ora_inizio, ora_fine, tipo_prenotazione) values ($1, $2, $3, $4, NULL)";
           const values = [req.user.nome, data, ora_inizio, ora_fine];
           pool.query(text, values, function (error, risposta){
               if(error){
                   errors.push({msg : "Errori interni al database, riprova più tardi"});
                   res.render('/prenotazioni', {
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
    //console.log(req.body);
    const idTorneo = req.body.idTorneo;
    pool.query("SELECT * FROM salalan.torneo WHERE id_torneo=$1", [idTorneo], (error, results) => {
        console.log(results.rows[0]);
        if (error) {
            //TODO
            throw error;
        }
        const torneoIscrizione = results.rows[0];
        const text = "INSERT INTO salalan.prenotazioni(nome, data, ora_inizio, ora_fine, tipo_prenotazione) values ($1, $2, $3, $4, 'Torneo')";
        const values = [req.user.nome, torneoIscrizione.data, torneoIscrizione.ora_inizio, torneoIscrizione.ora_fine];
        pool.query(text, values, (err, risposta)=>{
            if(err){
                //TODO
                throw err;
            }
            req.flash('success_msg', 'Iscrizione andata a buon fine!');
            res.redirect('../dashboard');
        });
    });

})
module.exports = router;