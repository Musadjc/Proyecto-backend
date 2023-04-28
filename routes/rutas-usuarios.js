const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const checkAuth = require('../Middleware/check-auth');

const Usuario = require("../models/models-usuarios");



//Creación de usuarios
router.post("/", async (req, res, next) => {
  const { nombre, apellidos, años, password, email } = req.body;
  console.log(password)
  let existeUsuario;
  try {
    existeUsuario = await Usuario.findOne({
      email: email,
    });
  } catch (err) {
    const error = new Error(err);
    error.code = 500;
    return next(error);
  }
  if (existeUsuario) {
    const error = new Error("Ya existe un usuario con dicho email");
    error.code = 401;
  } else {
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
      const err = new Error(
        "No se ha podido crear el usuario. Intentelo de nuevo"
      );
      err.code = 500;
      console.log(error.message);
      return next(err);
    }
    const nuevoUsuario = new Usuario({
      nombre,
      apellidos,
      años,
      password: hashedPassword,
      email
    });
    try {
      await nuevoUsuario.save();
          } catch (error) {
          const err = new Error("No se han podido guardar los datos");
          err.code = 500;
          return next(err);
          }
          res.status(201).json({
          usuarios: nuevoUsuario,
          });
  }
})


// * Comprobacion del Login de usuarios
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  let usuarioExiste;
  try {
    usuarioExiste = await Usuario.findOne({
      // Comprobación de email
      email: email,
    });
  } catch (error) {
    const err = new Error(
      "No se ha podido realizar la operación. Pruebe más tarde"
    );
    err.code = 500;
    return next(err);
  }
  console.log(usuarioExiste);
  if (!usuarioExiste) {
    const error = new Error(
      "No se ha podido identificar al docente. Credenciales erróneos"
    ); //  El usuario no existe
    error.code = 422; // Datos de usuario inválidos
    return next(error);
  }
//Si existe el docente, ahora toca comprobar las contraseñas
  let esValidoPassword = false;
  esValidoPassword = bcrypt.compareSync(password, usuarioExiste.password);
  if (!esValidoPassword) {
    const error = new Error(
      "No se ha podido identificar al usuario. Credenciales erróneos"
    ); // El usuario no existe
    error.code = 401; // Fallo de autenticación
    return next(error);
  }
  //Una vez, lo usuarios con las credenciales correctas.
  //Creamos el TOKEN.
  let token;
  try {
    token = jwt.sign(
      {
        userId: usuarioExiste.id,
        email: usuarioExiste.email,
      },
      "clave_secretpassword",
      {
        expiresIn: "1h",
      }
    );
  } catch (error) {
    const err = new Error("El proceso de login ha fallado");
    err.code = 500;
    return next(err);
    }
    res.status(201).json({
      mensaje: "Usuario ha entrado con exito en el sistema",
      userId: usuarioExiste.id,
      email: usuarioExiste.email,
      token: token,
    });
  });
  
router.use(checkAuth);

//Lista de los campos.
router.get("/", async (req, res, next) => {
  let usuario;
  try {
    usuario = await Usuario.find({}, "-password");
  } catch (err) {
    const error = new Error(
      'Ha habido algún error. No se han podido recuperar los datos'
    );
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Datos de los usuarios",
    usuario: usuario,
  });
});


//Modificación datos de un usaurio mediante (findByIdAndUpdate)
router.patch("/:id", async (req, res, next) => {
  const idUsuario = req.params.id;
  const camposPorCambiar = req.body;
  let usuarioBuscar;
  try {
    usuarioBuscar = await Usuario.findByIdAndUpdate(
        idUsuario,
        camposPorCambiar,
        {
          new: true,
          runValidators: true,
        }
        ); // (1) Localizamos y actualizamos a la vez el usuario en la BDD
      } catch (error) {
        console.log(error)
        res.status(404).json({
          mensaje: "No se han podido actualizar los datos del usuario",
          error: error.menssage,
        });
        next(error)
      }
      res.status(200).json({
        mensajes: "Datos de usuario modificados",
        usuarios: usuarioBuscar,
      });
    });
    
    //Eliminar un usuario
    router.delete("/:id", async (req, res, next) => {
      let usuario;
      try {
        usuario = await Usuario.findByIdAndDelete(req.params.id);
      } catch (err) {
        const error = new Error(
          "Ha habido algun error. No se han podidio eliminar los datos"
          );
          error.code = 500;
          return next(error);
        }
        res.json({
          mensaje: "Usuario eliminado",
          usuario: usuario,
        });
      });
      
      
      

  // // * Buscar un usuario en función del parámetro de búsqueda
  // router.get("/buscar/:busca", async (req, res, next) => {
  //   const search = req.params.busca;
  //   let usuarios;
  //   try {
  //     usuarios = await Usuario.find({
  //       nombre: { $regex: search, $options: "i" },
  //     });
  //   } catch (err) {
  //     const error = new Error("Ha ocurrido un error en la recuperación de datos");
  //     error.code = 500;
  //     return next(error);
  //   }
  //   res.status(200).json({ mensaje: "Usuarios encontrados", usuarios: usuarios });
  // });
  
  
  module.exports = router;