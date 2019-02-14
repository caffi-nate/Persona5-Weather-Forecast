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
