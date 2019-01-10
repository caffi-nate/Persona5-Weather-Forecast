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
	//const weekdaySprite = document.querySelector('.weekday-sprite');
	// get dimensions directly from css incase I update the spritesheet later

    //todo: needs extra layers later
	const spriteWidth = parseInt((getComputedStyle(weekdaySprite).width).replace(/px/,""));
	const spriteHeight = parseInt((getComputedStyle(weekdaySprite).height).replace(/px/,""));

	const xPos = (currentDay % 3) * - spriteWidth;
	const yPos = Math.floor(currentDay / 3) * -spriteHeight;
	const positionString = `${xPos}px ${yPos}px`;

	weekdaySprite.style.backgroundPosition = positionString;
}
