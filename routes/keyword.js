var express = require('express');
var router = express.Router();

var mysql_dbc = require('../db/db_con')();
var connection = mysql_dbc.init();

var urlencode = require('urlencode');

var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/* GET users listing. */
router.get('/:keyword/user/:id', function(req, res, next) {
  var keyword = req.params.keyword;
  var id = req.params.id;
  var param = [keyword, id];

  var sql = 'SELECT * from keyword where keyword = ? and user_id = ?';

  connection.query(sql, param, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        res.send(rows[0]);
    });
});

router.post('/:keyword', function(req, res, next) {
    var keyword = urlencode.decode(req.params.keyword);
    console.log('keyword: '+ keyword)
    var latest_article_time = req.body.latest_article_time;
    var alarm_time = req.body.alarm_time;
    var user_id = req.body.user_id;
    var params = [keyword, latest_article_time, alarm_time, user_id]
    var sql = 'insert into keyword(keyword, latest_article_time, alarm_time, user_id) value(?,?,?,?)';
    
    connection.query(sql, params, function (err, rows, fields) {
          if(err) console.log('query is not excuted. select fail...\n' + err);
          else console.log(rows)
          res.send(rows);
      });
  });
  
  router.put('/:keyword/user/:id', function(req, res, next) {
    var id = req.params.id;
    var keyword = req.params.keyword;

    var latestArticleTime = req.body.latestArticleTime;
    var alarmTime = req.body.alarmTime;
    
    var params;

    var sql;

    if (latestArticleTime && alarmTime) {
        console.log('error: latestArticleTime && alarmTime')
        return;
    }
    
    if (latestArticleTime) {
        sql = 'update keyword set latest_article_time = ? where user_id = ?';
        params = [latestArticleTime, id, keyword];
    }

    if (alarmTime) {
        sql = 'update keyword set alarm_time = ? where user_id = ?';
        params = [alarmTime, id, keyword];
    }

    console.log(sql);
    
    connection.query(sql, params, function (err, rows, fields) {
          if(err) console.log('query is not excuted. select fail...\n' + err);
          else console.log(rows)
          res.send(rows);
      });
  });
  
  router.delete('/:keyword/user/:id', function(req, res, next) {
    var id = req.params.id;
    var keyword = req.params.keyword;
    var params = [keyword, id];

    console.log(keyword + ' / ' + id)
    var sql = 'delete from keyword where keyword = ? and user_id = ?';
  
    connection.query(sql, params, function (err, rows, fields) {
          if(err) console.log('query is not excuted. select fail...\n' + err);
          res.send(rows[0]);
      });
  });

module.exports = router;