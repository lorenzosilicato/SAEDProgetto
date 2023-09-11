const LocalStrategy = require('passport-local').Strategy;
const db = require('../db');
const bcrypt = require('bcrypt');
const pool = require("../db");

module.exports = function (passport) {

    passport.serializeUser((user, done)=>{
        done(null, user.email);
    });

    passport.deserializeUser((email, done)=>{
        pool.query("SELECT * FROM salalan.utente where email=$1", [email] , function (error, results){
            done(error, results.rows[0]);
        });
    });

    passport.use(
        new LocalStrategy({usernameField: 'email', passwordField: 'password'}, (email, password, done)=>{
            //Query per matchare l'email
            pool.query("SELECT email, password FROM salalan.utente where email=$1", [email] , function (error, results){
                if(error) throw error;
                console.log(results.rows[0]);
                const user = results.rows[0];
                if(!results.rows[0]){
                    return done(null, false, {message : 'Questa email non è registrata'});
                }
                bcrypt.compare(password, user.password, (err, isMatch)=>{
                    if(err) throw err;
                    if(isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {message : 'Password incorretta'});
                    }
                });


            });
        })
    );
}