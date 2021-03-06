
////Todo's:
//1.) IMPROVE FRONT END ROUGH EDGES
//1a) NAVBAR
//2.) Create edit project page
//2a) Allow owners to add updates easily to projects
//3.) Special outline for project owners in comments section of their projects
//4.) Finish User dashboard
//5.) Create 'money' form to 'donate'

//6.) Organize codebase

//TODO:
//Follow users
//create a user 'view' like dashboard, but for another user.
//Display 'following users'

//populate social feed with something.




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
var Update = require("./schemas/update");
var Notification = require("./schemas/notification");
var Conversation = require("./schemas/conversation");
var Message = require("./schemas/message");
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


//MessageRoutes==================

//Show all conversations for a user
app.get('/conversations', (req, res) => {
  User.findById(req.user._id).populate({path: "conversations", populate: [{path: "users"}, {path: "messages", populate: {path: "author"}}]}).exec((err, foundUser) => {
    if(err)
      console.log(err);
    else{
      return res.render("conversations", {user: foundUser});
    }
  });
});

// app.get('/messages', (req, res) => {

//   User.findById(req.user._id).populate({path: "conversations", populate: {path: "users"}}).exec((err, foundUser) => {

//     if(err)
//       console.log(err);
//     else{
//       res.render('messages', {user: foundUser});
//     }

//   });


// });


//send message
app.post('/sendMessage/:id', (req, res) => {

  //Find conversation and add the new message
  Conversation.findById(req.params.id).populate({path: "messages", populate: {path: "author"}}).exec((err, foundConvo) => {

    if(err)
      console.log(err);
    else{
      //add new message to conversation

      //Find the user who is the author
      User.findById(req.user._id, (err, foundUser) => {


        if(err)
          console.log(err);
        else{

          //create message
           Message.create(
            {
              author: foundUser,
              messageText: req.body.messageText
            }, (err, newMessage) => {

              //Now we have a created message. We must now add it 
                //to the conversation.

                foundConvo.messages.unshift(newMessage);
                foundConvo.save();
                return res.redirect('/conversations/' + foundConvo._id)

            });
        }


      });

     

    }

  });
  

  //check if the user is in the conversations user list.  

});



app.post('/findConvo/:id', (req, res) => {

  User.findById(req.user._id).populate({path: "conversations", populate: {path: "users"}}).exec((err, foundUser) => {

    if(err)
      console.log(err);
    else{

    var conversationFound = false,
        convoIndex = 0,
        userInConvo;

    //search for conversation where user with 'id' is in user list

    if(foundUser.conversations){
      foundUser.conversations.forEach((conversation) => {


          userInConvo = conversation.users.findIndex(user => user.equals(req.params.id));

          if(userInConvo != -1){
	    conversationFound = true;
            return res.redirect('/conversations/' + foundUser.conversations[convoIndex]._id);
          }
          

          convoIndex++;


      });
    }

    if(conversationFound)
	return;   


    //else, create a new conversation and redirect there.

    //Find other recipient so we can modify attributes
    User.findById(req.body.user).populate("conversations").exec((err, userToTalkTo) => {

        if(err)
          console.log(err);
        else{

          Conversation.create(
          {}, (err, newConvo) => {

            if(err)
              console.log(err);
            else{

              console.log("ID: " + req.body.user);
              //add conversation to both user's lists:
              userToTalkTo.conversations.unshift(newConvo);
              userToTalkTo.save();
              foundUser.conversations.unshift(newConvo);
              foundUser.save();

              newConvo.users.unshift(userToTalkTo, foundUser);
              newConvo.save();


              return res.redirect('/conversations/' + newConvo._id); //render the new convo!
            }

          });

        }

      });

    }

  });

});


//Show the conversation of user with 'id'
app.get('/conversations/:id', (req, res) => {

  User.findById(req.user._id).populate("conversations").exec((err, foundUser) => {

    if(err)
      console.log(err);
    else{

      //Look for conversation with id
        //find the conversation and render the page
        Conversation.findById(req.params.id).populate({path: "user"}).populate({path: "messages", populate: {path: "author"}}).exec((err, foundConvo) =>
        {
          if(err)
            console.log(err)
          else
            return res.render("messages", {conversation: foundConvo});
        });





    }

  });

});



//===============================


//UserRoues======================

app.post('/users/:id/update', (req, res) =>
{
  if (req.body.inlineRadioOptions)
  {
    User.updateOne({ "_id": req.user._id }, { $set: { bio: req.body.userBio, avatar: req.body.inlineRadioOptions } }, (err, updatedUser) =>
    {
      if (err)
        console.log(err);
      else
      {
        res.redirect('/dashboard')
      }
    });
  }
  else
  {
    User.updateOne({ "_id": req.user._id }, { $set: { bio: req.body.userBio } }, (err, updatedUser) =>
    {
      if (err)
        console.log(err);
      else
      {
        res.redirect('/dashboard')
      }
    });
  }
});

//Follow/Unfollow logic:

app.post('/users/:id/follow', (req, res) =>
{
  User.findById(req.params.id, (err, userGettingFollowed) =>
  {
    if (err)
      console.log(err);
    else
    {

      User.findById(req.user._id, (err, userDoingTheFollowing) =>
      {
        if (err)
          console.log(err);
        else
        {
          userGettingFollowed.followers.unshift(userDoingTheFollowing);
          userDoingTheFollowing.followedUsers.unshift(userGettingFollowed);

          userDoingTheFollowing.save();
          userGettingFollowed.save((err, savedUser) =>
          {
            if (err)
              console.log(err);
            else
              //redirect back to user we just followed
              return res.redirect('/users/' + req.params.id);
          });
        }
      })
    }
  });
});


//Unfollow a user
app.post('/users/:id/unfollow', (req, res) =>
{
  User.findById(req.params.id, (err, userGettingUnFollowed) =>
  {
    if (err)
      console.log(err);
    else
    {

      User.findById(req.user._id, (err, userDoingTheUnFollowing) =>
      {
        if (err)
          console.log(err);
        else
        {





          //Remove the 'unfollower' from the 'unfollowed's list
          userGettingUnFollowed.followers.forEach((follower, index) =>
          {

            if (follower.equals(userDoingTheUnFollowing._id))
              userGettingUnFollowed.followers.splice(index, 1);

          });

          //Remove the unfollowed user from the unfollower's list
          userDoingTheUnFollowing.followedUsers.forEach((userFollowed, index) =>
          {

            if (userFollowed.equals(userGettingUnFollowed._id))
              userDoingTheUnFollowing.followedUsers.splice(index, 1);

          });

          userDoingTheUnFollowing.save();
          userGettingUnFollowed.save((err, savedUser) =>
          {
            if (err)
              console.log(err);
            else
              //redirect back to user we just followed
              return res.redirect('/users/' + req.params.id);
          });
        }
      })
    }
  });

});




//Route to view a generic user's account
app.get('/users/:id', (req, res) =>
{

  User.findById(req.params.id).populate({ path: "comments", populate: { path: "author" }, options: { sort: { rating: -1 } } }).populate("followedUsers").populate("followers").populate("followedProjects").populate("ownedProjects").exec((err, foundUser) =>
  {
    if (err)
      console.log(err);
    else
    {

      return res.render("viewUser", { user: foundUser });

    }
  });

});


//===============================


app.get("/projects/:id", (req, res) =>
{

  //find the project with id (get the ID from the URL)
  //sort comments by 'rating'
  Project.findById(req.params.id).populate({ path: "comments", populate: { path: "author" }, options: { sort: { rating: -1 } } }).populate(
  {
    path: "updates",
    populate: { path: "author" }
  }).populate("owners").exec((err, foundProject) =>
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

  //Add comment to both project history and user history.

  //query to find the user db object:
  User.findById(req.user._id, (err, foundUser) =>
  {

    if (err)
      console.log(err);
    else
    {

      Project.findById(req.params.id, (err, foundProject) =>
      {
        if (err)
        {
          console.log(err);
          res.redirect("/projects/" + req.params.id);
        }
        else
        { //on success,


          //create comment
          Comment.create(
          {
            text: req.body.commentText,
            author: foundUser,
            project: foundProject
          }, (err, createdComment) =>
          {
            foundUser.comments.unshift(createdComment); //add comment to found user's comments array.
            foundUser.save(); //update db

            foundProject.comments.unshift(createdComment); //push comment to front of array of comments in project.
            foundProject.save((err, savedProject) =>
            {
              res.redirect("/projects/" + req.params.id);
            });
          });

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

app.get("/dashboard", (req, res) =>
{
  User.findById(req.user._id).populate({ path: "comments", populate: [{ path: "author" }, { path: "project" }], options: { sort: { rating: -1 } } }).populate("followedUsers").populate("followers").populate("followedProjects").populate("ownedProjects").exec((err, foundUser) =>
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

  User.register(new User({ username: req.body.username, email: req.body.email, avatar: req.body.inlineRadioOptions, bio: req.body.userBio }), req.body.password, (err, user) =>
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
      Project.find({ $expr: { $gte: ["$earnings", "$goal"] } }, function (err, finishedProjects)
      {
        if (err)
          console.log(err);
        else
        {

          if (req.user)
          {
            User.findById(req.user._id).populate({ path: "notifications", populate: [{ path: "author" }, { path: "project" }] }).exec((err, foundUser) =>
            {
              if (err)
                console.log(err);
              else
              {
                res.render("index", { projects: allProjects, finishedProjects: finishedProjects, user: foundUser });
              }
            });
          }
          else
          {
            res.render("index", { projects: allProjects, finishedProjects: finishedProjects });
          }

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


app.post('/projects/:id/updates/addUpdate', (req, res) =>
{



  //Find the current author:
  User.findById(req.user._id, (err, foundUser) =>
  {

    if (err)
      console.log(err);
    else
    {

      //now find the project that we are adding the update to:
      Project.findById(req.params.id).populate("followingUsers").exec((err, foundProject) =>
      {
        if (err)
          console.log(err);
        else
        {

          //Create the update:
          Update.create(
          {
            title: req.body.newUpdateTitle,
            author: foundUser,
            img: req.body.newCoverPath,
            updateText: req.body.newUpdateText
          }, (err, newUpdate) =>
          {

            //Add notifications to all following users
            Notification.create(
            {
              title: foundProject.name + " just posted a new update",
              type: "PU", //Project update
              project: foundProject,
              author: foundUser,
              notificationBody: req.body.newUpdateText.substring(0, 200)
            }, (err, createdNotif) =>
            {

              if (err)
                console.log(err);
              else
              {

                //Send notification to all following users:
                foundProject.followingUsers.forEach((followingUser) =>
                {

                  User.findById(followingUser, (err, userToUpdate) =>
                  {
                    if (err)
                      console.log(err)
                    else
                    {
                      userToUpdate.notifications.unshift(createdNotif);
                      userToUpdate.save();
                    }
                  });
                });

              }

            });



            if (err)
              console.log(err);
            else
            {
              //now we have the project and the user, and the update
              foundProject.updates.unshift(newUpdate);
              foundUser.updates.unshift(newUpdate);
              foundUser.save();
              foundProject.save((err, savedProject) =>
              {
                if (err)
                  console.log(err);
                else
                  res.redirect('/projects/' + req.params.id);
              });


            }



          });
        }
      });
    }

  })

});

app.get('/projects/:id/updates/addUpdate', (req, res) =>
{

  User.findById(req.user._id, (err, foundUser) =>
  {

    if (err)
      console.log(err);
    else
    {
      console.log("Found user");
      Project.findById(req.params.id, (err, foundProject) =>
      {

        if (err)
          console.log(err);
        else
        {
          console.log("Found project");
          //At this point, we found the user and the project
          return res.render("addUpdate", { project: foundProject, user: foundUser });
        }

      });

    }

  });

  // return res.redirect("/projects/" + req.params.id);

});


//Update a project's earnings field
app.post('/projects/:id/acceptPayment', (req, res) =>
{



  // req.body.donationAmount contains the amount to update project by
  Project.findById(req.params.id, (err, projectToUpdate) =>
  {
    if (err)
      console.log(err);
    else
    {
      if (req.body.donationAmount > 0)
      {

        User.findById(req.user._id, (err, foundUser) =>
        {
          if (err)
            console.log(err);
          else
          {
            projectToUpdate.earnings = (parseInt(projectToUpdate.earnings) + parseInt(req.body.donationAmount));
            var isInArray = projectToUpdate.backers.some((_id) =>
            {
              return foundUser._id.equals(_id);
            });
            if (!isInArray)
            {
              projectToUpdate.backers.unshift(foundUser);
            }
            foundUser.contributed = (parseInt(foundUser.contributed) + parseInt(req.body.donationAmount));
            foundUser.save()
            projectToUpdate.save((err, project) =>
            {
              return res.redirect("/projects/" + projectToUpdate._id);
            });
          }
        });


      }
      else
      {
        return res.redirect("/projects/" + projectToUpdate._id);
      }

    }

  });
});


//FOLLOW A PROJECT
app.post('/projects/:id/follow', (req, res) =>
{
  if (isLoggedInFlag(req, res))
  {
    Project.findById(req.params.id, (err, foundProject) =>
    {
      if (err)
        console.log(err);
      else
      {

        User.findById(req.user._id, (err, foundUser) =>
        {
          if (err)
            console.log(err);
          else
          {
            foundUser.followedProjects.unshift(foundProject); //add project to user following list
            foundUser.save();
            foundProject.followingUsers.unshift(foundUser); //add user to project followers list
            foundProject.save((err, project) =>
            {
              res.redirect("/projects/" + req.params.id);
            });
          }
        });
      }
    });
  }
  else
  {
    res.redirect("/login");
  }

});


//UNFOLLOW a project
app.post('/projects/:id/unfollow', (req, res) =>
{
  Project.findById(req.params.id, (err, foundProject) =>
  {
    if (err)
      console.log(err);
    else
    {

      User.findById(req.user._id, (err, foundUser) =>
      {
        if (err)
          console.log(err);
        else
        {

          //Remove project from user list, and user from project list
          foundUser.followedProjects.forEach((project, index) =>
          {

            if (project.equals(foundProject._id))
              foundUser.followedProjects.splice(index, 1);

          });

          foundProject.followingUsers.forEach((user, index) =>
          {

            if (user.equals(foundUser._id))
              foundProject.followingUsers.splice(index, 1);

          });


          foundUser.save();
          foundProject.save((err, newProjectName) =>
          {
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

  Project.updateOne({ "_id": req.params.id }, { $set: { "FAQ": req.body.newProjectFAQ, "about": req.body.newProjectAbout, "description": req.body.newProjectDescription, "coverPath": req.body.newCoverPath } }, (err, updatedProject) =>
  {

    if (err)
      console.log(err);
    else
    {
      return res.redirect("/projects/" + req.params.id);
    }

  });


});


//Edit a project (view):
//could create 'isProjectOwner' middleware
app.get("/projects/:id/edit", (req, res) =>
{

  if (req.user == null)
  {
    return res.redirect("/projects/" + req.params.id);
  }



  Project.findById(req.params.id, (err, foundProject) =>
  {
    if (err)
      console.log(err);
    else
    {


      //check if user is owner of requested project:
      isInArray = foundProject.owners.some((projectOwner) =>
      {
        return projectOwner.equals(req.user._id);
      });

      if (isInArray)
      {
        return res.render("projectEdit", { project: foundProject });
      }
      else
      {
        return res.redirect("/projects/" + req.params.id);
      }

    }

  });

});




app.post('/addProject', (req, res) =>
{



  var newId = mongoose.Types.ObjectId();

  var currProject = new Project(
  {
    name: req.body.newProjectName,
    coverPath: req.body.newCoverPath,
    description: req.body.newProjectDescription,
    about: req.body.newProjectAbout,
    FAQ: req.body.newProjectFAQ,
    goal: req.body.newProjectGoal,
    sdgCategory: req.body.newProjectSDGGoal,
    fundingType: req.body.newProjectFundingType,
    sdgCategory: req.body.newProjectSDGCategory,
    _id: newId
  });



  currProject.save((err, createdProject) =>
  {

    //Associate owners with a project.
    User.findById(req.user._id, (err, foundUser) =>
    {

      if (err)
        console.log(err)
      else
      {
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
