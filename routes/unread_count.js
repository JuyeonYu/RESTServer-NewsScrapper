var express = require('express');
var router = express.Router();

var mysql_dbc = require('../db/db_con')();
var connection = mysql_dbc.init();

var urlencode = require('urlencode');

var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/* GET users listing. */
router.get('/user/:id', function(req, res, next) {
  var id = req.params.id;
  var params = [id];

  var sql = 'SELECT * from unread_count where user_id = ?';

  connection.query(sql, params, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        res.send(rows[0]);
    });
});

router.post('/:unreadCount/user/:id', function(req, res, next) {
    var unreadCount = req.params.unreadCount;
    var id = req.params.id;
    var params = [unreadCount, id];

    var sql = 'insert into unread_count(unread_count, user_id) value(?,?)';
    
    connection.query(sql, params, function (err, rows, fields) {
          if(err) console.log('query is not excuted. select fail...\n' + err);
          else console.log(rows)
          res.send(rows);
      });
  });
  
  router.put('/:unreadCount/user/:id', function(req, res, next) {
    var unreadCount = req.params.unreadCount;
    var id = req.params.id;
    var params = [unreadCount, id];

    sql = 'update unread_count set unread_count = ? where user_id = ?';
    
    connection.query(sql, params, function (err, rows, fields) {
          if(err) console.log('query is not excuted. select fail...\n' + err);
          else console.log(rows)
          res.send(rows);
      });
  });
  
  router.delete('/user/:id', function(req, res, next) {
    var id = req.params.id;
    var params = [unreadCount, id];

    var sql = 'delete from unread_count where user_id = ?';
  
    connection.query(sql, params, function (err, rows, fields) {
          if(err) console.log('query is not excuted. select fail...\n' + err);
          res.send(rows[0]);
      });
  });

module.exports = router;