var express = require("express");
var dbConnection = require("./connections"); //get db connection
var app = express();
var http = require("http").Server(app);
var bodyParser = require("body-parser");
var mongoose = require("mongoose"),
  passport = require("passport"),
  localStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  expressSession = require("express-session");

//=================Session:

app.use(expressSession(
{
  secret: "This is a secrety about my doggie",
  resave: false,
  saveUninitialized: false
}));

//=========================

//=============import schemas:
var User = require("./schemas/user");
var Project = require("./schemas/project");
app.use(bodyParser.urlencoded({ extended: true }));
//===========================

//======setup file structure:
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set('views', './views');
//=========================

//============AUTHENTICATION:
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//==========================


//ROUTES=========================


//Auth Routes:

//Sign up form:
app.get("/register", (req, res) =>
{
  res.render("addUser");
});

// app.post('/register', (req, res) =>
// {
//   res.send("HELLO");
// });

app.post('/register', (req, res) =>
{

  User.register(new User({ username: req.body.username }), req.body.password, (err, user) =>
  {
    if (err)
    {
      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, () =>
    {
      res.redirect("/");
    });
  });

});

app.get("/login", (req, res) =>
{
  res.render("login");
});

app.post("/login", passport.authenticate("local",
{
  successRedirect: "/",
  failureRedirect: "/login"
}), (req, res) =>
{

});

app.get("/logout", (req, res) =>
{
  req.logout();
  res.redirect("/");
})


//////////////


app.get('/', (req, res) =>
{
  Project.find({}, function (err, allProjects)
  {
    if (err)
      console.log(err);
    else
    {
      res.render("index", { projects: allProjects });
    }
  });
});


app.get("/addProject", (req, res) =>
{
  res.render("addProject");
});

app.get("/viewUsers", (req, res) =>
{

  User.find({}, function (err, allUsers)
  {
    if (err)
      console.log(err);
    else
    {
      res.render("newUsers", { users: allUsers });
    }
  });

});

app.post('/addProject', (req, res) =>
{

  var currProject = new Project({ name: req.body.newProjectName, coverPath: req.body.newCoverPath, description: req.body.newProjectDescription });


  currProject.save()
    .then(doc =>
    {
      res.send("ADDED NEW Project: " + req.body.newProjectName);
    })
    .catch(err =>
    {
      console.error(err)
    })

});

//END ROUTES=========================

//Helper functions

function isLoggedIn(req, res, next)
{
  if (req.isAuthenticated())
    return next;

  res.redirect("/login");
}

///////

//SPINUP SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Serving app..."));
