var express = require('express');
var router = express.Router();

var mysql_dbc = require('../db/db_con')();
var connection = mysql_dbc.init();

var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/* GET users listing. */
router.get('/:id', function(req, res, next) {
  // var param = req.param('userid');
  var param = req.params.id;
  var sql = 'SELECT * from user where user_id = ?';
  connection.query(sql, param, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        res.send(rows[0]);
    });
});

router.post('/', function(req, res, next) {
  var userid = req.body.userid;
  var token = req.body.token;
  var params = [userid, token, token];

  var sql = 'insert into user(user_id, push_token) value(?,?) ON DUPLICATE KEY UPDATE push_token=?';
  
  connection.query(sql, params, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else console.log(rows)
        res.send(rows);
    });
});

router.put('/:id', function(req, res, next) {
  var token = req.body.token;
  var id = req.params.id;
  var params = [token, id];

  var sql = 'update user set push_token = ? where user_id = ?';
  
  connection.query(sql, params, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else console.log(rows)
        res.send(rows);
    });
});

router.delete('/:id', function(req, res, next) {
  // var param = req.param('userid');
  var param = req.params.id;
  var sql = 'delete from user where user_id = ?';
  connection.query(sql, param, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        res.send(rows[0]);
    });
});

module.exports = router;



mysql_dbc.test_open(connection);
