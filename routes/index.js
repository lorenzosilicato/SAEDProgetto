const express = require('express');
const {ensureAuthenticated, isAdmin} = require("../config/auth");
const router = express.Router();
const pool = require('../db');


//Gestione delle richieste GET
router.get('/', (req, res)=>{
    res.render('homepage');
});


router.get('/dashboard', ensureAuthenticated, (req, res)=>{
    let errors= []; //Array per mostrare gli errori tramite Flash
    //Query per ottenere tutti i dati che popoleranno la dashboard dell'utente
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

//Handler Dashboard
router.post('/dashboard', function (req, res){
    let errors= []; //Array per mantenere errori e inviarli poi tramite metodo render
    let id_prenotazione = req.body.id_prenotazione;
    //Query per controllare che i dati inviati dalla richiesta di cancellazione siano corretti
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
    });
});






//Sezione Admin

//In questo caso utilizziamo entrambi i middleware di controllo per confermare che l'utente sia autenticato e che sia un admin
router.get('/adminDashboard',ensureAuthenticated, isAdmin, (req, res)=>{
    let errors= [];
    const text = "SELECT prenotazioni.id_prenotazione, prenotazioni.data, prenotazioni.ora_inizio, prenotazioni.ora_fine, tipo_prenotazione,gioco, prenotazioni.postazione FROM salalan.prenotazioni LEFT JOIN salalan.iscrizione ON prenotazioni.id_prenotazione=iscrizione.id_prenotazione LEFT JOIN salalan.torneo ON iscrizione.id_torneo=torneo.id_torneo LEFT JOIN salalan.utente ON iscrizione.id_utente=utente.nome ORDER BY data;";
    pool.query(text, function (error, results){
        if(error){
            errors.push({msg : "Errore di selezione interno al database, contatta il tecnico se persiste"});
            res.redirect('/homepage', {
                errors
            });
        }
        let datiPrenotazioniAdmin = results.rows;
        pool.query("SELECT * FROM salalan.torneo", (error, results) => {
            if(error) {
                errors.push({msg: "Errore di selezione interno al database, contatta il tecnico se persiste"});
                res.redirect('/homepage', {
                    errors
                });
            }
            res.render('adminDashboard', { //Si renderizza la pagina EJS passando tutti i valori che la popoleranno
                nome : req.user.nome,
                email : req.user.email,
                numero_telefono : req.user.numero_telefono,
                datiPrenotazioniAdmin : datiPrenotazioniAdmin,
                datiTornei : results.rows
            });

        });
    });
});


router.post('/adminDashboard/cancellaPrenotazione', (req, res)=>{
    let errors= [];
    let id_prenotazione = req.body.id_prenotazione;
    pool.query('SELECT id_prenotazione, tipo_prenotazione FROM salalan.prenotazioni WHERE id_prenotazione=$1',[id_prenotazione], function (error, results) {
        if (error) {
            errors.push({msg : "Errore di selezione interno al database, contatta il tecnico se persiste"});
            res.render('/homepage', {
                errors
            });
        }
        //Questo check serve a distinguere le due query per la cancellazione dell'iscrizione, a seconda che essa sia un torneo o una prenotazione semplice
        if(results.rows[0].tipo_prenotazione === 'Torneo'){
            pool.query('DELETE FROM salalan.iscrizione WHERE iscrizione.id_prenotazione =$1', [id_prenotazione], function (error, risposta) {
                if (error) {
                    errors.push({msg : "Errore di cancellazione interno al database, contatta il tecnico se persiste"});
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
                    errors.push({msg : "Errore di cancellazione interno al database, contatta il tecnico se persiste"});
                    res.render('/dashboard', {
                        errors
                    });
                }
                req.flash('success_msg', 'Cancellazione andata a buon fine!');
                res.redirect('../adminDashboard');
            })
        }
    });
});

router.post('/adminDashboard/cancellaTorneo', (req, res)=>{
    let errors= [];
    let id_torneo = req.body.id_torneo;
    pool.query('DELETE FROM salalan.iscrizione WHERE iscrizione.id_torneo = $1', [id_torneo], function (error, results){
        if(error){
            errors.push({msg : "Errore di cancellazione interno al database, contatta il tecnico se persiste"});
            res.render('/dashboard', {
                errors
            });
        }
        pool.query('DELETE FROM salalan.torneo WHERE id_torneo = $1', [id_torneo], function (error, results) {
            if (error){
                errors.push({msg : "Errore di cancellazione interno al database, contatta il tecnico se persiste"});
                res.render('/dashboard', {
                    errors
                });
            }
            req.flash('success_msg', 'Cancellazione andata a buon fine!');
            res.redirect('../adminDashboard');
        });
    });
});

router.post('/adminDashboard/creaTorneo', (req, res)=>{
    let errors= [];
    const {gioco, data, ora_inizio, ora_fine, max_iscritti} = req.body;
    pool.query('INSERT INTO salalan.torneo(gioco,data,ora_inizio, ora_fine,max_iscritti) values ($1, $2, $3, $4, $5)',[gioco, data, ora_inizio, ora_fine, max_iscritti], function(error, results){
        if(error){
            errors.push({msg : "Errore di inserzione interno al database, contatta il tecnico se persiste"});
            res.render('/adminDashboard', {
                errors
            });
        }
        req.flash('success_msg', 'Creazione andata a buon fine!');
        res.redirect('../adminDashboard');
    })
});

module.exports = router;