/*
	Credit to Drew Clements for some help getting OpenWeatherMap API with vanilla JS
	https://medium.com/@drewclementsdesign/building-a-weather-app-with-vanilla-javascript-920889a78ca2
*/

// replace this depending on your personal API key from openweathermap.org
const APPID = "32aa9a705e117c99f3cd712e3a521b18";
const forecast = true; // set to false for single day weather, true for 5 day forecast
let weatherSpriteIndex = 0;
let weatherImageIndex = 0; // temp: which icon
let weatherLoaded = false;
let weatherDays = [];

// object constructor
function DateWeather(weekday,date, month, minTemp, maxTemp, conditionInt) {
	this.weekday = weekday
	this.date = date;
	this.month = month;
	this.minTemp = minTemp;
	this.maxTemp = maxTemp;
	this.conditionInt = conditionInt;
}

var getCoordinates = function() {
    if(navigator.geolocation){
    	navigator.geolocation.getCurrentPosition(function(position){
        	var lat = position.coords.latitude;
        	var long = position.coords.longitude;
        	updateByGeo(lat,long);
    	})
    }
    else {
    	console.log("Error: Could not get geolocation");
    }
}

function updateByGeo(lat, lon){
  	let url = "";
  	if (forecast) url += "https://api.openweathermap.org/data/2.5/forecast?";
  	else url += "https://api.openweathermap.org/data/2.5/weather?";
  	url += "lat=" + lat + "&lon="+ lon + "&APPID=" + APPID;
  	sendRequest(url);
}

function sendRequest(url){
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200){

			var weather = {};

			if (!forecast){
	  			console.log("parsing weather...");
	  			var data = JSON.parse(xmlhttp.responseText);
	  			var dateTime = new Date(data.dt*1000); // unix time
	  			weather.icon = data.weather[0].icon;
	  			weather.condition = convertIcon(data.weather[0].icon);
	  			weather.city = data.name;
	  			weather.temp = kelvinToCelcius(data.main.temp);

	  			console.log(data);
	  			//const testDate = "2019-01-03 15:00:00";

	  			// tests for date functions
	  			// can't use data.dt yet because it's not in the right format
	  			weather.date = dateTime.getDate(); //getDateFromString(testDate2);
	  			weather.month = dateTime.getMonth();//getMonthFromString(testDate2);

	  			//console.log(weather);
			}
			else {
				console.log("parsing forecast...")
				var data = JSON.parse(xmlhttp.responseText);

				// create a set of unique dates to help comparisons
				let dates = new Set();
				let j = 0;

				// up to 8 readings per day for 5 days.
				// there may exist a sixth day on the end of the list.
				// probably best to get rid of the sixth day: the max/min readings can get really weird

				for (i = 0; i < data.list.length; i++){
					var dateTime = new Date(data.list[i].dt*1000); // unix time
					const dt = dateTime.getDate();//getDateFromString(data.list[0].dt_txt);
					let wthr = new DateWeather();
					wthr.weekday = dateTime.getDay();
					wthr.date = dt;
					wthr.month = dateTime.getMonth();
					wthr.minTemp = kelvinToCelcius(data.list[i].main.temp_min);
					wthr.maxTemp = kelvinToCelcius(data.list[i].main.temp_max);
					wthr.conditionInt = convertIcon(data.list[i].weather[0].icon);

					if (dates.has(dt)){ // if the date already exists in our set, compare values
						//todo: look up weird javascript quirk: why do we have to use j-1 instead of j?

						// compare the readings to find minTemp
						weatherDays[j-1].minTemp = Math.min(weatherDays[j-1].minTemp, wthr.minTemp);

						// compare the readings to find maxTemp
						weatherDays[j-1].maxTemp = Math.max(weatherDays[j-1].maxTemp, wthr.maxTemp);

						// find the worst predicted weather where Sun < Clouds < Rain < Snow
						weatherDays[j-1].conditionInt = Math.max(weatherDays[j-1].conditionInt, wthr.conditionInt);
					}
					else { // it's a new date so we'll add it to our DateWeather array
						weatherDays.push(wthr);
						// add to the array and increment
						j++;
					}
					// add to our unique set so that we can compare it next time we loop
					dates.add(dt);
				}

				console.log("weatherDays: ");
				console.log(weatherDays);

				// today's weather should exist separately? arrange in a grid with current weather up top, then 5 day forecast
				weather.icon = data.list[0].weather[0].icon;
				weather.conditionInt = convertIcon(data.list[0].weather[0].icon);
				weather.city = data.city.name;
				weather.temp = kelvinToCelcius(data.list[0].main.temp);


				weatherImageIndex = weather.conditionInt;
				console.log(weatherImageIndex);
				//weather.date = dateTime.getDate();//getDateFromString(data.list[0].dt_txt);
				//weather.month = dateTime.getMonth();//getMonthFromString(data.list[0].dt_txt);
			}
			console.log(weather);
			setWeatherTest(weather);
			console.log(data);
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

/* Data Conversion Helper Functions */

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
  		case "13d":
  		weatherCondition = 2; break;

  		// Snow
  		case "10d": case "11d": case "13d": case "09d":
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

function updateWeatherSprite(sprite, conditionInt){
		// for now we'll just get condition globally i guess?
		// this should be an interval function within something else...

		const spriteWidth = parseInt((getComputedStyle(sprite).width).replace(/px/,""));
		const spriteHeight = parseInt((getComputedStyle(sprite).height).replace(/px/,""));

		weatherSpriteIndex = (weatherSpriteIndex + 1) % 3;

		//console.log(conditionInt);
		//let conditionInt = weatherImageIndex;

		const xPos = -conditionInt * spriteWidth;
		const yPos = -(weatherSpriteIndex * spriteHeight);
		const positionString = `${xPos}px ${yPos}px`;

		sprite.style.backgroundPosition = positionString;
}

window.setInterval(function animateWeatherSprite(){
	const sprite = document.querySelector('.current-weather-sprite');
	//const sprite = document.querySelector('.current-weather-sprite');

	updateWeatherSprite(sprite,weatherImageIndex);

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

/* debug functions */

function setWeatherTest(weather){
	const city = document.getElementById("city");
	const temp = document.getElementById("temp");
	const condition = document.getElementById("weather-description");
	const todaysWeatherSprite = document.querySelector('.current-weather-sprite');
	const containerWeatherSprite = document.querySelector('.weather-sprite');


	city.innerHTML = weather.city; // bugged right now... maybe don't use geolocation? or maybe it's good enough...
	temp.innerHTML = weather.temp;
	condition.innerHTML = weatherConditionString(weather.conditionInt,weather.temp);
	weatherLoaded = true;


	// call update weather first so that there isn't any last minute funny business

	styleGridElementsTest();

	updateWeatherSprite(todaysWeatherSprite,weatherImageIndex);
	updateWeatherSprite(containerWeatherSprite,weatherImageIndex);

	toggleLoadOpacity();
}

function styleGridElementsTest(){
	let gridWeatherItems = document.querySelectorAll('.weekday');
	console.log(gridWeatherItems);

	//gridWeatherItems.forEach(gridWeatherItem =>{
	for (i = 0; i < gridWeatherItems.length; i++){
		let gridWeatherItem = gridWeatherItems[i];
		const dateTens = gridWeatherItem.querySelector('.date-tens-top');
		const dateTensMid = gridWeatherItem.querySelector('.date-tens-mid');
		const dateTensBase = gridWeatherItem.querySelector('.date-tens-base');
		const dateOnes = gridWeatherItem.querySelector('.date-ones-top');
		const dateOnesMid = gridWeatherItem.querySelector('.date-ones-mid');
		const dateOnesBase = gridWeatherItem.querySelector('.date-ones-base');
		const spriteWidth = parseInt((getComputedStyle(dateOnes).width).replace(/px/,""));

		const weatherSprite = gridWeatherItem.querySelector('.current-weather-sprite');

		const day = weatherDays[i+1]
		const tens = Math.floor(day.date / 10);
		const ones = day.date % 10;

		updateWeatherSprite(weatherSprite,day.conditionInt);


		dateOnes.style.backgroundPosition = `${-ones * spriteWidth}px 0px`;
		dateOnesMid.style.backgroundPosition = `${-ones * spriteWidth}px -150px`;
		dateOnesBase.style.backgroundPosition = `${-ones * spriteWidth}px -300px`;
		dateTens.style.backgroundPosition = `${-tens * spriteWidth}px 0px`;
		dateTensMid.style.backgroundPosition = `${-tens * spriteWidth}px -150px`;
		dateTensBase.style.backgroundPosition = `${-tens * spriteWidth}px -300px`;
	};
}



// start our test
getCoordinates();

console.log("Getting weather...");
