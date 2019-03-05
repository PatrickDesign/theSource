
var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    author: String,
    timePosted: {type: Date, default: Date.now},
    rating: {type: Number, default: 0}
});

module.exports = mongoose.model("Comment", commentSchema);