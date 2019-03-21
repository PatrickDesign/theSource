//Todo's:
  //1.) IMPROVE FRONT END ROUGH EDGES
    //1a) NAVBAR
  //2.) Create edit project page
    //2a) Allow owners to add updates easily to projects
  //3.) Special outline for project owners in comments section of their projects
  //4.) Finish User dashboard
  //5.) Create 'money' form to 'donate'

  //6.) Organize codebase




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
  res.locals.sdgCategories = ["No Poverty", "Zero Hunger", "Good Health and Well-Being", "Quality Education", "Gender Equality", "Clean Water and Sanitation", "Affordable and Clean Energy", "Decent Work and Economic Growth", "Industry, Innovation and Infastructure", "Reduced Inequalities", "Sustainable Cities and Communities", "Responsible Production and Consumption", "Climate Action", "Life Below Water", "Life On Land", "Peace, Justice and Strong Institutions", "Partnerships for the Goals"];
  next();
});




//==========================


//ROUTES=========================


app.get("/projects/:id", (req, res) =>
{

  //find the project with id (get the ID from the URL)
  //sort comments by 'rating'
  Project.findById(req.params.id).populate({ path: "comments", options: { sort: { rating: -1 } } }).populate("owners").exec((err, foundProject) =>
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

          //Add comment to both project history and user history.

          //query to find the user db object:
           User.findById(req.user._id, (err, foundUser) =>
            {

              if(err)
                console.log(err);
              else{
                foundUser.comments.unshift(comment); //add comment to found user's comments array.
                foundUser.save(); //update db
              }

            });




           Project.findById(req.params.id, (err, project) =>
            {
              if (err)
              {
                console.log(err);
                res.redirect("/projects/" + req.params.id);
              }
              else
              { //on success,
                project.comments.unshift(comment); //push comment to front of array of comments in project.
                project.save();
              }
          });

          res.redirect("/projects/" + req.params.id);

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

app.get("/dashboard", (req, res) =>
{
  User.findById(req.user._id).populate({ path: "followedProjects , ownedProjects" }).exec((err, foundUser) =>
  {
    if (err)
      console.log(err);
    else
    {
      res.render("dashboard", { user: foundUser });
    }
  });
});

app.get("/explore", (req, res) =>
{

  if (Object.keys(req.query).length > 0)
  {

    //Display only the projects with this category
    var categoryName = req.query.category;
    console.log(categoryName);
    Project.find({ 'sdgCategory': categoryName }, (err, foundProjects) =>
    {
      if (err)
        console.log(err);
      else
      {
        res.render("explore", { projects: foundProjects });
      }
    });
  }
  else
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
  }


});

//Filter routes:
app.post("/explore", (req, res) =>
{

  // Project.find({}, function (err, allProjects)
  // {
  //   if (err)
  //     console.log(err);
  //   else
  //   {
  //     res.render("index", { projects: allProjects });
  //   }
  // });


  Project.find({ 'sdgCategory': req.body.sdgCategory }, (err, foundProjects) =>
  {
    if (err)
      console.log(err);
    else
      res.redirect("/explore?category=" + req.body.sdgCategory);
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
      Project.find({$expr:{$gte:["$earnings", "$goal"]}}, function(err, finishedProjects)
      {
        if(err)
          console.log(err);
        else
        {
          res.render("index", { projects: allProjects, finishedProjects: finishedProjects });
        }
      });
      // res.render("index", { projects: allProjects });
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


  // app.post('/projects/:id/startPayment', (req, res) =>
  // {

  //   if(req.params.donationAmount > 0){
  //     return res.redirec
  //   }

  // });

  app.get('/projects/:id/updates/addUpdate', (req, res) =>
  {

    User.findById(req.currentUser._id, (err, foundUser) =>
    {

      if(err)
        console.log(err);
      else{

        Project.findById(req.params.id, (err, foundProject) =>
        {

          if(err)
            console.log(err);
          else{
            //At this point, we found the user and the project
            return res.render("addUpdate", {project: foundProject, user: foundUser})
          }

        });

      }

    });

    return res.redirect("/projects/" + req.params.id);

  });


//Update a project's earnings field
  app.post('/projects/:id/acceptPayment', (req, res) =>
  {

    // req.body.donationAmount contains the amount to update project by
    Project.findById(req.params.id, (err, projectToUpdate) =>
    {
      if(err)
        console.log(err);
      else{
        if(req.body.donationAmount > 0){
          projectToUpdate.earnings = (parseInt(projectToUpdate.earnings) + parseInt(req.body.donationAmount));
          projectToUpdate.save((err, project) =>
            {
              return res.redirect("/projects/" + projectToUpdate._id);
            });
        }else{
          return res.redirect("/projects/" + projectToUpdate._id);
        }
      }

    });

  });


//FOLLOW A PROJECT
app.post('/projects/:id/follow', (req, res) =>
{
  if(isLoggedInFlag(req, res)){
    Project.findById(req.params.id, (err, foundProject) =>
    {
      if(err)
        console.log(err);
      else{

        User.findById(req.user._id, (err, foundUser) =>
        {
          if(err)
            console.log(err);
          else{
            foundUser.followedProjects.unshift(foundProject); //add project to user following list
            foundUser.save();
            foundProject.followingUsers.unshift(foundUser); //add user to project followers list
            foundProject.save((err, project) => {
              res.redirect("/projects/" + req.params.id);
            });
          }
        });
      }
    });
  }else{
    res.redirect("/login");
  }

});


//UNFOLLOW a project
app.post('/projects/:id/unfollow', (req, res) =>
{
  Project.findById(req.params.id, (err, foundProject) =>
  {
    if(err)
      console.log(err);
    else{

      User.findById(req.user._id, (err, foundUser) =>
      {
        if(err)
          console.log(err);
        else{

          //Remove project from user list, and user from project list
          foundUser.followedProjects.forEach((project, index) => {

            if (project.equals(foundProject._id))
              foundUser.followedProjects.splice(index, 1);

          });

          foundProject.followingUsers.forEach((user, index) => {

            if (user.equals(foundUser._id))
              foundProject.followingUsers.splice(index, 1);

          });


          foundUser.save();
          foundProject.save( (err, newProjectName) => {
            res.redirect("/projects/" + req.params.id);
          });
        }
      });
    }
  });

});

//Actually edit a project model:
app.post("/projects/:id/edit", (req, res) =>
{

  Project.updateOne({"_id" : req.params.id}, {"FAQ" : req.params.newProjectFAQ, "about" : req.params.newProjectAbout, "description" : req.params.newProjectDescription, "coverPath" : req.params.newCoverPath},  (err, updatedProject) =>
  {

    if(err)
      console.log(err);
    else{
      updatedProject.save((err, savedProject) =>
      {
        return res.redirect("/projects/" + req.params.id);
      });
    }

  });

  res.redirect("/projects/" + req.params.id);

});


//Edit a project (view):
  //could create 'isProjectOwner' middleware
app.get("/projects/:id/edit", (req, res) =>
{

  if(req.user == null){
    return res.redirect("/projects/" + req.params.id);
  }



  Project.findById(req.params.id, (err, foundProject) =>
  {
    if(err)
      console.log(err);
    else{


      //check if user is owner of requested project:
      isInArray = foundProject.owners.some((projectOwner) => {
          return projectOwner.equals(req.user._id);
      });

      if(isInArray){
        return res.render("projectEdit", {project: foundProject});
      }else{
        return res.redirect("/projects/" + req.params.id);
      }

    }

  });

});




app.post('/addProject', (req, res) =>
{



  var newId = mongoose.Types.ObjectId();

  var currProject = new Project({ name: req.body.newProjectName,
    coverPath: req.body.newCoverPath,
    description: req.body.newProjectDescription,
    about: req.body.newProjectAbout,
    FAQ: req.body.newProjectFAQ,
    goal: req.body.newProjectGoal,
    sdgCategory: req.body.newProjectSDGGoal,
    fundingType: req.body.newProjectFundingType,
    sdgCategory: req.body.newProjectSDGCategory,
    _id: newId });



  currProject.save((err, createdProject) =>{

      //Associate owners with a project.
      User.findById(req.user._id, (err, foundUser) =>
      {

        if(err)
          console.log(err)
        else{
          //Adding owner information to project object.
          createdProject.owners.unshift(foundUser);
          foundUser.ownedProjects.unshift(createdProject);
          foundUser.save();
          createdProject.save();
        }

      });

      res.redirect("/projects/" + createdProject._id); //redirect to newly created project

    });



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
