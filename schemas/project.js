var mongoose = require("mongoose");

var projectSchema = new mongoose.Schema(
{
	name: String,
	coverPath: String,
	description: String,
	comments: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	}]
});

projectSchema.index({ '$**': 'text' });

module.exports = mongoose.model("Project", projectSchema);
