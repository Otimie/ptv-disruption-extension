function setIntervalImmediate(func, delay) {
	new Promise(() => func());
	return setInterval(func, delay);
}

// chrome.storage.sync.set({disruptionUrls: [
// 	//'https://timetableapi.ptv.vic.gov.au/v3/disruptions/route/2?disruption_status=current&devid=3000140&signature=FC41F8496207039AAAAB636871C556ACC38460B2',
// 	//'https://timetableapi.ptv.vic.gov.au/v3/disruptions/route/5?disruption_status=current&devid=3000140&signature=2E81923A9B38CAE8890C60CF3ACD937ACC18A16F',
// 	//'https://timetableapi.ptv.vic.gov.au/v3/disruptions/route/8?disruption_status=current&devid=3000140&signature=79503D1A6BDD0AB8434E8883BD4BF37796799A23',
// 	//'https://timetableapi.ptv.vic.gov.au/v3/disruptions/route/9?disruption_status=current&devid=3000140&signature=FAFB166BCBBCA48FFA02D32E3A6B52072096E74D',
// ]}, () => {
// 	console.log('Done');
// });

chrome.storage.sync.get(['disruptionUrls'], (result) => {
	var disruptionUrls;

	chrome.storage.onChanged.addListener((changes) => {
		disruptionUrls = changes['disruptionUrls']
	});

	if (result['disruptionUrls']) {
		disruptionUrls = result['disruptionUrls'];
	}
	else {
		disruptionUrls = [
			'https://timetableapi.ptv.vic.gov.au/v3/disruptions/route/2?disruption_status=current&devid=3000140&signature=FC41F8496207039AAAAB636871C556ACC38460B2',
			'https://timetableapi.ptv.vic.gov.au/v3/disruptions/route/5?disruption_status=current&devid=3000140&signature=2E81923A9B38CAE8890C60CF3ACD937ACC18A16F',
			'https://timetableapi.ptv.vic.gov.au/v3/disruptions/route/8?disruption_status=current&devid=3000140&signature=79503D1A6BDD0AB8434E8883BD4BF37796799A23',
			'https://timetableapi.ptv.vic.gov.au/v3/disruptions/route/9?disruption_status=current&devid=3000140&signature=FAFB166BCBBCA48FFA02D32E3A6B52072096E74D',
		]
	}

	var notifications = new Map();

	chrome.notifications.onClicked.addListener((notificationId) => {
		chrome.tabs.create({
			url: notifications.get(notificationId)
		});
	});
	
	setIntervalImmediate(() => {
		disruptionUrls.forEach((element) => {
			fetch(element).then((response) => {
				return response.json();
			}).then((response) => {
				response.disruptions.metro_train.forEach((element) => {
					var key = JSON.stringify({
						disruption_id: element.disruption_id,
						last_updated: element.last_updated
					});
	
					if (!notifications.has(key)) {
						notifications.set(key, element.url);
						chrome.notifications.create(key, {
							type: 'basic',
							iconUrl: 'train.svg',
							title: element.title,
							message: element.description
						});
					}
				});
			});
		});
	}, 300000);
});