/*
	Credit to Drew Clements for some help getting OpenWeatherMap API with vanilla JS
	https://medium.com/@drewclementsdesign/building-a-weather-app-with-vanilla-javascript-920889a78ca2
*/

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



// start our test
getCoordinates();
console.log("Getting weather...");
