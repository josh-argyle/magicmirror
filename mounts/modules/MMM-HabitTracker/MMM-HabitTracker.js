Module.register("MMM-HabitTracker", {
    defaults: {
        apiUrl: "http://192.168.1.160:3005/api/habits/incomplete",
        apiKey: "test_api_key_12345678901234567890123456789012",
        updateInterval: 15 * 60 * 1000, // 15 minutes
    },

    start: function() {
        this.habitData = null;
        this.loaded = false;
        this.scheduleUpdate();
    },

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.className = "habit-tracker";

        if (!this.loaded) {
            wrapper.innerHTML = "Loading habits...";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        // Always display sections, use empty object if API failed
        const data = this.habitData || {};

        // Collect all habits
        const positiveHabits = [];
        const negativeHabits = [];

        ['daily', 'weekly', 'occasional'].forEach(type => {
            if (data[type]) {
                data[type].forEach(habit => {
                    if (habit.habit_polarity === 'negative') {
                        negativeHabits.push(habit);
                    } else {
                        positiveHabits.push(habit);
                    }
                });
            }
        });

        // Sort by display_order
        positiveHabits.sort((a, b) => a.display_order - b.display_order);
        negativeHabits.sort((a, b) => a.display_order - b.display_order);

        // Only create positive habits section if there are habits
        if (positiveHabits.length > 0) {
            const positiveSection = document.createElement("div");
            positiveSection.className = "habit-section";

            const positiveTitle = document.createElement("div");
            positiveTitle.className = "habit-title bright medium";
            positiveTitle.innerHTML = "Today's Habits";
            positiveSection.appendChild(positiveTitle);

            const positiveGrid = document.createElement("div");
            positiveGrid.className = "habit-grid";

            positiveHabits.forEach(habit => {
                const habitItem = document.createElement("div");
                habitItem.className = "habit-item light";
                habitItem.innerHTML = habit.habit_name;
                positiveGrid.appendChild(habitItem);
            });

            positiveSection.appendChild(positiveGrid);
            wrapper.appendChild(positiveSection);
        }

        // Only create negative habits section if there are habits
        if (negativeHabits.length > 0) {
            const negativeSection = document.createElement("div");
            negativeSection.className = "habit-section";

            const negativeTitle = document.createElement("div");
            negativeTitle.className = "habit-title bright medium";
            negativeTitle.innerHTML = "Remember to avoid:";
            negativeSection.appendChild(negativeTitle);

            const negativeGrid = document.createElement("div");
            negativeGrid.className = "habit-grid";

            negativeHabits.forEach(habit => {
                const habitItem = document.createElement("div");
                habitItem.className = "habit-item light";
                habitItem.innerHTML = habit.habit_name;
                negativeGrid.appendChild(habitItem);
            });

            negativeSection.appendChild(negativeGrid);
            wrapper.appendChild(negativeSection);
        }

        // If no habits at all, show a message
        if (positiveHabits.length === 0 && negativeHabits.length === 0) {
            wrapper.innerHTML = "All habits completed! 🎉";
            wrapper.className = "habit-tracker dimmed light";
        }

        return wrapper;
    },

    getStyles: function() {
        return ["MMM-HabitTracker.css"];
    },

    scheduleUpdate: function() {
        this.updateHabitData();
        setInterval(() => {
            this.updateHabitData();
        }, this.config.updateInterval);
    },

    updateHabitData: function() {
        this.sendSocketNotification("FETCH_HABIT_DATA", {
            url: this.config.apiUrl,
            apiKey: this.config.apiKey
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "HABIT_DATA") {
            this.habitData = payload;
            this.loaded = true;
            this.updateDom();
        } else if (notification === "HABIT_ERROR") {
            console.error("Habit tracker error:", payload);
            this.loaded = true;
            this.updateDom();
        }
    }
});
