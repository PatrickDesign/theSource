var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema(
{
    username: String,
    password: String,
    email: String,

    comments: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"

    }]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
