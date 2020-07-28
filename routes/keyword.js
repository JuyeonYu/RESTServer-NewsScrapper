var express = require('express');
var router = express.Router();

var mysql_dbc = require('../db/db_con')();
var connection = mysql_dbc.init();

var urlencode = require('urlencode');

var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

var apn = require('apn');
var schedule = require('node-schedule');


/* GET users listing. */
router.get('/:keyword/user/:id', function(req, res, next) {
    var keyword = req.params.keyword;
    var id = req.params.id;
    var params = [keyword, id];

    var sql = 'SELECT * from keyword where keyword = ? and user_id = ?';

    connection.query(sql, params, function (err, rows, fields) {
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
    var alarmOn = req.body.alarmOn;

    console.log(alarmOn, alarmTime);
    
    var params;
    var sql;

    if (latestArticleTime) {
        sql = 'update keyword set latest_article_time = ? where user_id = ? and keyword = ?';
        params = [latestArticleTime, id, keyword];
    }

    if (alarmTime && alarmOn != null) {
        sql = 'update keyword set alarm_time = ?, alarm_on = ? where user_id = ? and keyword = ?';
        params = [alarmTime, alarmOn, id, keyword];
    }

    console.log(sql);

    connection.query(sql, params, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else console.log(rows)
        res.send(rows);

        var scheduleID = id + '|' + keyword;

        if (alarmOn) {
            var hour = Math.floor(alarmTime / 100);
            var minute = ((alarmTime / 100) % 1) * 100;
            
            var rule = new schedule.RecurrenceRule();
            // rule.hour = hour;
            // rule.minute = minute;
            rule.second = minute;

            var j = schedule.scheduleJob(scheduleID, rule, function(){
                push(keyword);
            });
        } else {
            console.log('cancel job: ' + scheduleID);
            // var cancelJob = schedule.scheduledJobs[scheduleID];
            // cancelJob.cancel();

            schedule.cancelJob(scheduleID);
        }
    });
});
  
  router.delete('/:keyword/user/:id', function(req, res, next) {
    var id = req.params.id;
    var keyword = req.params.keyword;
    var params = [keyword, id];

    var sql = 'delete from keyword where keyword = ? and user_id = ?';
  
    connection.query(sql, params, function (err, rows, fields) {
          if(err) console.log('query is not excuted. select fail...\n' + err);
          res.send(rows[0]);
      });
  });

module.exports = router;

function setSchedule(keyword, id) {
    console.log(2)
    var params = [keyword, id];
    var sql = 'SELECT * from keyword where keyword = ? and user_id = ?';

    connection.query(sql, params, function (err, rows, fields) {
        console.log(3)
        if(err) console.log('query is not excuted. select fail...\n' + err);
        res.send(rows[0]);
    });
}

function push(keyword) {
    var options = {
        token: {
            key: "./AuthKey_8NV9UH7AJ2.p8",
            keyId: "8NV9UH7AJ2",
            teamId: "DUV8UP2WXU"
        },
        production: false
    };
        
    var apnProvider = new apn.Provider(options);
    let deviceToken = ["0142DF666ADC20473343031ED5F270AFC867F344F382A90186A5B6A8AC373909"];
    
    var note = new apn.Notification();
    // expiry : 전송이 실패하면 지정한 시간까지 다시 전송을 시도함
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 1;
    // sound => 미리 넣고 패키징해야함
    note.sound = "ping.aif",
    // 메시지
    note.alert = keyword + "에 새로운 뉴스가 도착했습니다.";
    // Background Mode 사용 시
    note.contentAvailable = 1;
    note.topic = "com.johnny.scrapper.dev";
    
    note.payload = {
        custom: keyword
    };
    
    apnProvider.send(note, deviceToken).then( (result) => {
        console.log(result.sent);
        console.log(result.failed);
    return;
    });
}