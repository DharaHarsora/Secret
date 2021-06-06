//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDb", {useNewUrlParser: true});

// const userSchema = {
//   email: String,
//   password: String
// };
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const userObj = new mongoose.model("User", userSchema);

app.get("/", function(request, response){
  response.render("home");
});

app.get("/login", function(request, response){
  response.render("login");
});

app.post("/login", function(request, response){
  const username = request.body.username;
  const password = request.body.password;

  userObj.findOne({email: username}, function(err, foundedUser){
    if(err){
      console.log(err);
    }else{
      if(foundedUser){
        if(foundedUser.password === password){
          res.render("secrets");
        }
      }
    }
  })
});

app.get("/register", function(request, response){
  response.render("register");
});

app.post("/register", function(request, response){
  const newUser = new userObj({
    email: request.body.username,
    password: request.body.password
  });

  newUser.save(function(err){
    if(err){
      console.log(err);
      // console.log(email + " " + password);
    }else{
      console.log("Succesfully saved");
      response.render("secrets");
    }
  });
});

app.listen(3000, function(){
  console.log("Server started on port 3000");
})
