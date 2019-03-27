console.log("timedFunctions.js");

function setDateTime(){
	const currentTime = new Date();
	const day = (currentTime.getDay() + 6) % 7;

	updateTime(currentTime);
	// only update datestrings once per day, not every second
	if (day != currentDay){
		const date = currentTime.getDate();
		const month = currentTime.getMonth() + 1;
		const weekdaySprite = document.querySelector('.weekday-sprite');

		updateWeekdaySprite(day,weekdaySprite);
		updateDateDisplay(date);
		updateStackedSprite(month-1, '.month',document);
		currentDay = day;
	}
}

function updateTime(currentTime){
	const timeString = document.getElementById("time");
	const currentHour = currentTime.getHours();
	const currentMinute = currentTime.getMinutes();
	const currentSeconds = currentTime.getSeconds();
	let AMPM = (currentHour >= 12) ? "pm" : "am";
	let hoursTwelve = currentHour % 12;
	if (hoursTwelve == 0) hoursTwelve = 12;

	// use ternary expressions to add extra 0s in formatting where necessary
	timeString.innerHTML = 		`${(hoursTwelve) < 10 ? '0' : ''}${hoursTwelve}:` +
								`${currentMinute < 10 ? '0' : ''}${currentMinute}` +
								//`:${currentSeconds < 10 ? '0' : ''}${currentSeconds} ` +
								`${AMPM}`;

	if (currentHour >= 18 || currentHour < 6){
		if (isDayTime) toggleBackground();
	}
	else { // between 6AM and 6PM
		if (!isDayTime) toggleBackground();
	}
}

function toggleBackground(){
	const overlayImages = document.querySelectorAll('.timeOfDay');
	isDayTime = !isDayTime;
	overlayImages.forEach(overlayImage => {
		if (isDayTime){
			overlayImage.classList.remove('night');
		}
		else {
			overlayImage.classList.add('night');
		}
	});
};

function onLoadComplete(){
	const loadingOverlay = document.querySelector('.loading-overlay');
	const headerFlexbox = document.querySelector('#header-flexbox');
	const todaysWeather = document.querySelector('.todays-weather-container');

	pageLoading = !pageLoading;
	if (pageLoading){
		loadingOverlay.classList.add('hide');
		headerFlexbox.classList.add('bounceIn');
		todaysWeather.classList.add('mainBounceDown');
		setTimeout(function(){
			const weekDays = document.querySelectorAll('.weekday');
			weekDays.forEach(weekday => weekday.classList.add('bounceDown'));
		}, 400);

		// inprecise delay but good enough
		setTimeout(function(){
			screenShake();
		},650);

		// remove overlay after a delay
		setTimeout(function(){
			loadingOverlay.parentNode.removeChild(loadingOverlay);
		},1000);

	}
	else {
		loadingOverlay.classList.remove('hide');
		headerFlexbox.classList.remove('bounceIn');
	}
}

function screenShake(){
	const bgs = document.querySelectorAll('.background-image');
	bgs.forEach(bg => {
		bg.classList.add('screenshake');
	});
}

// only run once per second
setInterval(setDateTime, 1000);
setDateTime(); // call on page load
