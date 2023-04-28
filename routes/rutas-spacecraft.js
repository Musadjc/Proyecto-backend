//Definimos ruta de spacecraft.
const express = require("express");
const router = express.Router();
const Spacecraft = require("../models/models-spacecraft");

//Lista de los campos
router.get("/:id", async (req, res, next) => {
    const idSpacecraft = req.params.id;
    let spacecraft;
    try {
      spacecraft = await Spacecraft.findById(idSpacecraft).populate("launch");
    } catch (err) {
      const error = new Error(
        "Ha habido algún error. No se han podido recuperar los datos"
      );
      error.code = 500;
      return next(error);
    }
    if (!spacecraft) {
      const error = new Error(
        "No se ha podido encontrar la spacecraft con el id proporcionado"
      );
      error.code = 404;
      return next(error);
    }
    res.json({
      mensaje: "Spacecraft encontrado",
      spacecraft: spacecraft,
    });
  });

// * Introducir caracterísitcas de la spacecraft (y el launch relacionado) y guardarlo en Atlas
router.post("/", async (req, res, next) => {
    // ? Primero creamos la informacion de la spacecraft y lo guardamos en Atlas
    const { nombre, altura, anchura, masa, empuje } = req.body;
    const nuevoSpacecraft = new Curso({
      // Nuevo documento basado en el Model Spacecraft.
      nombre: nombre,
      altura: altura,
      anchura: anchura,
      masa: masa,
      empuje: empuje,
    });
    // ? Localizamos el launch que se corresponde con el que hemos recibido en el request.
    let spacecraftBusca;
    try {
      spacecraftBusca = await Spacecraft.findById(req.body.spacecraft);
    } catch (error) {
      const err = new Error("Ha fallado la operación de creación");
      err.code = 500;
      return next(err);
    }
    console.log(spacecraftBusca);
    // ? Si no está en la BDD mostrar error y salir
    if (!spacecraftBusca) {
      const error = new Error(
        "No se ha podido encontrar una spacecraft con el id proporcionado"
      );
      error.code = 404;
      return next(error);
    }
    /**
     * ? Si está en la BDD tendremos que:
     * ?  1 - Guardar el nuevo Spacecraft
     * ?  2 - Añadir el nuevo spacecraft al array de spacecraft del launch localizado
     * ?  3 - Guardar el launch, ya con su array de spacecraft actualizado
     */
    console.log(spacecraftBusca);
    try {
      await nuevoSpacecraft.save(); // ? (1)
      spacecraftBusca.spacecraft.push(nuevoSpacecraft); // ? (2)
      await spacecraftBusca.save(); // ? (3)
    } catch (error) {
      const err = new Error("Ha fallado la creación de la nueva spacecraft");
      err.code = 500;
      return next(err);
    }
    res.status(201).json({
      mensaje: "Spacecraft añadido a la BDD",
      spacecraft: nuevoSpacecraft,
    });
  });

// Modificar una spacecraft en base a su id ( y su referencia en launch)
router.patch("/:id", async (req, res, next) => {
    const idSpacecraft = req.params.id;
    let SpacecraftBuscar;
    try {
      SpacecraftBuscar = await Spacecraft.findById(idSpacecraft).populate("launch"); // (1) Localizamos el spacecraft en la BDD
    } catch (error) {
      const err = new Error(
        "Ha habido algún problema. No se ha podido actualizar la información del spacecraft"
      );
      err.code = 500;
      throw err;
    }
    // // ! Verificación de usuario
    // if (SpacecraftBuscar.launch.id.toString() !== req.userData.userId) {
    //   // Verifica que el creador en la BDD sea el mismo que viene en el req. (headers)
    //   const err = new Error("No tiene permiso para modificar este spacecraft");
    //   err.code = 401; // Error de autorización
    //   return next(err);
    // }
    // ? Si existe el spacecraft y el usuario se ha verificado
    try {
      SpacecraftBuscar = await Spacecraft.findById(idSpacecraft).populate("launch");
      // ? Bloque si queremos modificar el launch que previsto de la spacecraft.
      if (req.body.launch) {
        SpacecraftBuscar.launch.spacecraft.pull(SpacecraftBuscar); // * Elimina la spacecraft del launch al que se le va a quitar
        await SpacecraftBuscar.launch.save(); // * Guarda dicho launch
        launchBuscar = await launch.findById(req.body.launch); // * Localiza el launch previsto que tendra el spacecraft.
        launchBuscar.spacecraft.push(SpacecraftBuscar); // * Añade al array de spacecraft del launch el spacecraft que se le quitó al otro laucnh.
        launchBuscar.save(); // * Guardar el launch con el nueva spacecraft en su array de spacecraft.
      }
      // ? Si queremos modificar cualquier propiedad de la spacecraft, menos el launch.
      SpacecraftBuscar = await Spacecraft.findByIdAndUpdate(idSpacecraft, req.body, {
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
      message: "Spacecraft modificado",
      spacecraft: SpacecraftBuscar,
    });
  });
 
//  Eliminar una spacecraft en base a su id (y el launch relacionado)
router.delete("/:id", async (req, res, next) => {
    const idSpacecraft = req.params.id;
    let spacecraft;
    try {
      spacecraft = await spacecraft.findById(idSpacecraft).populate("launch"); // ? Localizamos el spacecraft en la BDD por su id
    } catch (err) {
      const error = new Error(
        "Ha habido algún error. No se han podido recuperar los datos para eliminación"
      );
      error.code = 500;
      return next(error);
    }
    if (!spacecraft) {
      // ? Si no se ha encontrado ningún spacecraft lanza un mensaje de error y finaliza la ejecución del código
      const error = new Error(
        "No se ha podido encontrar un spacecraft con el id proporcionado"
      );
      error.code = 404;
      return next(error);
    }
  
    // // ! Verificación de usuario
    // if (spacecraft.launch.id.toString() !== req.userData.userId) {
    //   // Verifica que el creador en la BDD sea el mismo que viene en el req. (headers) procedente de checkAuth
    //   const err = new Error("No tiene permiso para eliminar este spacecraft");
    //   err.code = 401; // Error de autorización
    //   return next(err);
    // }
  
    // ? Si existe el spacecraft y el usuario se ha verificado
    try {
      // ? (1) Eliminar spacecraft de la colección
      await spacecraft.deleteOne();
      // ? (2) En el campo launch del documento spacecraft estará la lista con todos lo spacecraft de dicho launch. Con el método pull() le decimos a mongoose que elimine la spacecraft también de esa lista.
      spacecraft.launch.spacecraft.pull(spacecraft);
      await spacecraft.launch.save(); // ? (3) Guardamos los datos de el campo launch en la colección spacecraft, ya que lo hemos modificado en la línea de código previa.
    } catch (err) {
      const error = new Error(
        "Ha habido algún error. No se han podido eliminar los datos"
      );
      error.code = 500;
      return next(error);
    }
    res.json({
      message: "spacecraft eliminado",
    });
  });

  module.exports = router;