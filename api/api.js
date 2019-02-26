const express = require('express');
const apiRouter = express.Router();
const employeeRouter = require('./employees.js');
const menusRouter = require('./menus.js');

apiRouter.use('/employees', employeeRouter);
apiRouter.use('/menus', menusRouter);

module.exports = apiRouter;
