import {
	getRapidApiConfig,
	rapidApiHeaders,
	sendApiError,
	setCorsHeaders,
} from "../_lib/utils.js";

export default async function chapterHandler(req, res) {
	setCorsHeaders(res);

	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}

	try {
		const { chapterId } = req.query;
		const config = getRapidApiConfig();

		const response = await fetch(
			`${config.rapidApiBaseUrl}/chapters/${chapterId}/`,
			{ headers: rapidApiHeaders(config) },
		);

		if (!response.ok) {
			throw new Error(
				`RapidAPI request failed with status: ${response.status}`,
			);
		}

		const data = await response.json();
		res.status(200).json(data);
	} catch (error) {
		sendApiError(res, "Failed to fetch chapter", error);
	}
}
