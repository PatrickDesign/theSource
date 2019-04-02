var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var messageSchema = new mongoose.Schema(
{
    author: 
    {
    	type: mongoose.Schema.Types.ObjectId,
    	ref: "User"
    },
    sentTime: {type: Date, default: Date.now},
    messageText: String

});

module.exports = mongoose.model("Message", messageSchema);
