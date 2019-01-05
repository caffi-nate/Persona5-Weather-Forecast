/*
	Credit to Drew Clements for some help getting OpenWeatherMap API with vanilla JS 
	https://medium.com/@drewclementsdesign/building-a-weather-app-with-vanilla-javascript-920889a78ca2
*/

// replace this depending on your personal API key from openweathermap.org
const APPID = "32aa9a705e117c99f3cd712e3a521b18";
const forecast = true; // set to false for single day weather, true for 5 day forecast
let weatherSpriteIndex = 0;
let weatherLoaded = false;
let weatherDays = [];

// object constructor
function DateWeather(date, month, minTemp, maxTemp, conditionInt) {
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
	  			const testDate = "2019-01-03 15:00:00";
	  			
	  			// tests for date functions
	  			// can't use data.dt yet because it's not in the right format
	  			weather.date = dateTime.getDate(); //getDateFromString(testDate2);
	  			weather.month = dateTime.getMonth();//getMonthFromString(testDate2);
	  			
	  			//console.log(weather);
			}
			else {
				console.log("parsing forecast...")
				var data = JSON.parse(xmlhttp.responseText);
				let dates = new Set();
				let j = 0;

				// 8 readings per day for 5 days. loop over 8 readings for each day
				// to get the day: don't just divide total by 8.
				// truncate the date/time string and sort the list
				// there may exist a sixth day on the end of the list. up to you whether you use it
				// probably just get rid of the sixth day: the max/min readings can get really weird


				// for temperature: get max and min of the 8 readings
				// each reading has a temp, temp_min and a temp_max
				// for weather: find the worst predicted weather where Sun < Clouds < Rain < Snow

				for (i = 0; i < data.list.length; i++){
					var dateTime = new Date(data.list[i].dt*1000); // unix time
					const dt = dateTime.getDate();//getDateFromString(data.list[0].dt_txt);
					let wthr = new DateWeather	(
												dt,
												dateTime.getMonth(),
												kelvinToCelcius(data.list[i].main.temp_min),
												kelvinToCelcius(data.list[i].main.temp_max),
												convertIcon(data.list[i].weather[0].icon)
												);
					//wthr.date = dt;
					//wthr.month = month;
					//wthr.minTemp = kelvinToCelcius(data.list[i].main.temp_min);
					//wthr.maxTemp = kelvinToCelcius(data.list[i].main.temp_max);
					//wthr.conditionInt = convertIcon(data.list[i].weather[0].icon);
					//console.log(wthr);

					if (dates.has(dt)){
						//console.log(dt + " already exists!");
						// find min of new minTemp and old 
						weatherDays[j-1].minTemp = Math.min(weatherDays[j-1].minTemp, wthr.minTemp);

						// find max of old and new maxTemp
						weatherDays[j-1].maxTemp = Math.max(weatherDays[j-1].maxTemp, wthr.maxTemp);

						// get worst condition
						weatherDays[j-1].conditionInt = Math.max(weatherDays[j-1].conditionInt, wthr.conditionInt);

					}
					else {
						//console.log("New Date!");
						weatherDays.push(wthr);
						// add to the array and increment
						//console.log(weatherDays[j]);
						j++;
					}

					dates.add(dt);
				}


				//console.log(data.list.length);
				console.log(dates);
				console.log(dates.size);
				
				console.log("weatherDays: ");
				console.log(weatherDays);
			
				weather.icon = data.list[0].weather[0].icon;
				weather.conditionInt = convertIcon(data.list[0].weather[0].icon);
				weather.city = data.city.name;
				weather.temp = kelvinToCelcius(data.list[0].main.temp);
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
  		default: //50d and 50n are the weird outlier icons OpenWeatherMap uses for mist etc
  		
  		case "01d": case "01n":
  		weatherCondition = 0; break;

  		case "02n": case "02d": case "03d": case "03n": case "04d": case "04n":
  		weatherCondition = 1; break;

  		case "13d":
  		weatherCondition = 2; break;

  		case "10d": case "11d": case "13d": case "09d":
  		weatherCondition = 3; break;
  	}
  	console.log("weather: " + weatherCondition);
  	return weatherCondition;
}

function kelvinToCelcius(kelvin){
	let celcius = kelvin - 273.15;
	celcius = celcius.toString().match(/^-?\d+(?:\.\d{0,1})?/)[0]; // regex to round it to 1 dp
	return celcius;
}

/*
function whichWeatherSprite(conditionInt){
	let whichWeather = 0; 
	switch(conditionString){
		default:
		case "Clear": 	whichWeather = 0; break;
		case "Clouds": 	whichWeather = 1; break;
		case "Rain": 	whichWeather = 2; break;
		case "Snow": 	whichWeather = 3; break;
	}
	return whichWeather;
}
*/

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


window.setInterval(function updateWeatherSprite(){

	// for now we'll just get condition globally i guess?
	// this should be an interval function within something else...

	const sprite = document.querySelector('.weather-sprite');
	const spriteWidth = parseInt((getComputedStyle(sprite).width).replace(/px/,""));
	const spriteHeight = parseInt((getComputedStyle(sprite).height).replace(/px/,""));

	weatherSpriteIndex = (weatherSpriteIndex + 1) % 3;

	//console.log(conditionInt);
	let conditionInt = 0;

	const xPos = -conditionInt * spriteWidth;
	const yPos = -(weatherSpriteIndex * spriteHeight);
	const positionString = `${xPos}px ${yPos}px`;

	sprite.style.backgroundPosition = positionString;
}, 1000);


/* debug functions */

function setWeatherTest(weather){
	const city = document.getElementById("city");
	const temp = document.getElementById("temp");
	const condition = document.getElementById("weather-description");

	city.innerHTML = weather.city; // bugged right now... maybe don't use geolocation? or maybe it's good enough...
	temp.innerHTML = weather.temp;
	condition.innerHTML = weatherConditionString(weather.conditionInt,weather.temp);

	weatherLoaded = true;

	console.log("Getting weather...");
}

// start our test
getCoordinates();