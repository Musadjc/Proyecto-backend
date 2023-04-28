//Definimos ruta de Launches.
const express = require("express");
const router = express.Router();

const Launch = require("../models/models-launches")

// * Listar todos los launch.
router.get("/", async (req, res, next) => {
    let launch;
    try {
      launch = await Launch.find({}, "-password");
    } catch (err) {
      const error = new Error("Ha ocurrido un error en la recuperación de datos");
      error.code = 500;
      return next(error);
    }
    res.status(200).json({
      mensaje: "Todos los launch",
      launch: launch,
    });
  });

  // * Listar un launch en concreto.
router.get("/:id", async (req, res, next) => {
    const idLaunch = req.params.id;
    let launch;
    try {
      launch = await Launch.findById(idLaunch);
    } catch (err) {
      const error = new Error(
        "Ha habido algún error. No se han podido recuperar los datos"
      );
      error.code = 500;
      return next(error);
    }
    if (!launch) {
      const error = new Error(
        "No se ha podido encontrar un launch con el id proporcionado"
      );
      error.code = 404;
      return next(error);
    }
    res.json({
      mensaje: "Launch encontrado",
      launch: launch,
    });
  });

// * Crear nuevo launch (relacionándolo con Spacecraft y satelite)
router.post('/', async (req, res, next) => {
	const { misionNombre, fecha, lugar, } = req.body;
	let existeLaunch;
	try {
		existeLaunch = await Launch.findOne({
			misionNombre: misionNombre,
		});
	} catch (err) {
		const error = new Error(err);
		error.code = 500;
		return next(error);
	}

	if (existeLaunch) {
		const error = new Error('Ya existe un launch con ese nombre de misión');
		error.code = 401; // 401: fallo de autenticación
		return next(error);
	} else {
		const nuevoLaunch = new Launch({
			misionNombre,
			fecha,
			lugar,
			spacecraft: [],
			satelite: [],
		});
		try {
			await nuevoLaunch.save();
		} catch (error) {
			const err = new Error('No se han podido guardar los datos');
			err.code = 500;
			return next(err);
		}
		res.status(201).json({
			launch: nuevoLaunch,
		});
	}
});

// * Modificar datos de un launch - Método más efectivo (findByIdAndUpadate)
router.patch("/:id", async (req, res, next) => {
    const idLaunch = req.params.id;
    const camposPorCambiar = req.body;
    let launchBuscar;
    try {
      launchBuscar = await Launch.findByIdAndUpdate(
        idLaunch,
        camposPorCambiar,
        {
          new: true,
          runValidators: true,
        }
      ); // (1) Localizamos y actualizamos a la vez el launch en la BDD
    } catch (error) {
      res.status(404).json({
        mensaje: "No se han podido actualizar los datos del launch",
        error: error.message,
      });
    }
    res.status(200).json({
      mensaje: "Datos de launch modificados",
      launch: launchBuscar,
    });
  });
  
  // * Eliminar un launch
router.delete("/:id", async (req, res, next) => {
    let launch;
    try {
      launch = await Launch.findByIdAndDelete(req.params.id);
    } catch (err) {
      const error = new Error(
        "Ha habido algún error. No se han podido eliminar los datos"
      );
      error.code = 500;
      return next(error);
    }
    res.json({
      mensaje: "Launch eliminado",
      launch: launch,
    });
  });