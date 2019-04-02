var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema(
{
    username: String,
    password: String,
    email: String,
    avatar: {
        type: String,
        default: "/avatar/1.png"
    },
    bio: String,
    // sendEmail: Boolean,

    ownedProjects: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }],

    followedProjects: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }],

    updates: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Update"
    }],

    //List of all people this user has followed
    followedUsers: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    //People who have followed this user
    followers: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    conversations: [
    {

        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"

    }],

    comments: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"

    }],

    notifications: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification"
    }],
    
    contributed: { type: Number, default: 0.0 }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
