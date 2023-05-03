//Definir modelo(schema) launches. *ONE TO MANY
const mongoose = require('mongoose');


const launchSchema = mongoose.Schema({
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
            type: mongoose.Types.ObjectId,
            ref: "Spacecraft" 
        }
    ],
    satelite: [
        { 
            type: mongoose.Types.ObjectId,
            ref: "Satelite" 
        }
    ],
    });



module.exports = mongoose.model('Launch', launchSchema);

