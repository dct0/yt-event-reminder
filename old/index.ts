import { Innertube, YTNodes } from 'youtubei.js';

(async () => {
	const yt = await Innertube.create();

	async function getVideoInfo(videoId: string) {
		const videoInfo = await yt.actions.execute('/player', {
			// anything added here will be merged with the default payload and sent to InnerTube.
			videoId,
			client: 'YTMUSIC', // InnerTube client, can be ANDROID, YTMUSIC, YTMUSIC_ANDROID, WEB or TV_EMBEDDED
			parse: true, // tells YouTube.js to parse the response, this is not sent to InnerTube.
		});

		return videoInfo;
	}

	const test = await yt.getNotifications();
	y;

	async function addUpcomingEventReminder(videoId: string) {
		const res = await yt.actions.execute('/notification/add_upcoming_event_reminder?alt=json&key=asd', {
			videoId,
			params: 'CgtJQXJlMHJwX0tRcxAAIAAyBAgAEAA',
		});

		return res;
	}

	// const videoInfo = await getVideoInfo("jLTOuvBTLxA");
	console.info(addUpcomingEventReminder('IAre0rp_KQs'));
})();
