const express = require('express');
const {ensureAuthenticated} = require("../config/auth");
const router = express.Router();
const pool = require('../db');

router.get('/', (req, res)=>{
    res.render('homepage');
});

router.get('/dashboard', ensureAuthenticated, (req, res)=>{
    console.log(req.user);
    let errors= [];
    const text = "SELECT prenotazioni.id_prenotazione, prenotazioni.data, prenotazioni.ora_inizio, prenotazioni.ora_fine, tipo_prenotazione,gioco, prenotazioni.postazione FROM salalan.prenotazioni LEFT JOIN salalan.iscrizione ON prenotazioni.id_prenotazione=iscrizione.id_prenotazione LEFT JOIN salalan.torneo ON iscrizione.id_torneo=torneo.id_torneo LEFT JOIN salalan.utente ON iscrizione.id_utente=utente.nome WHERE prenotazioni.nome=$1 ORDER BY data;";
    const values = [req.user.nome];
    pool.query(text, values, function (error, results){
        if(error){
            errors.push({msg : "Errori interni al database, riprova più tardi"});
            res.redirect('/homepage', {
                errors
            });
        }
        res.render('dashboard', {
            nome : req.user.nome,
            email : req.user.email,
            numero_telefono : req.user.numero_telefono,
            datiPrenotazioni : results.rows
        });
    });
});

router.post('/dashboard', function (req, res){
    let id_prenotazione = req.body.id_prenotazione;
    pool.query('SELECT id_prenotazione, tipo_prenotazione FROM salalan.prenotazioni WHERE id_prenotazione=$1',[id_prenotazione], function (error, results) {
        if (error) {
            errors.push({msg : "Errori interni al database, riprova più tardi"});
            res.render('/homepage', {
                errors
            });
        }
        if(results.rows[0].tipo_prenotazione === 'Torneo'){
            pool.query('DELETE FROM salalan.iscrizione WHERE iscrizione.id_prenotazione =$1', [id_prenotazione], function (error, risposta) {
                if (error) {
                    errors.push({msg : "Errori interni al database, riprova più tardi"});
                    res.render('/dashboard', {
                        errors
                    });
                }
                req.flash('success_msg', 'Cancellazione andata a buon fine!');
                res.redirect('../dashboard');
            })
        } else {
            pool.query('DELETE FROM salalan.prenotazioni WHERE prenotazioni.id_prenotazione =$1', [id_prenotazione], function (error, risposta) {
                if (error){
                    errors.push({msg : "Errori interni al database, riprova più tardi"});
                    res.render('/dashboard', {
                        errors
                    });
                }
                req.flash('success_msg', 'Cancellazione andata a buon fine!');
                res.redirect('../dashboard');
            })
        }
    })
});


module.exports = router;