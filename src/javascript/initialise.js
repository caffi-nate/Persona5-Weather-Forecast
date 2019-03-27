
if (CSS.supports('display', 'grid')){
	console.log("initialise.js: supports CSS Grid");
}
else {
	console.log("CSS Grid not supported");
}

// replace this depending on your personal API key from openweathermap.org
const APPID = "32aa9a705e117c99f3cd712e3a521b18";
let weatherSpriteIndex = 0;
let weatherImageIndex = 0; // temp: which icon
let weatherLoaded = false;
let weatherDays = [];
let isDayTime = true;
let currentDay = -1;
let pageLoading = false;

// object constructor
function DateWeather(weekday,date, month, minTemp, maxTemp, conditionInt) {
	this.weekday = weekday
	this.date = date;
	this.month = month;
	this.minTemp = minTemp;
	this.maxTemp = maxTemp;
	this.conditionInt = conditionInt;
}



// getWeather
/*
	Credit to Drew Clements for some help getting OpenWeatherMap API with vanilla JS
	https://medium.com/@drewclementsdesign/building-a-weather-app-with-vanilla-javascript-920889a78ca2
*/

console.log("getWeather.js");

var getCoordinates = function() {
	updateLoadingText("Getting geolocation...");
    if(navigator.geolocation){
    	navigator.geolocation.getCurrentPosition(function(position){
        	let lat = position.coords.latitude;
        	let long = position.coords.longitude;

			// add custom location data if you want to view other cities
			//-90, 0
			//lat = -90.0;
			//long = 0.0;
        	updateByGeo(lat,long);
    	})
    }
    else {
		updateLoadingText("Could not get geolocation. Make sure you enable geolocation services.");
    	//console.log("Error: Could not get geolocation");
    }
}

function updateByGeo(lat, lon){
	updateLoadingText("Getting weather by location...");
  	let url = "";
	url += "https://api.openweathermap.org/data/2.5/forecast?";
  	url += "lat=" + lat + "&lon="+ lon + "&APPID=" + APPID;
  	sendRequest(url);
}

function sendRequest(url){
	updateLoadingText("Fetching weather data...");
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
			var weather = {};
			var data = JSON.parse(xmlhttp.responseText);
			let dates = new Set(); // create a set of unique dates for data comparison
			let j = 0;
			// up to 8 readings per day for 5 days.
			// there may exist a sixth day on the end of the list.
			// we'll just use the first 5 to avoid bad max-min data (though we may still get that for the current day)
			for (i = 0; i < data.list.length; i++){
				var dateTime = new Date(data.list[i].dt*1000); // unix time
				const dt = dateTime.getDate();
				let wthr = new DateWeather();
				wthr.weekday = dateTime.getDay();
				wthr.date = dt;
				wthr.month = dateTime.getMonth();
				wthr.minTemp = kelvinToCelcius(data.list[i].main.temp_min);

				console.log(wthr.minTemp);
				wthr.maxTemp = kelvinToCelcius(data.list[i].main.temp_max);
				wthr.conditionInt = convertIcon(data.list[i].weather[0].icon);

				if (dates.has(dt)){ // if the date already exists in our set, compare values
					weatherDays[j-1].minTemp = Math.min(weatherDays[j-1].minTemp, wthr.minTemp);
					weatherDays[j-1].maxTemp = Math.max(weatherDays[j-1].maxTemp, wthr.maxTemp);
					weatherDays[j-1].conditionInt = Math.max(weatherDays[j-1].conditionInt, wthr.conditionInt);
				}
				else { // it's a new date so we'll add it to our DateWeather array and increment
					weatherDays.push(wthr);
					j++;
				}
				// add to our unique set so that we can compare it next time we loop
				dates.add(dt);
			}
			// today's weather should exist separately to our forecast predictions
			weather.icon = data.list[0].weather[0].icon;
			weather.conditionInt = convertIcon(data.list[0].weather[0].icon);
			weather.city = data.city.name;
			weather.temp = kelvinToCelcius(data.list[0].main.temp);
			weather.maxTemp = weatherDays[0].maxTemp;
			weather.minTemp = weatherDays[0].minTemp;
			weatherImageIndex = weather.conditionInt;
			setWeatherTest(weather);

			const weatherContainer = document.querySelector('.todays-weather-container');
			updateMaxMin(Math.round(weather.minTemp),Math.round(weather.maxTemp),weatherContainer)
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

function updateLoadingText(loadingString){
	const loadingText = document.getElementById('loading-text');
	loadingText.innerHTML = loadingString;
}

// start
getCoordinates();



// process weather

/* Data Conversion Helper Functions */

console.log("processWeather.js");
function convertIcon(iconID){
	// in Persona 5 there are only 4 conditions: Sun, Clouds, Rain, and Snow
	let weatherCondition = "";
  	switch (iconID){
  		// Sun/Fine
  		default: //50d and 50n are the weird outlier icons OpenWeatherMap uses for mist etc
  		case "01d": case "01n":
  		weatherCondition = 0; break;

  		// Clouds
  		case "02n": case "02d": case "03d": case "03n": case "04d": case "04n":
  		weatherCondition = 1; break;

  		// Rain
  		 case "10d": case "09d": case "11d":
  		weatherCondition = 2; break;

  		// Snow
        case "13d":
  		weatherCondition = 3; break;
  	}
  	return weatherCondition;
}

function kelvinToCelcius(kelvin){
	let celcius = kelvin - 273.15;
	celcius = celcius.toString().match(/^-?\d+(?:\.\d{0,1})?/)[0]; // regex to round it to 1 dp
	return celcius;
}

function weatherConditionString(conditionInt, maxTemp){
	let weatherString = "";
	switch(conditionInt){
		default:
		case 0:
			weatherString = "Clear";
			if (maxTemp >= 30) weatherString = "Hot";
			break;
		case 1: weatherString = "Clouds"; break;
		case 2: weatherString = "Rain"; break;
		case 3: weatherString = "Snow"; break;
	}
	return weatherString;
}
/* debug functions */
function setWeatherTest(weather){
	const city = document.getElementById("city");
	const temp = document.getElementById("temp");
	const todaysWeatherSprite = document.querySelector('.current-weather-sprite');
	const containerWeatherSprite = document.querySelector('.weather-sprite');

	city.innerHTML = weather.city;
	weatherLoaded = true;
	// call update weather first so that there isn't any last minute funny business
    setCurrentTempSprites(weather.temp);
	getWeeklyForecastSprites();
	updateWeatherSprite(todaysWeatherSprite,weatherImageIndex);

	onLoadComplete();
}

function getWeeklyForecastSprites(){
	let gridWeatherItems = document.querySelectorAll('.weekday');

	for (i = 0; i < gridWeatherItems.length; i++){
		let gridWeatherItem = gridWeatherItems[i];
        const day = weatherDays[i+1];
        const tens = Math.floor(day.date / 10);
        const ones = day.date % 10;

        updateStackedSprite(ones, '.date-ones', gridWeatherItem);
        updateStackedSprite(tens, '.date-tens', gridWeatherItem);

		const weekdaySprite = gridWeatherItem.querySelector('.weekday-sprite');
		const weatherSprite = gridWeatherItem.querySelector('.current-weather-sprite');
        const minTemp = day.minTemp;
        const maxTemp = day.maxTemp;

		updateWeatherSprite(weatherSprite,day.conditionInt);
		updateWeekdaySprite((day.weekday + 6) % 7,weekdaySprite);

        updateMaxMin(Math.round(minTemp), Math.round(maxTemp), gridWeatherItem);
	};
}



// timed functions
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




// update sprites

console.log("updateSprites.js");

window.setInterval(function animateWeatherSprite(){
	const todaysWeatherSprite = document.querySelector('.current-weather-sprite');

    // animate all sprites globally
    weatherSpriteIndex = (weatherSpriteIndex + 1) % 3;

	updateWeatherSprite(todaysWeatherSprite,weatherImageIndex);
	if (weatherLoaded){
		let gridWeatherItems = document.querySelectorAll('.weekday');
		for (i = 0; i < gridWeatherItems.length; i++){
			let gridWeatherItem = gridWeatherItems[i];
			const weatherSprite = gridWeatherItem.querySelector('.current-weather-sprite');
			const day = weatherDays[i+1]
			updateWeatherSprite(weatherSprite,day.conditionInt);
		}
	}
}, 1000);

function updateWeatherSprite(sprite, conditionInt){
        // todo: don't fetch x position every second - only need it once on load
		const spriteWidth = parseInt((getComputedStyle(sprite).width).replace(/px/,""));
		const spriteHeight = parseInt((getComputedStyle(sprite).height).replace(/px/,""));
        const xPos = -conditionInt * spriteWidth;
		const yPos = -(weatherSpriteIndex * spriteHeight);
		const positionString = `${xPos}px ${yPos}px`;

		sprite.style.backgroundPosition = positionString;
}

function updateStackedSprite(spriteIndex, idString, obj){
    const elementTop = obj.querySelector(idString + '-top');
    const elementMid = obj.querySelector(idString + '-mid');
    const elementBase = obj.querySelector(idString + '-base');
    const spriteWidth = parseInt((getComputedStyle(elementTop).width).replace(/px/,""));
    const spriteHeight = parseInt((getComputedStyle(elementTop).height).replace(/px/,""));

    elementTop.style.backgroundPosition = `${-(spriteIndex) * spriteWidth}px 0px`;
    elementMid.style.backgroundPosition = `${-(spriteIndex) * spriteWidth}px -${spriteHeight}px`;
    elementBase.style.backgroundPosition = `${-(spriteIndex) * spriteWidth}px -${2 * spriteHeight}px`;
}

function updateDateDisplay(date){
    const ones = date % 10;
	const tens = Math.floor(date / 10);

    updateStackedSprite(ones, '.date-ones', document);
    updateStackedSprite(tens, '.date-tens', document);
}

function updateWeekdaySprite(currentDay,weekdaySprite){
	// get dimensions directly from css incase I update the spritesheet later
	const spriteWidth = parseInt((getComputedStyle(weekdaySprite).width).replace(/px/,""));
	const spriteHeight = parseInt((getComputedStyle(weekdaySprite).height).replace(/px/,""));
	const xPos = (currentDay % 3) * - spriteWidth;
	const yPos = Math.floor(currentDay / 3) * -spriteHeight;
	const positionString = `${xPos}px ${yPos}px`;

	weekdaySprite.style.backgroundPosition = positionString;
}

function updateMaxMin(minTemp,maxTemp,obj){
    const maxSign = obj.querySelector('.max-temp-sign');
    const maxTens = obj.querySelector('.max-temp-tens');
    const maxOnes = obj.querySelector('.max-temp-ones');
    const minSign = obj.querySelector('.min-temp-sign');
    const minTens = obj.querySelector('.min-temp-tens');
    const minOnes = obj.querySelector('.min-temp-ones');
    const wth = 32;

    // remove negative sign if necessary
    if (maxTemp >= 0) maxSign.style.backgroundPosition = `${-384}px 0px`;
    if (minTemp >= 0) minSign.style.backgroundPosition = `${-384}px 0px`;

    maxTens.style.backgroundPosition = `${Math.floor(Math.abs(maxTemp)/10) * -wth}px 0px`;
    maxOnes.style.backgroundPosition = `${Math.floor(Math.abs(maxTemp) % 10) * -wth}px 0px`;
    minTens.style.backgroundPosition = `${Math.floor(Math.abs(minTemp)/10) * -wth}px 0px`;
    minOnes.style.backgroundPosition = `${Math.floor(Math.abs(minTemp)%10) * -wth}px 0px`;
}

function setCurrentTempSprites(temp){
    const tempSign = document.querySelector('#current-temp-sign');
    const tempTens = document.querySelector('#current-temp-tens');
    const tempOnes = document.querySelector('#current-temp-ones');
    const tempTenths = document.querySelector('#current-temp-tenths');
    const wth = 72;
	const remainder = Math.floor(10 * (temp - Math.floor(temp)));

    tempTens.style.backgroundPosition = `${Math.floor(Math.abs(temp)/10) * -wth}px 0px`;
    tempOnes.style.backgroundPosition = `${Math.floor(Math.abs(temp)%10) * -wth}px 0px`;
    tempTenths.style.backgroundPosition = `${(remainder * -wth)}px 0px`;
}
