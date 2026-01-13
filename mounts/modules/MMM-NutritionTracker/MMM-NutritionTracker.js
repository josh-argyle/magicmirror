Module.register("MMM-NutritionTracker", {
    defaults: {
        apiUrl: "http://192.168.1.160:3005/api/history/summary",
        apiKey: "test_api_key_12345678901234567890123456789012",
        updateInterval: 15 * 60 * 1000, // 15 minutes
    },

    start: function() {
        this.nutritionData = null;
        this.loaded = false;
        this.scheduleUpdate();
    },

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.className = "nutrition-tracker";

        if (!this.loaded) {
            wrapper.innerHTML = "Loading nutrition data...";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        // Always display data, use 0 if API failed or data is missing
        const data = this.nutritionData || {};

        // Create title
        const title = document.createElement("div");
        title.className = "nutrition-title bright medium";
        title.innerHTML = "Today's Nutrition";
        wrapper.appendChild(title);

        // Create data container
        const dataContainer = document.createElement("div");
        dataContainer.className = "nutrition-data";

        // Create rows for each macro - default to 0 if value is missing
        const macros = [
            { label: "Calories", value: data.total_calories || 0, unit: "kcal" },
            { label: "Protein", value: data.total_protein || 0, unit: "g" },
            { label: "Carbs", value: data.total_carbs || 0, unit: "g" },
            { label: "Fat", value: data.total_fat || 0, unit: "g" },
            { label: "Sugar", value: data.total_sugar || 0, unit: "g" },
            { label: "Fibre", value: data.total_fibre || 0, unit: "g" }
        ];

        macros.forEach(macro => {
            const row = document.createElement("div");
            row.className = "nutrition-row";

            const label = document.createElement("span");
            label.className = "nutrition-label light";
            label.innerHTML = macro.label + ":";

            const value = document.createElement("span");
            value.className = "nutrition-value bright";
            value.innerHTML = " " + Math.round(macro.value) + macro.unit;

            row.appendChild(label);
            row.appendChild(value);
            dataContainer.appendChild(row);
        });

        wrapper.appendChild(dataContainer);

        return wrapper;
    },

    getStyles: function() {
        return ["MMM-NutritionTracker.css"];
    },

    scheduleUpdate: function() {
        this.updateNutritionData();
        setInterval(() => {
            this.updateNutritionData();
        }, this.config.updateInterval);
    },

    updateNutritionData: function() {
        this.sendSocketNotification("FETCH_NUTRITION_DATA", {
            url: this.config.apiUrl,
            apiKey: this.config.apiKey
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NUTRITION_DATA") {
            this.nutritionData = payload;
            this.loaded = true;
            this.updateDom();
        } else if (notification === "NUTRITION_ERROR") {
            console.error("Nutrition tracker error:", payload);
            this.loaded = true;
            this.updateDom();
        }
    }
});
