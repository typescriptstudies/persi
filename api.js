"use strict";
const mongo = require("./mongo");
module.exports.handleApi = handleApi;
setTimeout((e) => console.log(mongo.getCollectionsHash()), 10000);
function send(res, json) {
    res.setHeader("Content-Type", "application/json");
    let jsontext = JSON.stringify(json);
    console.log("sending", jsontext.length);
    res.send(jsontext);
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
        console.log("getcollections");
        send(res, { ok: true, status: "collections ok", collections: mongo.getCollectionsHash() });
    }
    if (action == "refreshcollections") {
        send(res, { ok: true, status: "refresh collections ok", collections: mongo.getCollections() });
    }
    if (action == "getcollectionaslist") {
        let collname = json.collname;
        let query = json.query;
        console.log("get collection as list", collname, query);
        mongo.getCollectionAsList(collname, query, (result) => send(res, result));
    }
}
