/*
	Credit to Drew Clements for some help getting OpenWeatherMap API with vanilla JS 
	https://medium.com/@drewclementsdesign/building-a-weather-app-with-vanilla-javascript-920889a78ca2
*/


// replace this depending on your personal API key from openweathermap.org
const APPID = "32aa9a705e117c99f3cd712e3a521b18";
const forecast = false; // set to false for single day weather, true for 5 day forecast
let weatherSpriteIndex = 0;

var getCoordinates = function() {
    if(navigator.geolocation){
    	navigator.geolocation.getCurrentPosition(function(position){
        	var lat = position.coords.latitude;
        	var long = position.coords.longitude;

        	console.log(lat,long);
        	//showWeather(lat, long)
        	updateByGeo(lat,long);
    	})
    }
    else {
    	console.log("Error: Could not get location");
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
	  			var weather = {};
	  			weather.icon = data.weather[0].icon;
	  			weather.condition = convertIcon(data.weather[0].icon);
	  			//weather.condition2 = data.weather[0].main;
	  			weather.city = data.name;
	  			weather.temp = kelvinToCelcius(data.main.temp);
	  			
	  			//console.log(weather);
			}
			else {
				console.log("parsing forecast...")
				var data = JSON.parse(xmlhttp.responseText);

				// 8 readings per day for 5 days. loop over 8 readings for each day
				// to get the day: don't just divide total by 8.
				// truncate the date/time string and sort the list
				// there may exist a sixth day on the end of the list. up to you whether you use it

				// for temperature: get max and min of the 8 readings
				// each reading has a temp, temp_min and a temp_max
				// for weather: find the worst predicted weather where Sun < Clouds < Rain < Snow

				
				weather.icon = data.list[0].weather[0].icon;
				weather.condition = convertIcon(data.list[0].weather[0].icon);
				weather.city = data.city.name;
				weather.temp = kelvinToCelcius(data.list[0].main.temp);
				weather.date = getDateFromString(data.list[0].dt_txt);
				weather.month = getMonthFromString(data.list[0].dt_txt);
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
  		case "02n": case "02d": case "03d": case "03n": case "04d": case "04n":
  		weatherCondition = "Clouds"; break;

  		case "01d": case "01n":
  		weatherCondition = "Fine"; break;

  		case "13d":
  		weatherCondition = "Snow"; break;

  		case "10d": case "11d": case "13d": case "09d":
  		weatherCondition = "Rain"; break;
  	}
  	return weatherCondition;
}

function getDateFromString(dateString){
  	// expected example: "2019-01-03 15:00:00"
  	const dateAbbreviated = dateString.slice(8,10);
  	return dateAbbreviated;
}

function getMonthFromString(dateString){
	// expected example: "2019-01-03 15:00:00"
  	const month = dateString.slice(5,7);
  	return month;
}

function kelvinToCelcius(kelvin){
	let celcius = kelvin - 273.15;
	celcius = celcius.toString().match(/^-?\d+(?:\.\d{0,1})?/)[0]; // regex to round it to 1 dp

	return celcius;
}

//setInterval(function(){ alert("Hello"); }, 3000);

function whichWeatherSprite(conditionString){
	let whichWeather = 0; // should give us rain as a test

	switch(conditionString){
		default:
		case "Fine": whichWeather = 0; break;
		case "Clouds": whichWeather = 1; break;
		case "Rain": whichWeather = 2; break;
		case "Snow": whichWeather = 3; break;
	}

	return whichWeather * 75;
}

window.setInterval(function updateWeatherSprite(condition){
	const sprite = document.querySelector('.weather-sprite');
	const spriteWidth = parseInt((getComputedStyle(sprite).width).replace(/px/,""));
	const spriteHeight = parseInt((getComputedStyle(sprite).height).replace(/px/,""));

	weatherSpriteIndex = (weatherSpriteIndex + 1) % 3;

	const xPos = -whichWeatherSprite(condition);//(currentDay % 3) * - spriteWidth;
	console.log("Sprite Index: " +weatherSpriteIndex);
	const yPos = -(weatherSpriteIndex * spriteHeight);//Math.floor(currentDay / 3) * -spriteHeight;
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
	condition.innerHTML = weather.condition;

	//updateWeatherSprite(weather.condition);

	// update the icon based on the condition
	switch (weather.condition){
		case "Fine": break;
		case "Clouds": break;
		case "Rain": break;
		case "Snow": break;
	}


	console.log("Setting weather...");
}


// start our test
getCoordinates();