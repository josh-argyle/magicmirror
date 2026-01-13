const NodeHelper = require("node_helper");
const https = require("https");
const http = require("http");

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "FETCH_CONTEGO_DATA") {
            this.fetchMirrorData(payload.mirrorApiUrl, payload.apiKey);
            this.fetchErrorLogsData(payload.errorLogsApiUrl, payload.apiKey);
        }
    },

    fetchMirrorData: function(url, apiKey) {
        this.fetchWithBasicAuth(url, apiKey, (error, data) => {
            if (error) {
                console.error("Error fetching mirror data:", error);
                this.sendSocketNotification("CONTEGO_ERROR", error);
            } else {
                this.sendSocketNotification("CONTEGO_MIRROR_DATA", data);
            }
        });
    },

    fetchErrorLogsData: function(url, apiKey) {
        this.fetchWithBasicAuth(url, apiKey, (error, data) => {
            if (error) {
                console.error("Error fetching error logs data:", error);
                this.sendSocketNotification("CONTEGO_ERROR", error);
            } else {
                this.sendSocketNotification("CONTEGO_ERROR_LOGS_DATA", data);
            }
        });
    },

    fetchWithBasicAuth: function(url, apiKey, callback) {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === "https:" ? https : http;

        // Create Basic Auth header from apiKey (format: "username:password")
        const authString = Buffer.from(apiKey).toString('base64');

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: "GET",
            headers: {
                "Authorization": "Basic " + authString,
                "Content-Type": "application/json"
            }
        };

        const req = protocol.request(options, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                try {
                    const jsonData = JSON.parse(data);
                    callback(null, jsonData);
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    console.error("Raw response:", data);
                    callback(error.message, null);
                }
            });
        });

        req.on("error", (error) => {
            callback(error.message, null);
        });

        req.end();
    }
});
