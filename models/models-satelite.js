//Definir modelo (schema) de satelite y su ruta.
const mongoose = require("mongoose");

const sateliteSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    
  },

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
    type: mongoose.Types.ObjectId, ref: "Launch",
    required: true,
    
  },
  tipo: {
    type: String,
    required: true,
    trim: true,
    
  },
  enOrbita: {
    type: Boolean,
    required: true
  },
  
});

module.exports = mongoose.model("Satelite", sateliteSchema);


