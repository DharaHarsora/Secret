//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
const session = require('express-session');
const passport = require('passport');
const passportlocalmongoose = require("passport-local-mongoose");

const app = express();
const saltRound = 10; // 10 hash / sec

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "Out little secret.",
  resave: false,
  saveUninitialized: false
}));

// when server is started only when cookie we can use if we disconnect it then cookie will lost and we can't go to direct secrets page

// initalize the passport package
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDb", {useNewUrlParser: true});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// hash karta he and pwd mongoose save
userSchema.plugin(passportlocalmongoose)

// const userSchema = new mongoose.Schema({
//   email: String,
//   password: String
// });

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const userObj = new mongoose.model("User", userSchema);

passport.use(userObj.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(userObj.serializeUser());
passport.deserializeUser(userObj.deserializeUser());
// serilize -> create cookie and store the user credential into cookie
// deserilize -> it allows passport to decode the cookie and descover the msg


app.get("/", function(request, response){
  response.render("home");
});

app.get("/login", function(request, response){
  response.render("login");
});

app.post("/login", function(request, response){
    const user = new userObj({
      username: request.body.username,
      password: request.body.password
    });
    request.login(user, function(err){
      if(err){
        console.log(err);
      }else{
        passport.authenticate("local")(request, response, function(){
          response.redirect("/secrets");
        })
      }
    });
  // const username = request.body.username;
  // const password = (request.body.password);
  // userObj.findOne({email: username}, function(err, foundedUser){
  //   if(err){
  //     console.log(err);
  //   }else{
  //     if(foundedUser){
  //       console.log(password + " " + foundedUser.password);
  //       bcrypt.compare(password, foundedUser.password, function(err, res) {
  //         if(res == true){
  //             response.render("secrets");
  //         }else{
  //           response.send("password not matched")
  //         }
  //       });
  //       // if(foundedUser.password === password){
  //       //   response.render("secrets");
  //       // }
  //     }
  //   }
  // })
});

app.get("/logout", function(request, response){
  request.logout();
  response.redirect("/");
});

app.get("/register", function(request, response){
  response.render("register");
});

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

app.post("/register", function(request, response){
  // In passport.local.mongoose register
  userObj.register({username: request.body.username}, request.body.password, function(err, user){
    if(err){
      console.log(err);
      response.redirect("/register");
    }else{
      passport.authenticate("local")(request, response, function(){
        response.render("secrets");
      })
    }
  })
  // bcrypt.hash(request.body.password, saltRound, function(err, hash) {
  //     // Store hash in your password DB.
  //     const newUser = new userObj({
  //       email: request.body.username,
  //       password: hash
  //     });
  //
  //     newUser.save(function(err){
  //       if(err){
  //         console.log(err);
  //         console.log(email + " " + password);
  //       }else{
  //         console.log("Succesfully saved");
  //         response.render("secrets");
  //       }
  //     });
  // });
});

// 1st
// plain text

// 2nd
// password + key ---cipher method--> cipher text (Here AES Algo)
// cipher method: letter substitution method, caeser cihper soon..

// 3rd
// password ---Hashing function--> Hash(Store in database)
// when it login then from hasing function find the hash_login if hash_login == hash(which is database) then login

// salting
// userPwd + (random set of number) --hash function--> hash

// 5th cookies and sessions


app.listen(3000, function(){
  console.log("Server started on port 3000");
})
