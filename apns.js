var apn = require('apn');

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
note.alert = "'한샘' 키워드에서 새로운 뉴스가 도착했습니다.";
// Background Mode 사용 시
note.contentAvailable = 1;
note.topic = "com.johnny.scrapper.dev";

note.payload = {
    custom: "한샘"
};

apnProvider.send(note, deviceToken).then( (result) => {
    console.log(result.sent);
    console.log(result.failed);
return;
});