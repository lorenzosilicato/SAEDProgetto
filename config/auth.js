module.exports = {

    //Middleware per limitare l'accesso ad una route agli utenti autenticati
    ensureAuthenticated : function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Serve essere loggati per accedere a questa pagina');
        res.redirect('/users/login');
    },
    //Middleware per limitare l'accesso ad una route agli utenti che sono Admin
    isAdmin : function (req, res, next) {
        if (req.user.ruolo == 'Admin'){
            return next();
        }
        req.flash('error_msg', 'Questa pagina è riservata agli amministratori!');
        res.redirect('/dashboard');
    }
}