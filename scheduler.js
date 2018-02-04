"use strict";
const schedule = require('node-schedule');
const _fetch = require('node-fetch');
//let AJAX_URL=`http://127.0.0.1:5000/ajax`
let AJAX_URL = `https://quiet-tor-66877.herokuapp.com/ajax`;
let TOURNEY_SCHEDULE = {
    0: [1, 0],
    15: [3, 2],
    30: [2, 0],
    45: [5, 0]
};
let SAY_SCHEDULE = {};
let TOPLIST_SCHEDULE = [7, 22, 37, 52];
function makeAjaxRequest(payload, callback) {
    _fetch(`${AJAX_URL}`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json"
        }
    }).
        then((response) => response.text()).
        then((content) => callback(content));
}
for (let key in TOURNEY_SCHEDULE) {
    let value = TOURNEY_SCHEDULE[key];
    let time = value[0];
    let inc = value[1];
    schedule.scheduleJob(`${key} * * * *`, function () {
        console.log(`creating tourney ${time} ${inc}`);
        makeAjaxRequest({ action: "t", time: time, inc: inc }, (content) => {
            console.log(content);
        });
    });
}
for (let key in SAY_SCHEDULE) {
    let content = SAY_SCHEDULE[key];
    schedule.scheduleJob(`${key} * * * *`, function () {
        console.log(`saying bot wisdom ${content}`);
        makeAjaxRequest({ action: "say", content: `Bot wisdom: ${content}` }, (content) => {
            console.log(content);
        });
    });
}
TOPLIST_SCHEDULE.map(key => {
    schedule.scheduleJob(`${key} * * * *`, function () {
        console.log(`getting toplist`);
        makeAjaxRequest({ action: "top", n: 10 }, (content) => {
            console.log(content);
        });
    });
});
