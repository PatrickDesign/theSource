var mongoose = require("mongoose");

var projectSchema = new mongoose.Schema(
{
	name: String,
	coverPath: String,
	description: String,
	about: String,
	FAQ: String,
	fundingType: Number, // this is a boolean: 1 = all or nothing 0 = keep it all
	goal: { type: Number, default: 0.0 },
	earnings: { type: Number, default: 0.0 },
	sdgCategory: String,

	owners: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}],

	followingUsers: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
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
	
	backers: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}]
});

projectSchema.index({ '$**': 'text' });

module.exports = mongoose.model("Project", projectSchema);
