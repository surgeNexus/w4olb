var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var middleware = require("../middleware");

//root route
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        profileInfo: req.body.profileInfo,
        profileImage: req.body.profileImage
    });
        if(req.body.memberCode === '1'){
            newUser.isMember = true;
        }
        if(req.body.memberCode === '2'){
            newUser.isAdmin = true;
            newUser.isMember = true;
        }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err.message);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to W4OLB, " + user.username);
            res.redirect("/radiomarket"); 
        });
    });
});
//show login form
router.get("/login", function(req, res){
   res.render("login"); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/radiomarket",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: 'Welcome Back!'
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/radiomarket");
});

router.get("/netsched", function(req, res){
    res.render("netsched")
})

// USERs PAGE
router.get("/users/", function(req, res){
    User.find({}, function(err, allUsers){
        if(err){
            req.flash("error", "Something went wrong");
        } else {
            res.render("users/index", {users: allUsers, page: 'users'});
        }
    });
});

// USER PROFILE
router.get('/users/:id', function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "Something went wrong");
            res.redirect('/home');
        } 
        Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
            if(err){
                req.flash("error", "Something went wrong");
                res.redirect('/home');
            } 
            res.render("users/show", {user: foundUser, campgrounds: campgrounds});
        })
    });
});

// USER PROFILE UPDATE
router.get("/users/:_id/edit", middleware.checkProfileOwnership, function(req, res){
    User.findById(req.params._id, function(err, foundUser){
        res.render("users/edit", {user: foundUser});
    });
});
// UPDATE CAMPGROUND ROUTE
router.put("/users/:id", function(req, res){
    // find and update the correct campground
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
        if(req.body.memberCode === "1"){
            updatedUser.isMember = true;
        }
        if(req.body.memberCode === "2"){
            updatedUser.isAdmin = true;
            updatedUser.isMember = true;
        }
        if(err){
            req.flash("error", "Something went wrong")
            res.redirect("/radiomarket");
        } else {
            res.redirect("/users/" + req.params.id);
        }
    });
});
module.exports = router;