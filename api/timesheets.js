const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const vals = {$timesheetId: timesheetId};
  db.get(sql, vals, (err, timesheet) => {
    if(err){
      next(err);
    } else if (timesheet){
      next();
    } else{
      res.sendStatus(404);
    }
  });
});

timesheetsRouter.get('/', (req, res, next) => {
  console.log('req: ' + req.params.employeeId);
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId';
  const vals = {$employeeId: req.params.employeeId};
  db.all(sql, vals, (err, timesheets) => {
    if(err){
      next(err);
    } else{
      res.status(200).json({timesheets: timesheets});
    }
  });
});

timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;

  const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const employeeVals = {$employeeId: employeeId};

  db.get(employeeSql, employeeVals, (err, employee) => {
    if(err){
      next(err);
    } else{
      if(!hours || !rate || !date || !employee){
        return res.sendStatus(400);
      }

      const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) ' +
        'VALUES ($hours, $rate, $date, $employeeId)';
      const vals = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId
      };

      db.run(sql,vals, function(error) {
        if(error) {
          next(error);
        } else{
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastId}`,
          (error, timesheet) => {
            res.status(201).json({timesheet: timesheet});
          });
        }
      });
    }
  });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;

  const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const employeeVals = {$employeeId: employeeId};

  db.get(employeeSql, employeeVals, (err, employee) => {
    if(err) {
      next(err);
    } else {
      if(!hours || !rate || !date || !employee) {
        return res.sendStatus(400);
      }

      const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, ' +
        'date = $date, employee_id = $employeeId ' +
        'WHERE Timesheet.id = $timesheetId';
      const vals = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId,
        $timesheetId: req.params.timesheetId
      };

      db.run(sql, vals, function(err){
        if(err){
          next(err);
        } else{
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
          (error, timesheet) => {
            res.status(200).json({timesheet: timesheet});
          });
        }
      });
    }
  });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const vals = {$timesheetId: req.params.timesheetId};

  db.run(sql, vals, (err) => {
    if(err){
      next(err);
    } else{
      res.sendStatus(204);
    }
  });
});

module.exports = timesheetsRouter;
