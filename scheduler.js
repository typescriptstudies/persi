"use strict";
const schedule = require('node-schedule');
const _fetch = require('node-fetch');
//let AJAX_URL=`http://127.0.0.1:5000/ajax`
let AJAX_URL = `https://quiet-tor-66877.herokuapp.com/ajax`;
let TOURNEY_SCHEDULE = {
    0: [1, 0],
    12: [3, 2],
    24: [2, 0],
    36: [5, 0],
    48: [3, 0]
};
let SAY_SCHEDULE = {};
let TOPLIST_SCHEDULE = [6, 18, 30, 42, 54];
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
    schedule.scheduleJob(`${key} 14-23 * * *`, function () {
        console.log(`creating tourney ${time} ${inc}`);
        makeAjaxRequest({ action: "t", time: time, inc: inc }, (content) => {
            console.log(content);
        });
    });
}
for (let key in SAY_SCHEDULE) {
    let content = SAY_SCHEDULE[key];
    schedule.scheduleJob(`${key} 14-23 * * *`, function () {
        console.log(`saying bot wisdom ${content}`);
        makeAjaxRequest({ action: "say", content: `Bot wisdom: ${content}` }, (content) => {
            console.log(content);
        });
    });
}
TOPLIST_SCHEDULE.map(key => {
    schedule.scheduleJob(`${key} 14-23 * * *`, function () {
        console.log(`getting toplist`);
        makeAjaxRequest({ action: "top", n: 10 }, (content) => {
            console.log(content);
        });
    });
});
