/**
 * Created by Amit Thakkar on 9/4/15.
 */
((require, process, JSON) => {
    "use strict";
    // Require Modules
    const HTTPS = require('https');
    const HTTP = require('http');

    // Actual Server URL
    const SERVER_URL = process.env.SERVER_URL || 'mqa.pge.com';

    // Proxy NodeJS Server Details
    const PORT = process.env.PORT || 9090;
    const MY_IP = 'localhost';

    let optionsRequestHandler = (req, res) => {
        var headers = {};
        headers["Access-Control-Allow-Origin"] = req.headers.origin;
        headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
        headers["Access-Control-Allow-Credentials"] = true;
        headers["Access-Control-Max-Age"] = '86400'; // 24 hours
        headers["Access-Control-Allow-Headers"] = "X-RAS-API-USERKEY, cocGUID, SECAPIKEY, PGE_LOGIN_NAME, Content-Type";
        res.writeHead(200, headers);
        res.end();
        console.log("Processed Request:", req.url, "Method:", req.method);
    };
    let forwardRequest = (req, res) => {
        let postData = "";
        let options = {
            'hostname': SERVER_URL,
            'path': req.url,
            'method': req.method
        };
        options.headers = req.headers;
        delete options.headers['host'];
        delete options.headers['accept-encoding'];
        if (req.body) {
            postData = JSON.stringify();
        }
        let request = HTTPS.request(options, (response) => {
            console.log('RESPONSE STATUS: ' + response.statusCode);
            let responseToSend = "", clientheaders;
            response.setEncoding('utf8');
            clientheaders = response.headers;
            response.on('data', function (chunk) {
                responseToSend += chunk;
            });
            setTimeout(function () {
                res.writeHead(response.statusCode, clientheaders);
                res.write(responseToSend);
                res.end();
            }, 500);
        });
        request.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });
        request.write(postData);
        request.end();
        console.log("Processed Request:", req.url, "Method:", req.method);
    };
    let requestHandler = (req, res) => {
        console.log("Processing Request:", req.url, "Method:", req.method);
        if (req.method === 'OPTIONS') {
            optionsRequestHandler(req, res);
        } else {
            forwardRequest(req, res);
        }
    };
    HTTP.createServer(requestHandler).listen(PORT, () => {
        console.log('Server running at HTTP://' + MY_IP + ':' + PORT);
    });
})(require, process, JSON);