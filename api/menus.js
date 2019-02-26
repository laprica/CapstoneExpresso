const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menuItems.js');

menusRouter.param('id', (req, res, next, menusId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $id';
  const vals = {$id: menusId};
  db.get(sql, vals, (err, menus) => {
    if(err){
      next(err);
    } else if(menus){
      req.menus = menus;
      next();
    } else{
      res.sendStatus(404);
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (err, rows) => {
    if(err){
      next(err);
    } else {
      res.status(200).json({menus: rows});
    }
  });
});

menusRouter.get('/:id', (req, res, next) => {
  res.status(200).json({menu: req.menus});
});

menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  if(!title){
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const vals = {$title: title};

  db.run(sql, vals, function(error) {
    if(error){
      next(error);
    } else{
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
      (error, menus) => {
        res.status(201).json({menu: menus});
      });
    }
  });
});

menusRouter.put('/:id', (req, res, next) => {
  const title = req.body.menu.title;
  if(!title){
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Menu SET title = $title ' +
    'WHERE Menu.id = $menusId';
  const vals = {
    $title: title,
    $menusId: req.params.id
  };

  db.run(sql, vals, (err) => {
    if(err){
      next(err);
    } else{
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.id}`,
      (err, menus) => {
        res.status(200).json({menu: menus});
      });
    }
  })
});

menusRouter.delete('/:id', (req, res, next) => {
  const menuItemSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menusId';
  const menuItemVals = {$menusId: req.params.id};
  db.get(menuItemSql, menuItemVals, (err, menuItem) => {
    if(err){
      next(err);
    } else if(menuItem){
      res.sendStatus(400);
    } else{
      const deleteSql = 'DELETE FROM Menu WHERE Menu.id = $menusId';
      const deleteVals = {$menusId: req.params.id};

      db.run(deleteSql, deleteVals, (err) => {
        if(err) {
          next(err);
        } else{
          res.sendStatus(204);
        }
      })
    }
  });
});

module.exports = menusRouter;
