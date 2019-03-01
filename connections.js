var mongoose = require('mongoose');
const connectionString = require('./connectionString');

mongoose.connect(connectionString, { useNewUrlParser: true });

var connection = mongoose.connection;

connection.on('connected', () =>
{
  console.log("Connected to Source DB");
});

connection.on('disconnected', () =>
{
  console.log("Disconnected from DB");
  connection.close();
});

connection.on('error', () =>
{
  console.log("DB Connection Error...");
});

//
module.exports = connection;

//  var resultParser = connection.collection('user_accounts').find();
//
//  resultParser.each((err, doc) =>{
//    console.log(doc);
// });
