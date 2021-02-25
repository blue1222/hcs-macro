const request = require('request');
const JSEncrypt = require('node-jsencrypt');
const crypto = new JSEncrypt();
crypto.setPublicKey('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA81dCnCKt0NVH7j5Oh2+SGgEU0aqi5u6sYXemouJWXOlZO3jqDsHYM1qfEjVvCOmeoMNFXYSXdNhflU7mjWP8jWUmkYIQ8o3FGqMzsMTNxr+bAp0cULWu9eYmycjJwWIxxB7vUwvpEUNicgW7v5nCwmF5HS33Hmn7yDzcfjfBs99K5xJEppHG0qc+q3YXxxPpwZNIRFn0Wtxt0Muh1U8avvWyw03uQ/wMBnzhwUC8T4G5NclLEWzOQExbQ4oDlZBv8BM/WxxuOyu0I8bDUDdutJOfREYRZBlazFHvRKNNQQD2qDfjRz484uFs7b5nykjaMB9k/EJAuHjJzGs9MMMWtQIDAQAB');

var config = {
    users:[
        {
            school: 'SCHOOL_CODE',
            name: 'NAME',
            birth: 'BIRTHDAY',
            password: 'PASSWORD'
        }
    ]
}
const submit = (user) => {
    request({
        uri: 'https://cnehcs.eduro.go.kr/v2/findUser',
        method: 'POST',
        body: {
            orgCode: user.school,
            name: crypto.encrypt(user.name),
            birthday: crypto.encrypt(user.birth),
            loginType: 'school',
            stdntPNo: ''
        },
        json: true
    }, function (error, response, body) {
        request({
            uri: 'https://cnehcs.eduro.go.kr/v2/validatePassword',
            method: 'POST',
            body: {
                deviceUuid: "",
                password: crypto.encrypt(user.password)
            },
            json: true,
            headers: {
                Authorization: body.token
            }
        }, function (error, response, body) {
            token = body
            request({
                uri: 'https://cnehcs.eduro.go.kr/v2/selectUserGroup',
                method: 'POST',
                headers: {
                    'Authorization': token
                },
                body: {},
                json: true
            }, function (error, response, body) {
                token = body[0].token
                request({
                    uri: 'https://cnehcs.eduro.go.kr/registerServey',
                    method: 'POST',
                    headers: {
                        'Authorization': token
                    },
                    body: {
                        deviceUuid: "",
                        rspns00: "Y",
                        rspns01: "1",
                        rspns02: "1",
                        rspns09: "0",
                        upperToken: token,
                        upperUserNameEncpt: user.name
                    },
                    json: true
                }, function (error, response, body) {
                    console.log(`[${user.name}] ${body}`);
                });
            });
        });
    });
}
for(var j=0; j<config.users.length; j++){
    console.log(config.users[j].name);
    submit(config.users[j]);
}
