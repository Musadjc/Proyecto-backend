const express = require("express");
const app = express();
const mongoose = require("mongoose");
require('dotenv').config();

app.use(cors())
app.use(express.json());

// app.get('/api/events', (req, res) => {
// 	res.send('Respuesta desde servidor al acceso al endpoint /');
// });
const rutasUsuarios = require("./routes/rutas-usuarios");
app.use("/api/usuarios", rutasUsuarios);

const rutasSpacecraft = require("./routes/rutas-spacecraft");
app.use("/api/spacecraft", rutasSpacecraft);

const rutasSatelite = require("./routes/rutas-satelite");
app.use("/api/satelite", rutasSatelite);

const rutasLaunch = require("./routes/rutas-launches");
app.use("/api/launch", rutasLaunch);


//Conexion con BDD Atlas Cloud.
//"mongodb+srv://MusaMongodb:12345@cluster0.puazlil.mongodb.net/ProyectNasa?retryWrites=true&w=majority"
mongoose
.connect(process.env.MONGO_DB_URI)
	.then(() => {
		app.listen(process.env.PORT, () => console.log(`Escuchando en puerto  ${process.env.PORT}`));
	})
	.catch((error) => console.log(error));
	
	