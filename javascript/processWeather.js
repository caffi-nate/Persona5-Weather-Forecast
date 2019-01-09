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
	//updateWeatherSprite(containerWeatherSprite,weatherImageIndex);

	onLoadComplete();
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
		const weekdaySprite = gridWeatherItem.querySelector('.weekday-sprite');

		const weatherSprite = gridWeatherItem.querySelector('.current-weather-sprite');

		const day = weatherDays[i+1]
        console.log(day);
		const tens = Math.floor(day.date / 10);
		const ones = day.date % 10;

        const minTemp = day.minTemp;
        const maxTemp = day.maxTemp;

        const maxMinTemp = gridWeatherItem.querySelector('.max-min-temp');

        maxMinTemp.innerHTML = `${minTemp}` + "\u00B0" +`- ${maxTemp}`  + "\u00B0";


		updateWeatherSprite(weatherSprite,day.conditionInt);
		updateWeekdaySprite((day.weekday + 6) % 7,weekdaySprite);

		dateOnes.style.backgroundPosition = `${-ones * spriteWidth}px 0px`;
		dateOnesMid.style.backgroundPosition = `${-ones * spriteWidth}px -150px`;
		dateOnesBase.style.backgroundPosition = `${-ones * spriteWidth}px -300px`;
		dateTens.style.backgroundPosition = `${-tens * spriteWidth}px 0px`;
		dateTensMid.style.backgroundPosition = `${-tens * spriteWidth}px -150px`;
		dateTensBase.style.backgroundPosition = `${-tens * spriteWidth}px -300px`;





	};
}
