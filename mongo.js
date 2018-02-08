"use strict";
const mongodb = require('mongodb');
let MONGODB_URI = process.env.MONGODB_URI;
console.log(`mongo uri ${MONGODB_URI}`);
let db = null;
let collections = { warning: "no mongodb connection" };
function getCollectionsHash() { return collections; }
let tryconnect = true;
try {
    if (process.argv.indexOf("nocon") >= 0)
        tryconnect = false;
}
catch (err) { }
if (tryconnect)
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
function findSome(collname, query, options, callback) {
    console.log("find", collname, query);
    if (db != null) {
        try {
            getCollection(collname, (result) => {
                if (!result.ok)
                    return null;
                if (result.error)
                    return null;
                let collection = result.collection;
                if (options.kind != "one") {
                    let cursor;
                    if (options.getall) {
                        cursor = collection.find(query);
                    }
                    else {
                        cursor = collection.find(query, options);
                    }
                    callback({
                        ok: true,
                        status: "find many returned",
                        cursor: cursor
                    });
                }
                else {
                    collection.findOne(query, options, (error, result) => {
                        callback({
                            ok: true,
                            status: "find one returned",
                            error: error,
                            result: result
                        });
                    });
                }
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
function getCollectionAsList(collname, query, options, callback) {
    if (db != null) {
        options.kind = "many";
        findSome(collname, query, options, (result) => {
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
function createCollection(collname, callback) {
    if (db != null) {
        try {
            db.createCollection(collname, null, (error, collection) => {
                callback({
                    ok: true,
                    status: "create collection returned",
                    error: error,
                    collection: collection
                });
            });
        }
        catch (err) {
            callback({
                ok: false,
                status: "create collection failed",
            });
        }
    }
    else {
        callback({
            ok: false,
            status: "no db",
        });
    }
}
function dropCollection(collname, callback) {
    if (db != null) {
        try {
            db.dropCollection(collname, {}, (error, result) => {
                callback({
                    ok: true,
                    status: "drop collection returned",
                    error: error,
                    result: result
                });
            });
        }
        catch (err) {
            callback({
                ok: false,
                status: "drop collection failed",
            });
        }
    }
    else {
        callback({
            ok: false,
            status: "no db",
        });
    }
}
function insertOne(collname, doc, options, callback) {
    if (db != null) {
        getCollection(collname, (result) => {
            if (!result.ok) {
                callback(result);
            }
            else {
                if (result.error) {
                    callback({
                        ok: false,
                        status: "no collection"
                    });
                }
                else {
                    let collection = result.collection;
                    collection.insertOne(doc, options, (error, result) => {
                        callback({
                            ok: true,
                            error: error,
                            result: result
                        });
                    });
                }
            }
        });
    }
    else {
        callback({
            ok: false,
            status: "no db",
        });
    }
}
function deleteSome(collname, filter, options, callback) {
    if (db != null) {
        getCollection(collname, (result) => {
            if (!result.ok) {
                callback(result);
            }
            else {
                if (result.error) {
                    callback({
                        ok: false,
                        status: "no collection"
                    });
                }
                else {
                    let collection = result.collection;
                    if (options.kind == "many") {
                        collection.deleteMany(filter, options, (error, result) => {
                            callback({
                                ok: true,
                                error: error,
                                result: result
                            });
                        });
                    }
                    else {
                        collection.deleteOne(filter, options, (error, result) => {
                            callback({
                                ok: true,
                                error: error,
                                result: result
                            });
                        });
                    }
                }
            }
        });
    }
    else {
        callback({
            ok: false,
            status: "no db",
        });
    }
}
function updateSome(collname, filter, update, options, callback) {
    if (db != null) {
        getCollection(collname, (result) => {
            if (!result.ok) {
                callback(result);
            }
            else {
                if (result.error) {
                    callback({
                        ok: false,
                        status: "no collection"
                    });
                }
                else {
                    let collection = result.collection;
                    if (options.kind == "many") {
                        console.log("UPDATE MANY", filter, update, options);
                        collection.updateMany(filter, update, options, (error, result) => {
                            callback({
                                ok: true,
                                error: error,
                                result: result
                            });
                        });
                    }
                    else {
                        collection.updateOne(filter, update, options, (error, result) => {
                            callback({
                                ok: true,
                                error: error,
                                result: result
                            });
                        });
                    }
                }
            }
        });
    }
    else {
        callback({
            ok: false,
            status: "no db",
        });
    }
}
module.exports.getCollectionsHash = getCollectionsHash;
module.exports.getCollections = getCollections;
module.exports.getCollectionAsList = getCollectionAsList;
module.exports.createCollection = createCollection;
module.exports.dropCollection = dropCollection;
module.exports.insertOne = insertOne;
module.exports.deleteSome = deleteSome;
module.exports.updateSome = updateSome;
module.exports.findSome = findSome;
