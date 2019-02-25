var express = require("express");
var app = express();
var http = require("http").Server(app);



//setup file structure:
app.use(express.static("public"));

app.set("view engine", "ejs");

app.set('views', './views');

//DB CONNECT:

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb://patrickSource:source@cluster0-shard-00-00-28qcy.mongodb.net:27017,cluster0-shard-00-01-28qcy.mongodb.net:27017,cluster0-shard-00-02-28qcy.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//  // perform actions on the collection object
//   client.close();
// });
// mongodb+srv://patrickSource:<PASSWORD>@cluster0-28qcy.mongodb.net/test?retryWrites=true

const MongoClient = require('mongodb').MongoClient;

// replace the uri string with your connection string.
// const uri = "mongodb+srv://YOURUSERNAMEHERE:YOURPASSWORDHERE@cluster0-28qcy.mongodb.net/sourceDB?ssl=true&authSource=admin";
MongoClient.connect(uri, (err, database) => {
   if(err) {
        console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
   }
   console.log('Connected...');
  //  const collection = db.db("sourceDB").collection("user_accounts");

  //  var resultParser = database.db().collection('user_accounts').find();
   //
  //  resultParser.each((err, doc) =>{
  //    console.log(doc);
  //  });

  //  console.log(db.collection("user_accounts").find());
   // perform actions on the collection object
  //  client.close();
});

mongodb://username:password@host1:port1,...,hostN:portN/database?authSource=admin&...

// client.connect('mongodb://patrickSource:source@cluster0-shard-00-00-28qcy.mongodb.net:27017,cluster0-shard-00-01-28qcy.mongodb.net:27017,cluster0-shard-00-02-28qcy.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true', (err, db) => {
//   console.log("uh-oh");
// });


//ROUTES
app.get('/', (req, res) => {
  res.render("index");
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Serving app..."));
