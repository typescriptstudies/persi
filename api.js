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
    try {
        handleApiInner(req, res);
    }
    catch (err) {
        send(res, {
            ok: false,
            status: "handleApiInner failed"
        });
    }
}
function handleApiInner(req, res) {
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
    if (action == "createcollection") {
        let collname = json.collname;
        console.log("create collection", collname);
        mongo.createCollection(collname, (result) => {
            result.collection = null;
            send(res, result);
        });
    }
    if (action == "dropcollection") {
        let collname = json.collname;
        console.log("drop collection", collname);
        mongo.dropCollection(collname, (result) => {
            send(res, result);
        });
    }
    if (action == "insertone") {
        let collname = json.collname;
        let doc = json.doc;
        let options = json.options;
        console.log("insert one", collname, doc, options);
        mongo.insertOne(collname, doc, options, (result) => {
            send(res, result);
        });
    }
    if (action == "deletesome") {
        let collname = json.collname;
        let filter = json.filter;
        let options = json.options;
        console.log("delete some", collname, filter, options);
        mongo.deleteSome(collname, filter, options, (result) => {
            send(res, result);
        });
    }
    if (action == "updatesome") {
        let collname = json.collname;
        let filter = json.filter;
        let update = json.update;
        let options = json.options;
        console.log("update some", collname, filter, update, options);
        mongo.updateSome(collname, filter, update, options, (result) => {
            send(res, result);
        });
    }
}
