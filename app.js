require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")


const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))

mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields:['password']})

const User = mongoose.model("User", userSchema)

app.get("/", function (req, res){
    res.render("home")
})

app.get("/login", function (req, res){
    res.render("login")
})

app.get("/register", function (req, res){
    res.render("register")
})

app.post("/register", function (req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    newUser.save().then(function (docs){
        res.render("secrets")
    }).catch(function (err){
        res.send(err)
    })
})

app.post("/login", async function (req, res){
    const existeUsuario = await User.findOne({email:req.body.username})
    if(existeUsuario){
        if(existeUsuario.password === req.body.password){
            res.render("secrets")
        }
    }else{
        res.render("login")
    }
})









app.listen(3000, function() {
    console.log("Servidor iniciado");
})