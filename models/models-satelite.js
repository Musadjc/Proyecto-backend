//Definir modelo (schema) de satelite y su ruta.
const mongoose = require("mongoose");

const sateliteSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    minlength: 1,
    maxlength: 50
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
  tipo: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  enOrbita: {
    type: Boolean,
    required: true
  },
  
});

module.exports = mongoose.model("Satelite", sateliteSchema);


