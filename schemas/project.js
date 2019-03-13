var mongoose = require("mongoose");

var projectSchema = new mongoose.Schema(
{
	name: String,
	coverPath: String,
	description: String,
	goal: { type: Number, default: 0.0 },
	earnings: { type: Number, default: 0.0 },
	sdgCategory: String,
	fundingType: Number, // this is a boolean: 1 = all or nothing 0 = keep it all


	comments: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	}]
});

projectSchema.index({ '$**': 'text' });

module.exports = mongoose.model("Project", projectSchema);
