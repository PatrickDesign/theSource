var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var  notificationSchema = new mongoose.Schema(
{
	type: String,
	project: { type: mongoose.Schema.Types.ObjectId, ref: "Project"},
    title: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notificationBody: String,
    timePosted: { type: Date, default: Date.now }
});

notificationSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Notification", notificationSchema);
