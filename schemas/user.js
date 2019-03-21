var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema(
{
    username: String,
    password: String,
    email: String,

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

    comments: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"

    }],
    
    contributed: { type: Number, default: 0.0 }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
