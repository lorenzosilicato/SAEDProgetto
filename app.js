const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const app = express();
const path = require('path')
const PORT = 8080;
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

//Passport Config
require('./config/passport')(passport);

//Setup dell'engine EJS per gestire le pagine frontend
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//Inizializzazione del middleware di Session
app.use(session({
    secret : 'Il mio segreto',
    resave : false,
    saveUninitialized : true,
    cookie : {secure : false}
}));

//Inizializzazione di Passport per la gestione delle sessioni e della logica di login/registrazione
app.use(passport.initialize());
app.use(passport.session());

//Inizializzazione del middleware Flash
app.use(flash());

//Middleware Variabili Globali per mostare messaggi flash durante il redirect
app.use((req, res, next)=>{
   res.locals.success_msg = req.flash('success_msg');
   res.locals.error_msg = req.flash('error_msg');
   res.locals.error = req.flash('error');
   next();
});


//Routes :

app.use('/', require('./routes/index')); //Route per gestione pagina Homepage e Dashboard
app.use('/users', require('./routes/users')); //Route per gestione Login/Register
app.use('/iscrizioni', require('./routes/iscrizioni')); //Route per gestione di tutti i tipi di iscrizioni


app.listen(PORT, ()=>{
    console.log(`Applicazione avviata sulla porta ${PORT}`);
});

module.exports = app;
