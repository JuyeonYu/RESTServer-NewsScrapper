var express = require('express');
var router = express.Router();
var mysql_dbc = require('../db/db_con')();
var connection = mysql_dbc.init();
var urlencode = require('urlencode');
var apn = require('apn');
var schedule = require('node-schedule');
var request = require('request');
var moment = require('moment');
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

initSchedule();

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
    var user_id = req.body.user_id;
    var params = [keyword,  user_id]
    var sql = 'insert into keyword(keyword, user_id) value(?,?)';
    
    connection.query(sql, params, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else console.log(rows)
        res.send(rows);
    });
});
  
router.put('/:keyword', function(req, res, next) {
    var keyword = req.params.keyword;

    var user_id = req.body.user_id;
    var latestNewsTime = req.body.latestNewsTime;
    var alarmTime = req.body.alarmTime;
    var alarmOn = req.body.alarmOn;

    var sql = 'update keyword set latest_news_time = ?, alarm_time = ?, alarm_on = ? where user_id = ? and keyword = ?';
    var params = [latestNewsTime, alarmTime, alarmOn, user_id, keyword];

    connection.query(sql, params, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        else console.log(rows)
        res.send(rows);

        if (alarmOn) {
            setSchedule(alarmTime, id, keyword);
        } else {
            schedule.cancelJob(id + '|' + keyword);
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


function setSchedule(alarmTime, id, keyword) {
    let scheduleID = id + '|' + keyword;
    var hour = Math.floor(alarmTime / 100);
    var minute = ((alarmTime / 100) % 1) * 100;

    var rule = new schedule.RecurrenceRule();
    rule.hour = hour;
    rule.minute = minute;
    // rule.second = minute; // for test
    var j = schedule.scheduleJob(scheduleID, rule, function() {
        hasNews(keyword, alarmTime, function(hasNews){
            if (hasNews) {
                getUnreadCount(id, function(unreadCount){
                    getPushToken(id, function(token){
                        push(token, keyword, unreadCount);
                    });
                });
            }
        })
    });
}

function getUnreadCount(id, callback) {
    var sql = 'SELECT * from unread_count where user_id = ?';
    var param = id;

    connection.query(sql, param, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        callback(rows[0]['unread_count']);
    });
}

function getPushToken(id, callback) {
    var sql = 'SELECT * from user where user_id = ?';
    var param = id;

    connection.query(sql, param, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);
        callback(rows[0]['push_token']);
    });
}

function initSchedule() {
    var sql = 'SELECT * from keyword';

    connection.query(sql, function (err, rows, fields) {
        if(err) console.log('query is not excuted. select fail...\n' + err);

        for (var i = 0; i < rows.length; i++) {
            if (rows[i]['alarm_on']) {
                setSchedule(rows[i]['alarm_time'], rows[i]['user_id'], rows[i]['keyword'])
            }
        }
    });
}

function push(token, keyword, count) {
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
    note.badge = count;
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
    
    apnProvider.send(note, token).then( (result) => {
        console.log(result.sent);
        console.log(result.failed);
        return;
    });
}

function latestNewsTime(keyword, articleTime, callback) {
    let header = {
        'X-Naver-Client-Id':'zmO4KBQdHToxqh6FfuDv', 
        'X-Naver-Client-Secret':'88YmMc4b62'
    };
    keyword = urlencode(keyword);
    
    request({
        headers: header,
        uri: 'https://openapi.naver.com/v1/search/news.json?query='+keyword + '&display=1',
        method: 'GET'
      }, function (err, res, body) {
          const result = JSON.parse(body)
          let pubDate = moment(result.items[0].pubDate, "ddd, DD MMM YYYY HH:mm:ss z");
          console.log('pd: ' + pubDate.format());
          callback(pubDate.format())
    });
}

function hasNews(keyword, articleTime, callback) {
    latestNewsTime(keyword, articleTime, function(result) {
        console.log('result: '+ result);
        callback(moment(result).isAfter(articleTime));
    });
}