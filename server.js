"use strict";
const express = require('express');
const path = require("path");
const bodyParser = require("body-parser");
const scheduler = require('./scheduler');
const api = require("./api");
const app = express();
let PORT = 8080;
//app.get('/', (req:any, res:any) => res.send('Welcome to MongoDB persistent Node.js server.'))
app.use(express.static("client"));
app.use('/ajax', bodyParser.json({ limit: '1mb' }));
app.post("/ajax", (req, res) => api.handleApi(req, res));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, "client/index.html")));
app.listen(PORT, () => console.log(`persi server listening on ${PORT}`));
