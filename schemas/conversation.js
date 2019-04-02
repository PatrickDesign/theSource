var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var conversationSchema = new mongoose.Schema(
{
    //todo: make this an array of users in convo
    users: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    
    messages: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }]
});

module.exports = mongoose.model("Conversation", conversationSchema);
