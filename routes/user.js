var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware")

router.get('/', middleware.isLoggedIn, function(req, res,){
    if(!isLoggedIn){
        res.redirect("/home");
    } else{
        res.render('user/users');
        }
});

router.get('/profile/:id', function(req, res){
    User.findById(req.params.user, function(err, foundUser){
        if(err || !foundUser){
            req.flash("error", "User not found")
            res.redirect('back');
        } else {
            res.render('user/profile/:id', {user_id: foundUser})
        }
    })
})

module.exports = router;