/*
	Credit to Drew Clements for some help getting OpenWeatherMap API with vanilla JS
	https://medium.com/@drewclementsdesign/building-a-weather-app-with-vanilla-javascript-920889a78ca2
*/

var getCoordinates = function() {
	updateLoadingText("Getting geolocation...");
    if(navigator.geolocation){
    	navigator.geolocation.getCurrentPosition(function(position){
        	var lat = position.coords.latitude;
        	var long = position.coords.longitude;
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
  	if (forecast) url += "https://api.openweathermap.org/data/2.5/forecast?";
  	else url += "https://api.openweathermap.org/data/2.5/weather?";
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
			// we'll just use the first 5 to avoid bad max-min data

			//console.log("Data:");
			//console.log(data);

			for (i = 0; i < data.list.length; i++){
				var dateTime = new Date(data.list[i].dt*1000); // unix time
				const dt = dateTime.getDate();
				let wthr = new DateWeather();
				wthr.weekday = dateTime.getDay();
				wthr.date = dt;
				wthr.month = dateTime.getMonth();
				wthr.minTemp = kelvinToCelcius(data.list[i].main.temp_min);
				wthr.maxTemp = kelvinToCelcius(data.list[i].main.temp_max);
				//console.log("Icon " + data.list[i].weather[0].icon);
				wthr.conditionInt = convertIcon(data.list[i].weather[0].icon);

				if (dates.has(dt)){ // if the date already exists in our set, compare values
					//todo: look up weird javascript quirk: why do we have to use j-1 instead of j?
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
			weatherImageIndex = weather.conditionInt;
			setWeatherTest(weather);
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

function updateLoadingText(loadingString){
	const loadingText = document.getElementById('loading-text');
	loadingText.innerHTML = loadingString;
}

// start our test
getCoordinates();
