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

function updateMonthDisplay(month){
	const monthTop = document.querySelector('.month-top');
	const monthMid = document.querySelector('.month-mid');
	const monthBase = document.querySelector('.month-base');
	const spriteWidth = parseInt((getComputedStyle(monthTop).width).replace(/px/,""));
	//month = 5; // debug

	monthTop.style.backgroundPosition = `${-(month-1) * spriteWidth}px 0px`;
	monthMid.style.backgroundPosition = `${-(month-1) * spriteWidth}px -120px`;
	monthBase.style.backgroundPosition = `${-(month-1) * spriteWidth}px -240px`;
}

function updateDateDisplay(date){
	//console.log(date);
	const dateTens = document.querySelector('.date-tens-top');
	const dateTensMid = document.querySelector('.date-tens-mid');
	const dateTensBase = document.querySelector('.date-tens-base');

	const dateOnes = document.querySelector('.date-ones-top');
	const dateOnesMid = document.querySelector('.date-ones-mid');
	const dateOnesBase = document.querySelector('.date-ones-base');

	const spriteWidth = parseInt((getComputedStyle(dateOnes).width).replace(/px/,""));

	const ones = date % 10;
	const tens = Math.floor(date / 10);

	dateOnes.style.backgroundPosition = `${-ones * spriteWidth}px 0px`;
	dateOnesMid.style.backgroundPosition = `${-ones * spriteWidth}px -150px`;
	dateOnesBase.style.backgroundPosition = `${-ones * spriteWidth}px -300px`;
	//console.log(dateOnesMid);

	dateTens.style.backgroundPosition = `${-tens * spriteWidth}px 0px`;
	dateTensMid.style.backgroundPosition = `${-tens * spriteWidth}px -150px`;
	dateTensBase.style.backgroundPosition = `${-tens * spriteWidth}px -300px`;
}
