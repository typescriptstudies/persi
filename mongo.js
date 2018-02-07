"use strict";
const mongodb = require('mongodb');
let MONGODB_URI = process.env.MONGODB_URI;
console.log(`mongo uri ${MONGODB_URI}`);
let db = null;
let collections = { warning: "no mongodb connection" };
function getCollectionsHash() { return collections; }
try {
    mongodb.connect(MONGODB_URI, function (err, conn) {
        if (err) {
            console.log(err);
        }
        else {
            db = conn;
            console.log(`connected to MongoDB database < ${db.databaseName} >`);
            getCollections();
        }
    });
}
catch (err) {
    console.log(err);
}
function getCollections() {
    if (db != null) {
        try {
            collections = {};
            db.collections().then((cols) => cols.map((coll) => coll.stats().then((stats) => {
                let ns = stats.ns;
                let nsparts = ns.split(".");
                let name = nsparts.slice(1).join(".");
                let statss = {
                    name: name,
                    count: stats.count,
                    size: stats.size
                };
                if (name != "system.indexes")
                    collections[name] = statss;
            })));
        }
        catch (err) {
            console.log(err);
        }
    }
}
function getCollection(collname, callback) {
    if (db != null) {
        try {
            db.collection(collname, (error, collection) => {
                callback({
                    ok: true,
                    status: "db collection returned",
                    error: error,
                    collection: collection
                });
            });
        }
        catch (err) {
            callback({
                ok: false,
                status: "db collection failed"
            });
        }
    }
    else {
        callback({
            ok: false,
            status: "no db"
        });
    }
}
function find(collname, query, callback) {
    console.log("find", collname, query);
    if (db != null) {
        try {
            getCollection(collname, (result) => {
                if (!result.ok)
                    return null;
                if (result.error)
                    return null;
                let collection = result.collection;
                let cursor = collection.find(query);
                callback({
                    ok: true,
                    status: "find returned",
                    cursor: cursor
                });
            });
        }
        catch (err) {
            console.log(err);
            callback({
                ok: false,
                status: "find failed",
                cursor: null
            });
        }
    }
    else {
        callback({
            ok: false,
            status: "no db",
            cursor: null
        });
    }
}
function getCollectionAsList(collname, query, callback) {
    if (db != null) {
        find(collname, query, (result) => {
            if (!result.ok) {
                callback(result);
            }
            else if (result.cursor == null) {
                result.ok = false;
                result.status = "cursor null";
                callback(result);
            }
            else {
                try {
                    result.cursor.toArray((error, result) => {
                        callback({
                            ok: true,
                            status: "toArray returned",
                            error: error,
                            result: result
                        });
                    });
                }
                catch (err) {
                    callback({
                        ok: false,
                        status: "toArray failed",
                        result: []
                    });
                }
            }
        });
    }
    else {
        callback({
            ok: false,
            status: "no db",
            result: []
        });
    }
}
module.exports.getCollectionsHash = getCollectionsHash;
module.exports.getCollections = getCollections;
module.exports.getCollectionAsList = getCollectionAsList;
