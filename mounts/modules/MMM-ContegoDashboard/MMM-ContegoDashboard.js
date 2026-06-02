Module.register("MMM-ContegoDashboard", {
    defaults: {
        mirrorApiUrl: "https://contego.work/pub/magic-mirror",
        errorLogsApiUrl: "https://contego.work/pub/error-logs/new-count",
        apiKey: "", // Format: "admin:your-api-key"
        updateInterval: 2 * 60 * 1000, // 2 minutes
        maxTodos: 5,
        maxNotifications: 5,
        showErrorLogs: true,
        showTodos: true,
        showNotifications: true
    },

    start: function() {
        this.mirrorData = null;
        this.errorLogsData = null;
        this.loaded = false;
        this.scheduleUpdate();
    },

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.className = "contego-dashboard";

        if (!this.loaded) {
            wrapper.innerHTML = "Loading Contego data...";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        const data = this.mirrorData?.data || {};
        const errorData = this.errorLogsData?.data || {};

        // Error Logs Section
        if (this.config.showErrorLogs) {
            const errorSection = this.createErrorLogsSection(errorData);
            if (errorSection) wrapper.appendChild(errorSection);
        }

        // Counts bar
        const countsBar = this.createCountsBar(data.counts, errorData);
        if (countsBar) wrapper.appendChild(countsBar);

        // Combined list of todos and notifications
        const combinedSection = this.createCombinedSection(data.todos || [], data.notifications || []);
        wrapper.appendChild(combinedSection);

        // If nothing to show
        if (wrapper.children.length === 0) {
            wrapper.innerHTML = "No Contego updates";
            wrapper.className = "contego-dashboard dimmed light";
        }

        return wrapper;
    },

    createErrorLogsSection: function(errorData) {
        if (!errorData.count && errorData.count !== 0) return null;

        const section = document.createElement("div");
        section.className = "contego-error-logs";

        if (errorData.count > 0) {
            section.classList.add("has-errors");
            section.innerHTML = `<span class="error-icon">⚠</span> ${errorData.count} New Error${errorData.count !== 1 ? 's' : ''}`;
        }

        return section;
    },

    createCountsBar: function(counts, errorData) {
        if (!counts) return null;

        const bar = document.createElement("div");
        bar.className = "contego-counts-bar";

        const items = [];

        if (counts.uncompletedTodos > 0) {
            items.push(`<span class="count-item todos">${counts.uncompletedTodos} Todo${counts.uncompletedTodos !== 1 ? 's' : ''}</span>`);
        }

        if (counts.unreadNotifications > 0) {
            items.push(`<span class="count-item notifications">${counts.unreadNotifications} Notification${counts.unreadNotifications !== 1 ? 's' : ''}</span>`);
        }

        if (items.length === 0) return null;

        bar.innerHTML = items.join('<span class="count-separator">•</span>');
        return bar;
    },

    createCombinedSection: function(todos, notifications) {
        const section = document.createElement("div");
        section.className = "contego-section contego-combined";

        const list = document.createElement("div");
        list.className = "contego-list";

        const items = [];
        todos.forEach(todo => {
            items.push({
                type: "todo",
                text: todo.message || todo.title,
                date: todo.dueDate || todo.createdAt
            });
        });
        notifications.forEach(n => {
            items.push({
                type: "notification",
                text: n.title,
                date: n.createdAt
            });
        });

        items.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

        if (items.length === 0) {
            const emptyItem = document.createElement("div");
            emptyItem.className = "contego-item contego-empty";
            emptyItem.textContent = "No items";
            list.appendChild(emptyItem);
        } else {
            const maxDisplay = this.config.maxTodos;
            const hasMore = maxDisplay && items.length > maxDisplay;
            const displayItems = maxDisplay ? items.slice(0, maxDisplay) : items;
            const fadeCount = 2;

            displayItems.forEach((entry, i) => {
                const item = document.createElement("div");
                item.className = "contego-item";
                if (entry.type === "notification") {
                    item.classList.add("contego-notification");
                }

                if (hasMore) {
                    const fromEnd = displayItems.length - 1 - i;
                    if (fromEnd < fadeCount) {
                        item.style.opacity = 0.3 + (fromEnd * 0.3);
                    }
                }

                const title = document.createElement("div");
                title.className = "item-title";
                title.textContent = entry.text || '';
                item.appendChild(title);

                list.appendChild(item);
            });
        }

        section.appendChild(list);
        return section;
    },

    getEntityTypeClass: function(entityType) {
        switch (entityType) {
            case 'bug_feedback': return 'type-bug';
            case 'tender': return 'type-tender';
            default: return '';
        }
    },

    truncateText: function(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    formatDate: function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
    },

    getStyles: function() {
        return ["MMM-ContegoDashboard.css"];
    },

    scheduleUpdate: function() {
        this.updateData();
        setInterval(() => {
            this.updateData();
        }, this.config.updateInterval);
    },

    updateData: function() {
        this.sendSocketNotification("FETCH_CONTEGO_DATA", {
            mirrorApiUrl: this.config.mirrorApiUrl,
            errorLogsApiUrl: this.config.errorLogsApiUrl,
            apiKey: this.config.apiKey
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "CONTEGO_MIRROR_DATA") {
            this.mirrorData = payload;
            this.loaded = true;
            this.updateDom();
        } else if (notification === "CONTEGO_ERROR_LOGS_DATA") {
            this.errorLogsData = payload;
            this.updateDom();
        } else if (notification === "CONTEGO_ERROR") {
            console.error("Contego dashboard error:", payload);
            this.loaded = true;
            this.updateDom();
        }
    }
});
