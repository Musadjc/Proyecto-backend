//Definimos ruta de satelite.
const express = require("express");
const router = express.Router();
const Satelite = require("../models/models-satelite");
const Launch = require("../models/models-launches");
const checkAuth = require('../Middleware/check-auth');



//Lista de los campos
router.get("/:id", async (req, res, next) => {
    const idSatelite = req.params.id;
    let satelite;
    try {
      satelite = await Satelite.findById(idSatelite).populate("launch");
    } catch (err) {
      const error = new Error(
        "Ha habido algún error. No se han podido recuperar los datos"
      );
      error.code = 500;
      return next(error);
    }
    if (!satelite) {
      const error = new Error(
        "No se ha podido encontrar el satelite con el id proporcionado"
      );
      error.code = 404;
      return next(error);
    }
    res.json({
      mensaje: "Satelite encontrado",
      satelite: satelite,
    });
  });

  // * Introducir caracterísitcas del satelite (y el launch relacionado) y guardarlo en Atlas
router.post("/", async (req, res, next) => {
    // ? Primero creamos la informacion del satelite y lo guardamos en Atlas
    const { nombre, yearProduccion, launch, tipo, enOrbita } = req.body;
    const nuevoSatelite = new Satelite({
      // Nuevo documento basado en el Model Satelite.
      nombre: nombre,
      yearProduccion: yearProduccion,
      launch: launch, 
      tipo: tipo,
      enOrbita: enOrbita,
    });
    // ? Localizamos el launch que se corresponde con el que hemos recibido en el request. 
    let launchBusca;
    try {
      launchBusca = await Launch.findById(req.body.launch);
    } catch (error) {
      const err = new Error("Ha fallado la operación de creación");
      err.code = 500;
      return next(err);
    }
    console.log(launchBusca);
    // ? Si no está en la BDD mostrar error y salir
    if (!launchBusca) {
      const error = new Error(
        "No existe un launch con ese id"
      );
      error.code = 404;
      return next(error);
    }
    /**
     * ? Si está en la BDD tendremos que:
     * ?  1 - Guardar el nuevo Satelite
     * ?  2 - Añadir el nuevo satelite al array de satelite del launch localizado
     * ?  3 - Guardar el launch, ya con su array de satelite actualizado
     */
   
    try {
      await nuevoSatelite.save(); // ? (1)
      launchBusca.satelite.push(nuevoSatelite); // ? (2)
      await launchBusca.save(); // ? (3)
    } catch (error) {
      const err = new Error("Ha fallado la creación de la nueva satelite");
      err.code = 500;
      return next(err);
    }
    res.status(201).json({
      mensaje: "Satelite añadido a la BDD",
      satelite: nuevoSatelite,
    });
  });

  // Modificar un satelite en base a su id ( y su referencia en launch)
router.patch("/:id", async (req, res, next) => {
    const idSatelite = req.params.id;
    let SateliteBuscar;
    try {
      SateliteBuscar = await Satelite.findById(idSatelite).populate("launch"); // (1) Localizamos el satelite en la BDD
    } catch (error) {
      const err = new Error(
        "Ha habido algún problema. No se ha podido actualizar la información del satelite"
      );
      err.code = 500;
      throw err;
    }
    // // ! Verificación de usuario
    // if (sateliteBuscar.launch.id.toString() !== req.userData.userId) {
    //   // Verifica que el creador en la BDD sea el mismo que viene en el req. (headers)
    //   const err = new Error("No tiene permiso para modificar este satelite");
    //   err.code = 401; // Error de autorización
    //   return next(err);
    // }
    // ? Si existe el satelite y el usuario se ha verificado
    try {
      SateliteBuscar = await Satelite.findById(idSatelite).populate("launch");
      // ? Bloque si queremos modificar el launch que previsto del satelite.
      if (req.body.launch) {
        SateliteBuscar.launch.satelite.pull(SateliteBuscar); // * Elimina el satelite del launch al que se le va a quitar.
        await SateliteBuscar.launch.save(); // * Guarda dicho launch
        launchBuscar = await Launch.findById(req.body.launch); // * Localiza el launch previsto que tendra el satelite.
        launchBuscar.satelite.push(SateliteBuscar); // * Añade al array de satelite del launch el satelite que se le quitó al otro laucnh.
        launchBuscar.save(); // * Guardar el launch con el nuevo satelite en su array de satelite.
      }
      // ? Si queremos modificar cualquier propiedad de la Satelite, menos el launch.
      SateliteBuscar = await Satelite.findByIdAndUpdate(idSatelite, req.body, {
        new: true,
        runValidators: true,
      }).populate("launch");
    } catch (err) {
      console.log(err.message);
      const error = new Error(
        "Ha habido algún error. No se han podido modificar los datos"
      );
      error.code = 500;
      return next(error);
    }
    res.json({
      message: "Satelite modificado",
      satelite: SateliteBuscar,
    });
  });

  //  Eliminar una satelite en base a su id (y el launch relacionado)
router.delete("/:id", async (req, res, next) => {
    const idSatelite = req.params.id;
    let satelite;
    try {
      satelite = await Satelite.findById(idSatelite).populate("launch"); // ? Localizamos el satelite en la BDD por su id
    } catch (err) {
      const error = new Error(
        "Ha habido algún error. No se han podido recuperar los datos para eliminación"
      );
      error.code = 500;
      return next(error);
    }
    if (!satelite) {
      // ? Si no se ha encontrado ningún satelite lanza un mensaje de error y finaliza la ejecución del código
      const error = new Error(
        "No se ha podido encontrar un satelite con el id proporcionado"
      );
      error.code = 404;
      return next(error);
    }
  
    // // ! Verificación de usuario
    // if (satelite.launch.id.toString() !== req.userData.userId) {
    //   // Verifica que el creador en la BDD sea el mismo que viene en el req. (headers) procedente de checkAuth
    //   const err = new Error("No tiene permiso para eliminar este satelite");
    //   err.code = 401; // Error de autorización
    //   return next(err);
    // }
  
    // ? Si existe el satelite y el usuario se ha verificado
    try {
      // ? (1) Eliminar satelite de la colección
      await satelite.deleteOne();
      // ? (2) En el campo launch del documento satelite estará la lista con todos lo satelite de dicho launch. Con el método pull() le decimos a mongoose que elimine el satelite también de esa lista.
      satelite.launch.satelite.pull(satelite);
      await satelite.launch.save(); // ? (3) Guardamos los datos de el campo launch en la colección satelite, ya que lo hemos modificado en la línea de código previa.
    } catch (err) {
      const error = new Error(
        "Ha habido algún error. No se han podido eliminar los datos"
      );
      error.code = 500;
      return next(error);
    }
    res.json({
      message: "satelite eliminado",
    });
  });

  module.exports = router;