const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const bcrypt = require('bcrypt');
const nodemailer=require("nodemailer");
const sendgridTransport=require("nodemailer-sendgrid-transport");
const saltRounds = 10;
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false
  })
);
const { check, validationResult } = require('express-validator')

mongoose.connect("mongodb+srv://sammy:Samarth1@savner.7d7k3.mongodb.net/users", {
  useNewUrlParser: true,
    useUnifiedTopology: true
});

// app.use((req, res, next) => {
//   if (!req.session.user) {
//     return next();
//   }
//   User.findById(req.session.user._id)
//     .then(user => {
//       req.user = user;
//       next();
//     })
//     .catch(err => console.log(err));
// });

// app.use((req, res, next) => {
//   res.locals.isAuthenticated = req.session.isLoggedIn;
//   next();
// });

const userSchema=new mongoose.Schema({
  name:{
    type:String,
     required: true
  },
  mail:{
    type:String,
     required: true
  },
  phone:{
    type:String,
     // required: true
   },
  country:{
    type:String,
     required: true
   },
  state:{
    type:String,
     required: true
   },
  city:{
    type:String,
     required: true
  },
  group:{
    type:String,
     required: true
  },
  password:{
    type:String,
     required: true
   }
});

const donorSchema=new mongoose.Schema({
  name:{
    type:String,
     required: true
  },
  mail:{
    type:String,
     required: true
  },
  phone:{
    type:String,
     // required: true
   },
  country:{
    type:String,
     required: true
   },
  state:{
    type:String,
     required: true
   },
  city:{
    type:String,
     required: true
  },
  group:{
    type:String,
     required: true
  }
});

const User = mongoose.model("User", userSchema);
const Donor= mongoose.model("Donor",donorSchema);


app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{
    api_key: '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'
  }
}));

app.get("/", function(req, res){
  res.render("home");
});
app.get("/about", function(req, res){
  res.render("about");
});
app.get("/login", function(req, res){
  res.render("login");
});
var username="";
app.post("/login",function(req,res){
   username= req.body.email;
  const pass=req.body.your_pass;

  User.findOne({mail:username},function(err,foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        bcrypt.compare(pass,foundUser.password, function(err, result) {
             if(result===true){
              req.session.isLoggedIn = true;
              req.session.user = foundUser;
              return req.session.save(err => {
                // console.log(err);
                res.redirect('/');
              });
                 //res.redirect("/login");//to be changed
             }
             else{
                res.redirect("/login");
               console.log("Incorrect password");//to be changed
             }
          });
        }
      else{
         res.render("register1");//too be changed
      }
    }
  });
});

app.get("/thanks",function(req,res){
  res.render("thanks");

  User.findOne({mail:username},function(err,foundUser1){
    if(err){
      console.log(err);
    }
    else{
      Donor.findOne({mail:username},function(err,arr) {
        if(err){
          console.log(err);
        }
        if(arr===null){
          const usertemp = new Donor({
            name:foundUser1.name,
            mail:username,
            phone:foundUser1.phone,
            country:foundUser1.country,
            state:foundUser1.state,
            city:foundUser1.city,
            group:foundUser1.group,
            });
          usertemp.save();
        }
      });
      // const usertemp = new Donor({
      //   name:foundUser1.name,
      //   mail:username,
      //   phone:foundUser1.phone,
      //   country:foundUser1.country,
      //   state:foundUser1.state,
      //   city:foundUser1.city,
      //   group:foundUser1.group,
      //   });
      // usertemp.save();
    }
  });
});


app.get("/register1", function(req, res){
  res.render("register1");
});
app.post("/register1",[
  check('email', 'Email is not valid')
        .isEmail()
],function(req,res){
const errors = validationResult(req)
if(!errors.isEmpty()){
  const alert = errors.array()
  res.render("register1",{alert})
}
else{
bcrypt.hash(req.body.your_pass, saltRounds, function(err, hash) {
    const newUser=new User({
      name: req.body.your_name,
      mail:req.body.email,
      phone:req.body.phone,
      country:req.body.country,
      state:req.body.state,
      city:req.body.city,
      group:req.body.b_group,
      password:hash
    });
    User.findOne({mail:req.body.email},function(err,mila){
      if(mila===null){
          newUser.save(function(err){
            if(err)
            {
              console.log(err);
            }
            else{
              res.render("login");
              transporter.sendMail({
               to:req.body.email,
               from:'samarth.btp.1234@gmail.com',
               subject:'SAVNER Registration',
               html:'<h1>Successfully signed up!</h1>'
              });
              
            }
          });
        }
        else{
          res.render("login");
        }
      });

  });
}
     });

app.get("/find", function(req, res){
  res.render("find");
});


app.post("/about", function(req, res){
  const tname=req.body.txtName;
  const tmail=req.body.txtEmail;
  const tphn=req.body.txtPhone;
  const tmsg=req.body.txtMsg;
  res.render("thanks");
});


app.post("/find",function(req,res){
    const bgrp=req.body.groups;
    const reqcity=req.body.hospital_city;
    const reqstate=req.body.hospital_state;

    Donor.find({group:bgrp,city:reqcity},function(err,foundans){
      if(err){
        console.log(err);
      }
      else{
        if( foundans.length>0){
          res.render("results",{resultarray:foundans})
        }
        if(foundans.length===0){
          Donor.find({group:bgrp,state:reqstate},function(err,found){
            if(err){
              console.log(err);
            }
            else{
              if(found.length>0){
                 res.render("results",{resultarray:found})
              }
              if(found.length===0){
                res.render("negative");
                // found=["We will let you know asap"]
                // res.render("result1",{resultarray:found})
                // console.log("We will let you know asap");
              }
            }
          });
        }
      }
    });
});
app.get("/logout",function(req, res){
  req.session.destroy(err => {
    // console.log(err);
    res.redirect('/');
  });
});

app.get("/helper", function(req, res){
  res.render("helper");
});


app.post("/helper", function(req, res){
  const bgrp=req.body.b_group;
  const dname=req.body.your_name;
  const dcity=req.body.city;
  const dmail=req.body.email;
  const dphn=req.body.phone;
  Donor.deleteOne({ mail:dmail },function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect('/');
    }
  });

});

app.get("/negative", function(req, res){
  res.render("negative");
});






let port=process.env.PORT;
if(port==null||port==""){
  port=3000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});
