
var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    author: {
    	type: mongoose.Schema.Types.ObjectId,
    	ref: "User"
    	},
    project: {
    	type: mongoose.Schema.Types.ObjectId,
    	ref: "Project"
    },
    timePosted: {type: Date, default: Date.now},
    rating: {type: Number, default: 0}
});

module.exports = mongoose.model("Comment", commentSchema);