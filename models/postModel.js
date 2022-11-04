const mongoose =  require("mongoose");


const postModel = mongoose.Schema({
    likes:[{type:mongoose.Schema.Types.ObjectId,ref:"user"}],
    dislikes:[{type:mongoose.Schema.Types.ObjectId,ref:"user"}],
    postTitle:String,
    postContent:{
        type:String,
        default:null
    },
    postedBy:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    avatar:{
        type:String,
        default:null
    },

},{timestamps:true});

const post = mongoose.model('post',postModel);
module.exports = post;