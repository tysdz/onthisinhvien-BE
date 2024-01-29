const mongoose = require('mongoose');
const Schema = mongoose.Schema

const InforSchema = new Schema({
    nameUser : {
        type: String,
        require : true,
    },
    email : {
        type : String,
        require : true,
        unique : true
    },
    phoneNumber :{
        type : String,
        require : true,
        unique : true
    },
    user :{
        type : Schema.Types.ObjectId,
        ref :'users'
    }
})

module.exports = mongoose.model('infor', InforSchema)