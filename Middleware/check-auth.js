const jwt = require("jsonwebtoken");

const autorizacion = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Autorization: bearer TOKEN
        if (!token) {
            throw new Error('Fallo de autorización 1');
        }
        decodedTOKEN = jwt.verify(token, 'clave_secretpassword');
        req.userData = {
            userId: decodedTOKEN.userId,
        };
        next();
    } catch (err) {
        const error = new Error('Fallo de autentificacion 2');
        error.code = 401;
        return next(error);
    }
};

module.exports = autorizacion;