const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  console.log('blargh');
  const sql = 'SELECT * FROM MenuItem WHERE id = $menuItemId';
  const vals = {$menuItemId: menuItemId};
  db.get(sql, vals, (err, menuItem) => {
    if(err){
      next(err);
    } else if (menuItem){
      req.menuItemId = menuItemId;
      next();
    } else{
      res.sendStatus(404);
    }
  });
});

menuItemsRouter.get('/', (req, res, next) => {
  console.log('paramsmenuid: ' + req.params.menuId);
  const sql = 'SELECT * FROM MenuItem WHERE menu_id = $menusId';
  const vals = {$menusId: req.params.menuId};
  db.all(sql, vals, (err, menuItems) => {
    if(err){
      next(err);
    } else{
      res.status(200).json({menuItems: menuItems});
    }
  });
});

menuItemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;

  console.log('name: ' + name);
  console.log('inventory: ' + inventory);
  console.log('price: ' + price);
  console.log('menuId: ' + menuId);

  const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const menuVals = {$menuId: menuId};

  db.get(menuSql, menuVals, (err, menu) => {
    if(err){
      next(err);
    }else{
      if(!name || !inventory || !price || !menu){
        return res.sendStatus(400);
      }

      const sql = 'INSERT INTO MenuItem (name, inventory, price, menu_id) ' +
        'VALUES ($name, $inventory, $price, $menuId)';
      const vals = {
        $name: name,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId
      };

      db.run(sql, vals, function(err){
        if(err){
          next(err);
        } else{
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastId}`,
          (err, menuItem) => {
            res.status(201).json({menuItems: menuItem});
          });
        }
      });
    }
  })
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  console.log('made it into the menu item router');
  console.log('menu_id: ' + req.params.menu_id);
  console.log('menuId: ' + req.params.menuId);
  console.log('menuItemId: ' + req.params.menuItemId);
  const name = req.body.menuItem.name;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;

  const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const menuVals = {$menuId: menuId};

  db.get(menuSql, menuVals, (err, menu) => {
    if(err) {
      next(err);
    } else{
      if(!name || !inventory || !price || !menu){
        return res.sendStatus(400);
      }

      const sql = 'UPDATE MenuItem SET name = $name, inventory = $inventory, ' +
        'price = $price, menu_id = $menuID ' +
        'WHERE id = $menuItemId';
      const vals = {
        $name: name,
        $inventory: inventory,
        $price: price,
        $menuId: menuId,
        $menuItemId: req.params.menuItemId
      };

      db.run(sql, vals, function(err) {
        if(err){
          next(err);
        } else{
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
          (err, menuItem) => {
            res.status(200).json({menuItems: menuItem});
          });
        }
      });
    }
  });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const vals = {$menuItemId: req.params.menuItemId};

  db.run(sql, vals, (err) => {
    if(err){
      next(err);
    } else{
      res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;
