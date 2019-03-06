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
var Comment = require("./schemas/comment");
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
app.use((req, res, next) =>
{
  res.locals.currentUser = req.user;
  next();
});




//==========================


//ROUTES=========================


app.get("/projects/:id", (req, res) =>
{

  //find the project with id (get the ID from the URL)
  //sort comments by 'rating'
  Project.findById(req.params.id).populate({ path: "comments", options: { sort: { rating: -1 } } }).exec((err, foundProject) =>
  {
    if (err)
      console.log(err);
    else
    {
      res.render("projectPage", { project: foundProject, isLoggedInFlag: isLoggedInFlag(req, res) }); //render view template with that project
    }
  });
});


//COMMENT ROUTES=========================

//create a new comment
app.post("/projects/:id/comments", (req, res) =>
{

  //get project object from DB
  Project.findById(req.params.id, (err, project) =>
  {
    if (err)
    {
      console.log(err);
      res.redirect("/projects/" + req.params.id);
    }
    else
    { //on success,
      Comment.create(
      {
        text: req.body.commentText,
        author: req.user.username
      }, (err, comment) =>
      {
        if (err)
          console.log(err);
        else
        {
          project.comments.unshift(comment); //push comment to front of array of comments in project.
          //re-sort the comments based on rating

          project.save();
          res.redirect("/projects/" + req.params.id);
        }
      });
    }
  });
});


//UPVOTE a comment:
app.post("/projects/:id/comments/:commentId/upvote", (req, res) =>
{

  if (isLoggedInFlag(req, res))
  {
    Comment.updateOne({ "_id": req.params.commentId }, { $inc: { rating: 1 } }, (err, foundComment) =>
    {
      if (err)
        console.log(err);
      else
      {

        //redirect back to project (might want to make ajax later to avoid refresh)
        res.redirect("/projects/" + req.params.id);
      }
    });
  }
  else
  {
    res.redirect("/login");
  }
});

//DOWNVOTE a comment:
app.post("/projects/:id/comments/:commentId/downvote", (req, res) =>
{
  if (isLoggedInFlag(req, res))
  {
    Comment.updateOne({ "_id": req.params.commentId }, { $inc: { rating: -1 } }, (err, foundComment) =>
    {
      if (err)
        console.log(err);
      else
        res.redirect("/projects/" + req.params.id);
    });
  }
  else
  {
    res.redirect("/login"); //redirect back to login page (need to fix UX =>redirect back to original project once they login.)
  }
});


//========================================


app.get("/about", (req, res) =>
{

  res.render("about");
});

app.get("/explore", (req, res) =>
{
  //Start displaying all projects
  Project.find({}, (err, foundProjects) =>
  {
    if (err)
      console.log(err);
    else
    {
      res.render("explore", { projects: foundProjects });
    }
  });
});



app.get("/search", (req, res) =>
{
  res.render("search");
});


//SEARCH
app.post("/search", (req, res) =>
{

  Project.find({ $text: { $search: req.body.projectSearch } })
    .limit(10)
    .exec(function (err, foundProjects)
    {
      if (err)
        console.log(err);
      else
      {
        res.render("search", { projects: foundProjects });
      }
    });

});

app.get("/contact", (req, res) =>
{

  res.render("contact");
});

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

  User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password, (err, user) =>
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

function isLoggedInFlag(req, res)
{
  if (req.isAuthenticated())
    return true;
  return false;
}

///////

//SPINUP SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Serving app..."));
