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
