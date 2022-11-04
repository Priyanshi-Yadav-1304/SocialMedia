const mongoose  = require("mongoose");

mongoose.connect("mongodb+srv://Priyanshi:abcd1234@cluster0.cxxtr0f.mongodb.net/socialmedia?retryWrites=true&w=majority")
.then(function(){
    console.log("database connected..........")
})
.catch(function(err){
    console.log(err.message)
})