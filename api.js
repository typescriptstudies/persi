"use strict";
const mongo = require("./mongo");
module.exports.handleApi = handleApi;
setTimeout((e) => console.log(mongo.getCollectionsHash()), 10000);
function send(res, json) {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(json));
}
function handleApi(req, res) {
    let json = req.body;
    console.log(json);
    let action = json.action;
    if (action == undefined) {
        send(res, { ok: false, status: "action missing" });
    }
    if (action == "ajax") {
        send(res, { ok: true, status: "ajax ok" });
    }
    if (action == "getcollections") {
        send(res, { ok: true, status: "collections ok", collections: mongo.getCollectionsHash() });
    }
    if (action == "refreshcollections") {
        send(res, { ok: true, status: "refresh collections ok", collections: mongo.getCollections() });
    }
}
