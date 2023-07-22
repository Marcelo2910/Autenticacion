require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))
app.set('trust proxy', 1) // trust first proxy
//Configuracion para usar express-session, el secreto es la clave que se usara para esta sesion o sesiones que inicien en este sitio web
app.use(session({
  secret: process.env.SESION_SECRET,
  resave: false,
  saveUninitialized: false,
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect(process.env.DATABASE)

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res){
    res.render("home")
})

app.get("/login", function (req, res){
    res.render("login")
})

app.get("/register", function (req, res){
    res.render("register")
})

app.get("/secrets", function (req, res){
    console.log(req.isAuthenticated());
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("/login")
    }
})


app.post("/register",async function (req, res){
    User.register({username: req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err)
            res.redirect("/register")
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets")
            })
        }
    })
})

app.post("/login", async function (req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    })

    req.logIn(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets")
            })
        }
    })

})

app.get("/logout", function (req, res, next){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})








app.listen(3000, function() {
    console.log("Servidor iniciado");
})