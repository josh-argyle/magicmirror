const NodeHelper = require("node_helper");
const https = require("https");
const http = require("http");

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "FETCH_HABIT_DATA") {
            this.fetchHabitData(payload.url, payload.apiKey);
        }
    },

    fetchHabitData: function(url, apiKey) {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === "https:" ? https : http;

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + apiKey
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
                    this.sendSocketNotification("HABIT_DATA", jsonData);
                } catch (error) {
                    console.error("Error parsing habit data:", error);
                    this.sendSocketNotification("HABIT_ERROR", error.message);
                }
            });
        });

        req.on("error", (error) => {
            console.error("Error fetching habit data:", error);
            this.sendSocketNotification("HABIT_ERROR", error.message);
        });

        req.end();
    }
});
