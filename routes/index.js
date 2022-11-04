var express = require('express');
const user = require('../models/userModel');
var router = express.Router();

const nodemailer = require("nodemailer");
const {google} = require("googleapis");
const CLIENT_ID = "797203643952-vnn12no4rko07v966bqthootoo5kkbud.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = "1//04FkeBVs0GndzCgYIARAAGAQSNwF-L9IrysxgoIA6yPQdrkodVFOV6aByAhco3NayLlN8OxAcdTuZBVNR3czij-80VETzdzrKLTI";


const OAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
OAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(to, link) {
  try {
      const accessToken = await OAuth2Client.getAccessToken();
      const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
              type: "OAuth2",
              user: "priyanshiy66@gmail.com",
              clientId: CLIENT_ID,
              clientSecret: CLIENT_SECRET,
              refreshToken: REFRESH_TOKEN,
              accessToken: accessToken,
          },
      });

      const mailOptions = {
          from: "PRIYANSHI THE DEVELOPER <priyanshiy66@gmail.com>",
          to,
          subject: "Change Password",
          html: `<h1>Click link below</h1>click <a href="${link}">here</a> to change password.`,
          // html: '<a href="https://www.google.com">here</a>',
      };
      const result = await transport.sendMail(mailOptions);
      return result;
  } catch (error) {
      return error;
  }
}




var upload = require("../utils/upload.js")
var Post = require("../models/postModel.js")
var fs = require("fs");
const path = require("path");
// var User = require("../models/userModel");

var passport = require("passport");
var localstrategy = require("passport-local");
const { route } = require('../app');
passport.use(new localstrategy(user.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('signin', { title: 'SignIn Page' });
});

router.get('/signup', function(req, res, next) {
  res.render('signup',{ title: 'SignUp Page' });
});



router.post('/signup', function(req, res, next) {
  // res.json(req.body);
  // user.create({
  //   username:req.body.username,
  //   name:req.body.name,
  //   email:req.body.email,
  //   password:req.body.password,
  // })
  // .then(function(createduser){
  //   res.send(createdUser);
  // })
  // .catch(function(err){
  //   res.send(err);
  // })
  // const {username,name,email,password} = req.body
  var newUser = new user({
        username:req.body.username,
        name:req.body.name,
        email:req.body.email,
  })
  user.register(newUser, req.body.password)
  .then(() => {
    //  passport.authenticate("local")(req,res,function(){
      // res.redirect('/signin');
    //  })
     res.redirect('/signin');
  })
  .catch((err) => res.send(err));
});



router.get('/signin', function(req, res, next) {
  res.render('signin',{ title: 'SignIn Page' });
});

// Post.find({postTitle:"india",postedBy:req.user,postContent:"MP",postTitle:null,createdAt:'2020-01-01'})

router.get("/profile", isLoggedIn, function (req, res, next) {
  Post.find({postedBy:req.user})
    .then(function(posts){
      res.render("profile" ,{
        posts,
        title: 'Profile Page',
        isloggedin: req.user ? true : false,
        user: req.user,
    });
    })
    .catch(function(err){
      res.send(err);
    })
  
});

/** POST Profile/:id page */
router.post("/profile/:id", isLoggedIn, function (req, res, next) {
  const {username} = req.body;
  user.find({username})
  .then(function(userFound){
    if(!userFound || String(userFound._id)===(String(req.params.id))){
      user.findByIdAndUpdate(req.params.id, {$set: req.body}, { new: true })
      .then(function (userUpdated) {
          res.redirect("/profile");
          // res.json(userUpdated);
      })
      .catch(function (err) {
          res.send(err);
      });
     }
     else{
      res.send("username already exists");
     }
  })
 
});


/** POST /uploadimage/:id page */
router.post(
  "/uploadimage/:id",
  isLoggedIn,
  upload.single("avatar"),
  function (req, res, next) {
      // upload(req, res, function (err) {
      // if (err) res.send(err);
      user.findByIdAndUpdate(
          req.params.id,
          { $set: { avatar: req.file.filename } },
          { new: true }
      )
          .then(function () {
              if (req.body.oldavatar !== "dummy.jpg") {
                  fs.unlinkSync(
                      path.join(
                          __dirname,
                          "..",
                          "public",
                          "uploads",
                          req.body.oldavatar
                      )
                  );
              }
              res.redirect("/profile");
          })
          .catch(function (err) {
              res.send(err);
          });
      // })
  }
);


router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/timeline",
    failureRedirect: "/signin"
  }),
  function(req,res,next){}
)

router.get("/logout",isLoggedIn, function(req,res){
  req.logout(function(){
    res.redirect("/");
  })
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    next();
    return;
  }
  res.redirect("/");
}



router.get('/forgetpassword', function(req, res, next) {
  res.render('forgetpassword',{ title: 'Forgot Password' });
});


router.post("/forgot-password", function (req, res) {
  const { email } = req.body;
  user.findOne({ email })
      .then(function (userFound) {
          if (!userFound)
              return res.render("forgetrender",{ title: 'Forgot Password' });

          const link = `${req.protocol}://${req.get(
              "host"
          )}/change-password/${userFound._id}`;
          sendMail(userFound.email, link)
              .then(function (result) {
                  console.log("email sent...");
                  userFound.refreshToken = 1;
                  userFound.save();
                  res.send("<h1>check inbox!<h1><a href='/'>Go Home</a>");
                  // res.json()
              })
              .catch(function (err) {
                  console.log(err);
              });
      })
      .catch(function (err) {
          res.send(err);
      });
});


router.get("/change-password/:id", function (req, res) {
  user.findById(req.params.id)
      .then(function (user) {
          if (user.refreshToken === 1) {
              res.render("changepassword", {
                  id: req.params.id,
                  title: "Change Password",
                  isloggedin: false,
              });
          } else {
              res.send("Sorry!!!! The Link has been expired.....");
          }
      })
      .catch(function (err) {
          res.send(err);
      });
});

router.post("/change-password/:id", function (req, res) {
  user.findById(req.params.id)
      .then(function (userFound) {
          if (!userFound)
              return res.render("resetrender",{ title: 'Change Password' });

          userFound.setPassword(req.body.password, function (err, user) {
              if (err) {
                  res.send(err);
              }
              else{
                userFound.refreshToken = undefined;
                userFound.save();
                res.redirect("/");
              }
              
          });
      })
      .catch(function (err) {
          res.send(err);
      });
});


router.get('/resetpassword',isLoggedIn, function(req, res, next) {
  res.render('resetpassword',{user:req.user,title: 'Reset Password' });
});


router.post('/resetpassword',isLoggedIn, function(req, res, next) {
  const {oldpassword, newpassword} = req.body;
  req.user.changePassword(oldpassword,newpassword,function(err,user){
    if(err) res.render("resetrender",{ title: 'Reset Password' });
    else
    res.redirect("/timeline");
    
  })
});




router.get('/post',isLoggedIn, function(req, res, next) {
  res.render('post',{user:req.user,title: 'Create Post' });
});



router.post('/create-post',isLoggedIn,upload.single("avatar"),function(req,res){
    Post.create({
      postContent:req.body.content,
      postedBy:req.user._id,
      avatar:req.file.filename,
      postTitle:req.body.title,
    })
    .then(function(postCreated){
      req.user.posts.push(postCreated);
      req.user.save();
      res.redirect('/timeline');
    })
    .catch(function(err){
      res.send(err)
    })
})


router.get('/timeline',isLoggedIn, function(req, res, next) {

  Post.find()
  .then(function(posts){
    user.find().
    then(function(users){
      res.render("timeline",{posts,user:req.user,users,title: 'Home'} )
    })
    
  })
  .catch(function(err){
    res.send(err);
  })
  
});




router.get('/like/:id',isLoggedIn, function(req, res, next) {
 Post.findById(req.params.id)
 .then(function(post){
  if(post.dislikes.includes(req.user._id)){
    post.dislikes.remove(req.user._id);
  }
  if(!post.likes.includes(req.user._id)){
    post.likes.push(req.user);
  }else{
    post.likes.remove(req.user._id);
  }
  post.save();
  res.redirect('/timeline');
 })
  
});

router.get('/dislike/:id',isLoggedIn, function(req, res, next) {
  Post.findById(req.params.id)
  .then(function(post){
   if(post.likes.includes(req.user._id)){
     post.likes.remove(req.user._id);
   }
   if(!post.dislikes.includes(req.user._id)){
     post.dislikes.push(req.user);
   }else{
     post.dislikes.remove(req.user._id);
   }
   post.save();
   res.redirect('/timeline');
  })
   
 });



 router.get('/delete-post/:id',isLoggedIn,function(req, res, next) {
  Post.findById(req.params.id)
  .then(function(postFound){
    fs.unlinkSync(path.join('public','uploads',postFound.avatar));
    req.user.posts.remove(postFound);
    req.user.save();
    postFound.delete();
    res.redirect("/profile");
  })
  .catch(function(err){
    res.send(err);
  })
  
});



router.get('/delete-account',isLoggedIn, function(req, res, next) {
  Post.find({
    postedBy:req.user.id
  })
  .then(function(posts){
   posts.forEach(function(post){
    fs.unlinkSync(path.join("public","uploads",post.avatar));
    post.delete();
   })
  })
  if(req.user.avatar!="dummy.jpg"){
    fs.unlinkSync(path.join("public","uploads",req.user.avatar));
  }
  req.user.delete();
  res.render('signin',{ title: 'Delete Account' })
  .catch(function(err){
    res.send(err);
  })
  
});

module.exports = router;
