var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var updateSchema = new mongoose.Schema(
{
    title: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    img: String,
    updateText: String,
    timePosted: { type: Date, default: Date.now }
});

updateSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Update", updateSchema);
