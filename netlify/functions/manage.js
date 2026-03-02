// netlify/functions/manage.js
const fs = require("fs");
const path = "/tmp/state.json";

function loadState() {
    try {
        return JSON.parse(fs.readFileSync(path));
    } catch {
        return { command: "IDLE", data: [] };
    }
}

function saveState(state) {
    fs.writeFileSync(path, JSON.stringify(state));
}

exports.handler = async function(event) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "OK" };
    }

    let state = loadState();

    if (event.httpMethod === "POST") {
        try {
            const body = JSON.parse(event.body);

            if (body.action === "REQUEST_SCAN") {
                state.command = "SCAN";
                saveState(state);
                return { statusCode: 200, headers, body: JSON.stringify({ status: "SCAN_SET" }) };
            }

            if (body.action === "UPLOAD_DATA") {
                state.data = body.data;
                state.command = "IDLE";
                saveState(state);
                return { statusCode: 200, headers, body: JSON.stringify({ status: "DATA_SAVED" }) };
            }

        } catch {
            return { statusCode: 400, headers, body: "JSON Error" };
        }
    }

    if (event.httpMethod === "GET") {
        const type = event.queryStringParameters?.type;

        if (type === "status") {
            return { statusCode: 200, headers, body: JSON.stringify({ command: state.command }) };
        }

        if (type === "data") {
            return { statusCode: 200, headers, body: JSON.stringify(state.data) };
        }
    }

    return { statusCode: 400, headers, body: "Bad Request" };
};