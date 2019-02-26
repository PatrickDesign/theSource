var express = require("express");
var dbConnection = require("./connections"); //get db connection
var app = express();
var http = require("http").Server(app);
var bodyParser = require("body-parser");
// var mongoose = require("mongoose");

//import schemas
var User = require("./schemas/user");
app.use(bodyParser.urlencoded({extended: true}));


//setup file structure:
app.use(express.static("public"));

app.set("view engine", "ejs");

app.set('views', './views');


//ROUTES=========================
app.get('/', (req, res) => {
  res.render("index");
});

app.get("/addUser", (req, res) =>{
  res.render("addUser");
});

app.get("/viewUsers", (req, res) =>{

  User.find({}, function(err, allUsers){
    if(err)
      console.log(err);
    else {
      res.render("newUsers", {users: allUsers});
    }
  });

});

app.post('/addUser', (req, res) => {
  var newUserName = {name: req.body.newUserName};

  // var UserObject = dbConnection.model('User', User, 'user_accounts');

  var currUser = new User({name: req.body.newUserName});

  currUser.save()
    .then(doc => {
      res.send("ADDED NEW USER: " + req.body.newUserName);
    })
   .catch(err => {
      console.error(err)
    })

});

//END ROUTES=========================

//SPINUP SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Serving app..."));
