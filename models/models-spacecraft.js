//Definir modelo (schema) spacecraft y su ruta.
const mongoose = require("mongoose");

const spacecraftSchema = mongoose.Schema({
  yearProduccion: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return new Date(v).getFullYear() >= 1960;
      },
      message: props => `${props.value} no es una fecha válida a partir del año 1960.`
    }
  },
  launch: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return new Date(v).getFullYear() >= 1957;
      },
      message: props => `${props.value} no es una fecha válida a partir del año 1957.`
    },
    type: mongoose.Types.ObjectId, ref: "Launch"
  },
  nombre: {
    type: String,
    required: true,
    uppercase: true,
  },
  altura: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 20
  },
  anchura: {
    type: String,
    required: true,
    trim: true,
    
  },
  masa: {
    type: String,
    required: true,
    trim: true,
    
  },
  empuje: {
    type: String,
    required: true,
    trim: true,
    
  },
  
});

// No lovidar poner el cmapo de imagen(type:url)

module.exports = mongoose.model("Spacecraft", spacecraftSchema);


