var express = require("express");
var app = express();
var mongoose = require("mongoose");

var passport              = require("passport"),
	bodyparser            = require("body-parser"),
	LocalStrategy         = require("passport-local"),
	User            	  = require("./models/user"),
	passportLocalMongoose = require("passport-local-mongoose");



app.use(require("express-session")( {
	 secret:"arvika is best",
	 reSave: false,
	 saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyparser.urlencoded({extended:true}));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect("mongodb://localhost/auth_demo_app");
app.set('view engine','ejs');

//ROUTES

app.listen(3000,function() {
	console.log("listening on port 3000");
})

app.get("/",function(req,res) {
	res.render("home");
})

//AUTH ROUTES

app.get("/register", function (req,res) {
	res.render("register");
})

//registration
app.post("/register",function(req,res) {
	
	User.register(
	new User({username:req.body.username}),req.body.password, function(err,user) {
		
		if(err){
			console.log(err);
			return res.render("/register");
		}
		
		passport.authenticate("local")(req,res,function() {
			
			res.redirect("/secret");
		});
	});
	
	
});

// login routes

app.get("/login", function(req,res) {
	res.render("login");
})

// authenticate 
app.post("/login", passport.authenticate("local", {
	successRedirect: "/secret",
	failureRedirect: "/login"
}),function(req,res) {
	
});

app.get("/logout", function(req,res) {
	req.logout();
	res.redirect("/");
})

app.get("/secret",isLoggedIn,function(req,res) {
	res.render("secret");
})

function isLoggedIn(req,res,next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}