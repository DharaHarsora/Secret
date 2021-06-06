//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDb", {useNewUrlParser: true});

const userSchema = {
  email: String,
  password: String
};
// const userSchema = new mongoose.Schema({
//   email: String,
//   password: String
// });

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const userObj = new mongoose.model("User", userSchema);

app.get("/", function(request, response){
  response.render("home");
});

app.get("/login", function(request, response){
  response.render("login");
});

app.post("/login", function(request, response){
  const username = request.body.username;
  // console.log(request.body.password);
  const password = md5(request.body.password);
  // console.log(password);
  userObj.findOne({email: username}, function(err, foundedUser){
    if(err){
      console.log(err);
    }else{
      if(foundedUser){
        if(foundedUser.password === password){
          response.render("secrets");
        }else{
          console.log(foundedUser.password + " " + password);
        }
      }
    }
  })
});

app.get("/register", function(request, response){
  response.render("register");
});

app.post("/register", function(request, response){
  console.log(md5(request.body.password));
  const newUser = new userObj({
    email: request.body.username,
    password: md5(request.body.password)
  });

  newUser.save(function(err){
    if(err){
      console.log(err);
      console.log(email + " " + password);
    }else{
      console.log("Succesfully saved");
      response.render("secrets");
    }
  });
});

// 1st
// plain text

// 2nd
// password + key ---cipher method--> cipher text (Here AES Algo)
// cipher method: letter substitution method, caeser cihper soon..

// 3rd
// password ---Hashing function--> Hash(Store in database)
// when it login then from hasing function find the hash_login if hash_login == hash(which is database) then login

app.listen(3000, function(){
  console.log("Server started on port 3000");
})
