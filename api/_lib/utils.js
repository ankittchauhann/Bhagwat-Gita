export function setCorsHeaders(res) {
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET,OPTIONS,PATCH,DELETE,POST,PUT",
	);
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
	);
}

export function getRapidApiConfig() {
	const rapidApiHost = process.env.RAPIDAPI_HOST;
	const rapidApiKey = process.env.RAPIDAPI_KEY;
	const rapidApiBaseUrl = process.env.RAPIDAPI_BASE_URL;

	if (!rapidApiHost || !rapidApiKey || !rapidApiBaseUrl) {
		throw new Error("Missing required environment variables");
	}

	return { rapidApiHost, rapidApiKey, rapidApiBaseUrl };
}

export function rapidApiHeaders({ rapidApiHost, rapidApiKey }) {
	return {
		"x-rapidapi-host": rapidApiHost,
		"x-rapidapi-key": rapidApiKey,
		"Content-Type": "application/json",
	};
}

export function sendApiError(res, message, error) {
	console.error("API Error:", error);
	res.status(500).json({
		error: message,
		message: error instanceof Error ? error.message : "Unknown error",
	});
}
