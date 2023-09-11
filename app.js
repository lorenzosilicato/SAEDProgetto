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

//View engine setup :
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use(express.urlencoded({ extended: true })); //Bodyparser
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret : 'grande stocchi',
    resave : false,
    saveUninitialized : true,
    cookie : {secure : false}
}));
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash());

//Middleware Variabili Globali per mostare messaggi flash durante il redirect
app.use((req, res, next)=>{
   res.locals.success_msg = req.flash('success_msg');
   res.locals.error_msg = req.flash('error_msg');
   res.locals.error = req.flash('error');
   next();
});
//Routes :

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));



app.listen(PORT, ()=>{
    console.log(`Applicazione avviata sulla porta ${PORT}`);
});

module.exports = app;
