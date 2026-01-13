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

        // Create a flex container for todos and notifications side by side
        const columnsContainer = document.createElement("div");
        columnsContainer.className = "contego-columns";

        // Todos Section
        if (this.config.showTodos && data.todos?.length > 0) {
            const todosSection = this.createTodosSection(data.todos);
            columnsContainer.appendChild(todosSection);
        }

        // Notifications Section
        if (this.config.showNotifications && data.notifications?.length > 0) {
            const notificationsSection = this.createNotificationsSection(data.notifications);
            columnsContainer.appendChild(notificationsSection);
        }

        if (columnsContainer.children.length > 0) {
            wrapper.appendChild(columnsContainer);
        }

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

    createTodosSection: function(todos) {
        const section = document.createElement("div");
        section.className = "contego-section contego-todos";

        const title = document.createElement("div");
        title.className = "contego-section-title bright";
        title.innerHTML = "Todos";
        section.appendChild(title);

        const list = document.createElement("div");
        list.className = "contego-list";

        const displayTodos = todos.slice(0, this.config.maxTodos);
        displayTodos.forEach(todo => {
            const item = document.createElement("div");
            item.className = "contego-item";

            const todoTitle = document.createElement("div");
            todoTitle.className = "item-title light";
            todoTitle.innerHTML = this.truncateText(todo.title, 50);
            item.appendChild(todoTitle);

            if (todo.dueDate) {
                const dueDate = document.createElement("div");
                dueDate.className = "item-meta dimmed xsmall";
                dueDate.innerHTML = "Due: " + this.formatDate(todo.dueDate);
                item.appendChild(dueDate);
            }

            list.appendChild(item);
        });

        section.appendChild(list);
        return section;
    },

    createNotificationsSection: function(notifications) {
        const section = document.createElement("div");
        section.className = "contego-section contego-notifications";

        const title = document.createElement("div");
        title.className = "contego-section-title bright";
        title.innerHTML = "Notifications";
        section.appendChild(title);

        const list = document.createElement("div");
        list.className = "contego-list";

        const displayNotifications = notifications.slice(0, this.config.maxNotifications);
        displayNotifications.forEach(notification => {
            const item = document.createElement("div");
            item.className = "contego-item";

            // Add entity type indicator
            const typeClass = this.getEntityTypeClass(notification.entityType);

            const notifTitle = document.createElement("div");
            notifTitle.className = `item-title light ${typeClass}`;
            notifTitle.innerHTML = this.truncateText(notification.title, 45);
            item.appendChild(notifTitle);

            const meta = document.createElement("div");
            meta.className = "item-meta dimmed xsmall";
            meta.innerHTML = this.formatDate(notification.createdAt);
            item.appendChild(meta);

            list.appendChild(item);
        });

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
