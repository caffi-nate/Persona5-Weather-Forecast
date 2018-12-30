


let isDayTime = true;
let currentDay = 0;


function setDate(){
	const currentTime = new Date();

	console.log(currentTime.getSeconds());

	const day = (currentTime.getDay() + 6) % 7;
	const date = currentTime.getDate();
	const month = currentTime.getMonth();

	console.log(day);

	updateDaySprite(day);
	updateDateDisplay(date);
	updateMonthDisplay(month+1);

	// for each of the functions below, test by toggling at the end of a minute

	// todo: write a script that toggles day to night etc at 6AM and 6PM

	// todo: write a script that toggles the current day at 12AM every night
}

function updateDaySprite(currentDay, currentDate){
	const weekdaySprite = document.querySelector('.weekday-sprite');

	let positionString = "";
	switch(currentDay){
		case 0: positionString = "0px -0px"; break; // Monday
		case 1: positionString = "-191px -0px"; break; // Tuesday
		case 2: positionString = "-382px -0px"; break; // Wednesday
		case 3: positionString = "-0px -74px"; break; // Thursday
		case 4: positionString = "-191px -74px"; break; // Friday
		case 5: positionString = "-382px -74px"; break; // Saturday
		case 6: positionString = "-0px -148px"; break; // Sunday
	}

	weekdaySprite.style.backgroundPosition =  positionString;
}

function updateDateDisplay(date){
	const dateTens = document.querySelector('.day-number-tens');
	const dateOnes = document.querySelector('.day-number-ones');

	const spriteWidth = parseInt((getComputedStyle(dateOnes).width).replace(/px/,""));

	const ones = date % 10;
	const tens = Math.floor(date / 10);
	dateOnes.style.backgroundPosition = `${-ones * spriteWidth}px 0px`;
	dateTens.style.backgroundPosition = `${-tens * spriteWidth}px 0px`;
}

function updateMonthDisplay(month){
	const monthTens = document.querySelector('.month-tens-top');
	const monthTensMid = document.querySelector('.month-tens-mid');
	const monthTensBase = document.querySelector('.month-tens-base');

	const monthOnes = document.querySelector('.month-ones-top');
	const monthOnesMid = document.querySelector('.month-ones-mid');
	const monthOnesBase = document.querySelector('.month-ones-base');

	const spriteWidth = parseInt((getComputedStyle(monthOnes).width).replace(/px/,""));

	const ones = month % 10;
	const tens = Math.floor(month / 10);

	monthOnes.style.backgroundPosition = `${-ones * spriteWidth}px 0px`;
	monthOnesMid.style.backgroundPosition = `${-ones * spriteWidth}px -150px`;
	monthOnesBase.style.backgroundPosition = `${-ones * spriteWidth}px -300px`;

	monthTens.style.backgroundPosition = `${-tens * spriteWidth}px 0px`;
	monthTensMid.style.backgroundPosition = `${-tens * spriteWidth}px -150px`;
	monthTensBase.style.backgroundPosition = `${-tens * spriteWidth}px -300px`;
}


function toggleBackground(){
	const overlayImages = document.querySelectorAll('.timeOfDay');

	isDayTime = !isDayTime;

	overlayImages.forEach(overlayImage => {
		if (isDayTime){
			overlayImage.classList.remove('night');
			currentDay = (currentDay + 1) % 7;
		}
		else {
			overlayImage.classList.add('night');
		}
	});


	// 191 width, 74 height


};



function moveSprite(e){
	
	const weekdaySprite = document.querySelector('.weekday-sprite');

	// get the background position from the css and split it into 2 integers
	const backgroundPos = getComputedStyle(weekdaySprite).backgroundPosition;
	let left =  parseInt(backgroundPos.split(" ")[0].replace(/px/,""));
	let top = parseInt(backgroundPos.split(" ")[1].replace(/px/,"")); 

	console.log(top);
	console.log(left);


	//let topPixels = parseInt(topString.replace(/px/,""));

	/*
	const topString = getComputedStyle(weekdaySprite).top;
	const leftString = getComputedStyle(weekdaySprite).left;

	
	let leftPixels = parseInt(leftString.replace(/px/,""));

	console.log(topPixels);
	console.log(leftPixels);
	*/
	let x_movement = 0;
	let y_movement = 0;
	const moveSpeed = 2;
	



	if (e.key == "ArrowRight"){
		x_movement = moveSpeed;
		//console.log(e);
	}
	else if (e.key == "ArrowLeft"){
		x_movement = -moveSpeed;
		//console.log(e);
	}
	else if (e.key == "ArrowUp"){
		y_movement = -moveSpeed;
		//console.log(e);
	}
	else if (e.key == "ArrowDown"){
		y_movement = moveSpeed;
		//console.log(e);
	}
	top += y_movement;
	left += x_movement;

	//(parseInt("40px".replace(/px/,""))+60)+"px";


	weekdaySprite.style.backgroundPosition = `${left}px ${top}px`;
	//weekdaySprite.style.left = `${leftPixels}px`;

	
}


// only run once per second
setInterval(setDate, 1000);
setDate();



window.addEventListener('mousedown', toggleBackground);
document.addEventListener('keydown', moveSprite);
