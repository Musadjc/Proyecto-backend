//Models Lunchs.
const mongoose = require("mongoose");

//Cración del Schema y la adición de los diferentes campos y su tipo.
const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    },
    apellidos: {
        type: String,
        
        trim: true,
        uppercase: true,
    },
    años: {
        type: Number,
    
        trim: true,

    },
    password:  {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
    }
// No lovidar poner el cmapo de imagen(type:url)
})

module.exports = mongoose.model("Usuario", usuarioSchema);


