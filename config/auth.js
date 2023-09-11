module.exports = {
    ensureAuthenticated : function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Serve essere loggati per accedere a questa pagina');
        res.redirect('/users/login');
    }
}