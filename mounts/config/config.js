/* MagicMirror² Config for Dunedin, NZ */
let config = {
	address: "0.0.0.0",
	port: 8080,
	basePath: "/",
	ipWhitelist: [],
	useHttps: false,
	httpsPrivateKey: "",
	httpsCertificate: "",
	language: "en",
	locale: "en-NZ",
	logLevel: ["INFO", "LOG", "WARN", "ERROR"],
	timeFormat: 24,
	units: "metric",
	modules: [
		{
			module: "alert",
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		{
			module: "clock",
			position: "top_center"
		},
		{
			module: "weather",
			position: "upper_third",
			config: {
				weatherProvider: "openmeteo",
				type: "current",
				lat: -45.8788,
				lon: 170.5028,
				showLocationAsTitle: false
			}
		},
		{
			module: "weather",
			position: "upper_third",
			header: "Weather Forecast",
			config: {
				weatherProvider: "openmeteo",
				type: "forecast",
				lat: -45.8788,
				lon: 170.5028,
				showLocationAsTitle: false
			}
		},
		{
			module: "calendar",
			header: "My Calendar",
			position: "middle_center",
			config: {
				calendars: [
					{
						symbol: "calendar-alt",
						url: "https://outlook.office365.com/owa/calendar/b353c12efdac4263a92b3191ad86328b@contego.co.nz/0525281b9eb5410383d8bba51b674c61507052624062753704/calendar.ics",
						color: '#FF6B35'
					},
					{
						symbol: "calendar-check",
						url: "https://raw.githubusercontent.com/sohnemann/New-Zealand-Public-Holidays/main/2022-2032-public-holidays-nz-national.ics",
						maximumNumberOfDays: 60,
						color: '#3B82F6'
					}
				],
				colored: true,
				displaySymbol: true,
				showLocation: true,
				maximumEntries: 6,
				maximumNumberOfDays: 90,
				fetchInterval: 5 * 60 * 1000,
				dateFormat: "MMM Do HH:mm",
				hideDuplicates: true,
				fadePoint: 0.9,
				maximumEntryTitleLength: 1000,
				wrapEvents: true,
				wrapLocationEvents: 1000,
				maxTitleLength: 1000,
				maxLocationTitleLength: 1000
			}
		},
		{
			module: "MMM-ContegoDashboard",
			position: "lower_third",
			config: {
				mirrorApiUrl: "https://contego.work/pub/magic-mirror",
				errorLogsApiUrl: "https://contego.work/pub/error-logs/new-count",
				apiKey: "admin:mm-17def9af-d595-4378-9dc6-3d023f123e93",
				updateInterval: 2 * 60 * 1000,
				maxTodos: 4,
				maxNotifications: 5,
				showErrorLogs: true,
				showTodos: true,
				showNotifications: true
			}
		}
	]
};
/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") { module.exports = config; }
