module.exports = {
    ensureAuthenticated : function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Serve essere loggati per accedere a questa pagina');
        res.redirect('/users/login');
    },

    isAdmin : function (req, res, next) {
        if (req.user.ruolo == 'Admin'){
            return next();
        }
        req.flash('error_msg', 'Questa pagina è riservata agli amministratori!');
        res.redirect('/dashboard');
    }
}