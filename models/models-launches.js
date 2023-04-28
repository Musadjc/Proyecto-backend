//Definir modelo(schema) launches. *ONE TO MANY
const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");

const launchSchema = new mongoose.Schema({
    misionNombre:{
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    }, 
    fecha:{
        type: Date,
        required: true,
        trim: true,
    },
    lugar:{
        type: String,
        required: true,
        trim: true,
        enum: ["Cabo Cañaveral", "Vandenberg", "Baikonur", "Wenchang", "Boca Chica", "McGregor"]
    }, 
    
    spacecraft: [
        { 
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Spacecraft" 
        }
    ],
    satelite: [
        { 
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Satelite" 
        }
    ],
    });

launchSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Launch', launchSchema);

