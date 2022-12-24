// started 11/7/2021
// initial finish 11/30/2021

//  TO-DO List
//  ----------
//  - music per region if possible

//  Future Goals (if there is time)
//  ------------
//  - neat easter egg of clicking the monster's picture
//  - add background music depending on the locale
//  - create exit methods for monsters so they can exit gracefully

// scoreCount is for score count while onOff is used for nulling buttons or activating them
var scoreCount = 0;
var onOff = true;
// 0 = both alive, 1 = monster dead, 2 = hero dead, 3 = malroth dead, 4 = ???
var gameState = 0;
var turnCount = 1;
var atb = 0;

var hitFX = new sound("hit-2.mp3");
var fireFX = new sound("breathing-fire.mp3");
var healFX = new sound("spell.mp3");
var shieldFX = new sound("door.mp3");
var critFX = new sound("excellent-move.mp3");
var missFX = new sound("miss-2.mp3");

var monSpellFX = new sound("prepare-attack.mp3");
var monHitFX = new sound("hit.mp3");
var monMissFX = new sound("miss.mp3");

var deathFX = new sound("cursed.mp3");
var victoryFX = new sound("level-up.mp3");
var timeoutFX = new sound("revival.mp3");

// hero class to hold all the methods and stats of the player character
class Hero {
	constructor(name, health, magic, atk, matk, def, mdef) {
		this.name = name;
		this.health = health;
		this.currentHealth = health;
		this.magic = magic;
		this.currentMagic = magic;
		this.atk = atk;
		this.matk = matk;
		this.tempDef = def;
		this.def = def;
		this.tempMdef = mdef;
		this.mdef = mdef;
		this.spellCost = 15;
		this.healCost = 9;
	}

	// deals physical damage and calculates the remaining health of the monster
	heroAttack(monDef) {
		var rollSeed = Math.floor(Math.random() * 10);
		var damageSeed = Math.floor(Math.random() * 101);
		var damageDealt = this.atk - monDef + rollSeed;
		if(damageDealt <= 9) { damageDealt = 0; }
		
		// depending on the roll, the hero may attack, miss, or land a critical hit
		if(damageSeed >= 97) {
			writeLog(this.name + " attacks.");
			writeLog("But overswung and missed!");
			animateMS();
		}
		else if(damageSeed >= 90) {
			writeLog(this.name + " attacks.");
			writeLog("Critical Hit!!!");
			animateCS();
			damageDealt = Math.floor(damageDealt * 1.33);
			monList[scoreCount].currentHealth = monList[scoreCount].currentHealth - damageDealt;
			writeLog(monList[scoreCount].name + " took " + damageDealt + " damage!");
		}
		else {
			writeLog(this.name + " attacks.");
			animateS();
			monList[scoreCount].currentHealth = monList[scoreCount].currentHealth - damageDealt;
			writeLog(monList[scoreCount].name + " took " + damageDealt + " damage!");
		}
		
	}

	// deals magical damage and calculates the remaining health of the monster, also updates the MP bar
	heroMagic(monMdef) {
		
		if(this.currentMagic <= 0) {
			writeLog(this.name + " tries to cast " + document.getElementById('magicBtn').innerHTML + ".");
			writeLog("But had no MP to cast " + document.getElementById('magicBtn').innerHTML + "!");
		}
		else {
			var rollSeed = Math.floor(Math.random() * 10);
			var damageDealt = this.matk - monMdef + rollSeed;
			if(damageDealt <= 9) { damageDealt = 0; }
			monList[scoreCount].currentHealth = monList[scoreCount].currentHealth - damageDealt;
			writeLog(this.name + " casts " + document.getElementById('magicBtn').innerHTML + ".");
			animateM();
			writeLog(monList[scoreCount].name + " took " + damageDealt + " damage!");
			this.currentMagic = this.currentMagic - this.spellCost;
			if(this.currentMagic <= 0) { this.currentMagic = 0; }
			document.getElementById('mpBar').value = this.currentMagic + "/" + this.magic;
		}
		
	}
	
	// heals the hero while making sure not to overheal
	heroHeal() {
		if(this.currentMagic <= 0) {
			writeLog(this.name + " tries to cast " + document.getElementById('healBtn').innerHTML + ".");
			writeLog("But had no MP to cast " + document.getElementById('healBtn').innerHTML + "!");
		}
		else {
			var rollSeed = Math.floor(Math.random() * 11);
			var damageRestored = Math.floor((this.mdef * 2.73) + rollSeed);
			writeLog(this.name + " casts " + document.getElementById('healBtn').innerHTML + ".");
			animateH();
			writeLog(this.name + " healed " + damageRestored + " damage!");
			this.currentHealth = this.currentHealth + damageRestored;
			if(this.currentHealth > this.health) { this.currentHealth = this.health; }
			document.getElementById('hpBar').value = this.currentHealth + "/" + this.health;
			this.currentMagic = this.currentMagic - this.healCost;
			if(this.currentMagic <= 0) { this.currentMagic = 0; }
			document.getElementById('mpBar').value = this.currentMagic + "/" + this.magic;
		}
		
	}
	
	// increases the hero's defense in preparation for the monster's attack
	heroDefend() {
		this.def = this.def + (this.def * 0.20);
		this.mdef = this.mdef + (this.mdef * 0.20);
		writeLog(this.name + " defends.");
		animateD();
	}
	
}

// monster class for creating various enemies
class Monster {
	constructor(name, health, atk, matk, def, mdef, looks, mWidth, mHeight, mTop, mLeft) {
		this.name = name;
		this.health = health;
		this.currentHealth = health;
		this.atk = atk;
		this.matk = matk;
		this.def = def;
		this.mdef = mdef;
		this.looks = looks;
		this.mWidth = mWidth;
		this.mHeight = mHeight;
		this.mTop = mTop;
		this.mLeft = mLeft;
	}
	
	// basic attack command
	// makes sure the hero's health does not go under zero
	damage(heroDef, heroMdef) {
		var rollSeed = Math.floor(Math.random() * 7);
		var damageSeed = Math.floor(Math.random() * 101);
		var damageDealt = this.atk - heroDef + rollSeed;
		var damageDealtM = this.matk - heroMdef + rollSeed;
		
		console.log(damageDealtM);
		console.log(damageDealt);
		console.log(damageSeed);
		
		if (turnCount % 5 == 0) {
			damageDealt = Math.floor(this.health / 3);
			writeLog(monList[scoreCount].name + " makes a desperate attack!");
			setTimeout(function(){ critFX.play(); }, atb);
			writeLog(yuusha.name + " took " + damageDealt + " damage!");
			yuusha.currentHealth = yuusha.currentHealth - damageDealt;
			if (yuusha.currentHealth < 0){ yuusha.currentHealth = 0;}
			document.getElementById('hpBar').value = yuusha.currentHealth + "/" + yuusha.health;
			
		}
		else {
			if (damageSeed >= 96) {
				writeLog(monList[scoreCount].name + " attacks.");
				setTimeout(function(){ monMissFX.play(); }, atb);
				writeLog("But missed spectacularly!");
			}
			else if (damageSeed >= 90) {
				if (damageDealt <= 6){ damageDealt = 0;}
				damageDealt = Math.floor(damageDealt * 1.33);
				writeLog(monList[scoreCount].name + " attacks.");
				setTimeout(function(){ critFX.play(); }, atb);
				writeLog("Critical Hit!!!");
				writeLog(yuusha.name + " took " + damageDealt + " damage!");
				yuusha.currentHealth = yuusha.currentHealth - damageDealt;
				if (yuusha.currentHealth < 0){ yuusha.currentHealth = 0;}
				document.getElementById('hpBar').value = yuusha.currentHealth + "/" + yuusha.health;
			}
			else if (damageSeed >= 60) {
				if (damageDealtM <= 0){ damageDealtM = 0;}
				writeLog(monList[scoreCount].name + " casts a spell.");
				setTimeout(function(){ monSpellFX.play(); }, atb);
				writeLog(yuusha.name + " took " + damageDealtM + " damage!");
				yuusha.currentHealth = yuusha.currentHealth - damageDealtM;
				if (yuusha.currentHealth < 0){ yuusha.currentHealth = 0;}
				document.getElementById('hpBar').value = yuusha.currentHealth + "/" + yuusha.health;
			}
			else {
				if (damageDealt <= 0){ damageDealt = 0;}
				writeLog(monList[scoreCount].name + " attacks.");
				setTimeout(function(){ monHitFX.play(); }, atb);
				writeLog(yuusha.name + " took " + damageDealt + " damage!");
				yuusha.currentHealth = yuusha.currentHealth - damageDealt;
				if (yuusha.currentHealth < 0){ yuusha.currentHealth = 0;}
				document.getElementById('hpBar').value = yuusha.currentHealth + "/" + yuusha.health;
			}
		}
		
	}
	
	// entrance call for all monsters; displays their images, and announces their arrival
	enterBattle() {
		document.getElementById('monsterIMG').style.opacity = "0.0";
		document.getElementById('monsterIMG').src = this.looks;
		document.getElementById('monsterIMG').style.width = this.mWidth;
		document.getElementById('monsterIMG').style.height = this.mHeight;
		document.getElementById('monsterIMG').style.top = this.mTop;
		document.getElementById('monsterIMG').style.left = this.mLeft;
		
		arenaSwap()
		document.getElementById('monsterIMG').style.opacity = "1.0";
		writeLog(this.name + " has drawn near!");
	}
	
	// failed implementation of animating an entrance and exit
	// will come back to this in future endeavors
	/*exitBattle() {
		var drawsNear = setInterval(function(){
			document.getElementById('monsterIMG').style.opacity = opacity;
			opacity -= 0.1;
			
			if(opacity == 0.0){
			clearInterval(drawsNear);
		}
		}, 70);
		
		opacity = 0.0;
		
	}*/
	
}

// hero objects, one to reset the hero's stats in case of future growths
// the other is the hero used throughout the challenge
let baseYuusha = new Hero("Hero", 187, 227, 50, 50, 40, 30);
let yuusha = new Hero("Hero", 187, 227, 50, 50, 40, 30);

//debug stats
//let yuusha = new Hero("Hero", 187, 227, 1000, 1000, 100, 30);

// monster objects for each different enemy faced, each with their stats and placements
// beginning plains monsters
let slime = new Monster("Slime", 70, 50, 40, 30, 30, "dq-slime-transparent.png", "50px", "52px", "160px", "160px");
let hare = new Monster("Spiked Hare", 100, 50, 60, 32, 30, "dq-spikedhare-transparent.png", "80px", "70px", "140px", "145px");
let golem = new Monster("Golem", 220, 80, 10, 50, 10, "dq-golem-transparent.png", "166px", "160px", "90px", "105px");

// gloomy forest monsters
let funghoul = new Monster("Funghoul", 155, 80, 80, 40, 40, "dq-funghoul-transparent.png", "62px", "67px", "145px", "155px");
let rampage = new Monster("Rampage", 210, 90, 70, 40, 70, "dq-rampage-transparent.png", "114px", "110px", "120px", "125px");
let robin = new Monster("Robbin\' \'Ood", 500, 100, 50, 20, 10, "dq-robbinood-transparent.png", "174px", "130px", "120px", "90px");

// warrior's valley monsters
let raven = new Monster("Stark Raven", 120, 110, 120, 60, 90, "dq-starkraven-transparent.png", "56px", "78px", "130px", "160px");
let chimaera = new Monster("Hocus Chimaera", 150, 105, 130, 60, 90, "dq-hocuschimaera-transparent.png", "98px", "84px", "110px", "140px");
let hades = new Monster("Hades Condor", 220, 110, 130, 70, 90, "dq-hadescondor-transparent.png", "120px", "120px", "90px", "125px");

// journey's end monsters
let dragonlord = new Monster("Dragonlord", 400, 160, 150, 70, 60, "Dragonlord_DQ_SNES.gif", "99px", "95px", "130px", "145px");
let hargon = new Monster("Hargon", 600, 150, 160, 60, 30, "dq-hargon-transparent.png", "140px", "144px", "80px", "125px");
let malroth = new Monster("Malroth", 800, 160, 170, 60, 1000, "dq-malroth-transparent.png", "172px", "190px", "50px", "100px");

// monster array to shift through them as the battles continue
// makes it easy to utilize similar class functions with less code
let monList = [];
monList[0] = slime;
monList[1] = hare;
monList[2] = golem;
monList[3] = funghoul;
monList[4] = rampage;
monList[5] = robin;
monList[6] = raven;
monList[7] = chimaera;
monList[8] = hades; 
monList[9] = dragonlord;
monList[10] = hargon;
monList[11] = malroth;

// function that starts off a fresh new game
function gameStart() {
	//resetting the values and starting the game up at its first stage
	startTimer();
	gameState = 0;
	document.getElementById('scoreBoard').value = scoreCount;
	document.getElementById('hpBar').value = yuusha.currentHealth + "/" + yuusha.health;
	document.getElementById('mpBar').value = yuusha.currentMagic + "/" + yuusha.currentMagic;
	document.getElementById('battleText').style.opacity = "1.0";
	arenaSwap();
	setTimeout(function(){ buttonSwitch(); }, 500);
	monList[scoreCount].enterBattle();	
	
}

// function that clears the ui and resets the game to a new start
function resetGame() {
	document.getElementById('battleText').style.opacity = "0.0";
	document.getElementById('scoreBoard').value = " ";
	document.getElementById('timeCount').value = " ";
	document.getElementById('locationName').innerHTML = "PRESS START";
	document.getElementById('monsterIMG').src = " ";
	document.getElementById('monsterIMG').style.width = "1px";
	document.getElementById('monsterIMG').style.height = "1px";
	document.getElementById('victory').style.width = "1px";
	document.getElementById('victory').style.height = "1px";
	document.getElementById('backgroundIMG').src = "reset-scene.jpg";
	scoreCount = 0;
	atb = 0;
	
	// duds the buttons if manual reset or leaves it dudded if game lost
	if(gameState == 0) { 
		buttonSwitch(); 
		gameState = 4;
	}
	else if(gameState == 1){
		buttonSwitch(); 
		gameState = 4;
	}
	else if(gameState == 2){ 
		gameState = 4; 
	}
	else {
		gameState = 4;
	}
	
	// uses the base hero class to reset the stats on the player unit
	yuusha.currentHealth = baseYuusha.currentHealth ;
	yuusha.health = baseYuusha.health ;
	yuusha.currentMagic = baseYuusha.currentMagic ;
	yuusha.magic = baseYuusha.magic ;
	yuusha.atk = baseYuusha.atk ;
	yuusha.def = baseYuusha.def ;
	yuusha.tempDef = baseYuusha.tempDef ;
	yuusha.matk = baseYuusha.matk ;
	yuusha.mdef = baseYuusha.mdef ;
	yuusha.tempMdef = baseYuusha.tempMdef ;
	
	// resets the health on the monsters (will iterate for the array)
	//golem.currentHealth = golem.health;
	for(var i = 0; i < 12; i++) {
		monList[i].currentHealth = monList[i].health;
	}
	
	// empties out the hp and mp bars and sets the reset button to the start button
	document.getElementById('hpBar').value = " ";
	document.getElementById('mpBar').value = " ";
	document.getElementById("startReset").onclick = gameStart;
	document.getElementById("startReset").innerHTML = "START GAME";
	
}

// allows the turn to pass with the attack action from the hero amd an attack option from the monster
function attackButton() {
	buttonSwitch();
	yuusha.heroAttack(monList[scoreCount].def);
	deathCheck();
	turnCount += 1;
	
	// checks if player/monster is dead and moves to the next fight if necessary
	if (gameState == 0){
		monList[scoreCount].damage(yuusha.def, yuusha.mdef);
		deathCheck();
		setTimeout(function(){ buttonSwitch(); }, atb);
	}
	else if(gameState == 1){
		setTimeout(function(){monList[scoreCount].enterBattle();}, atb);
		setTimeout(function(){ buttonSwitch(); }, atb);
		turnCount = 0;
		gameState = 0;
	}
	else if(gameState == 3){
		buttonSwitch();
		setTimeout(function(){ victory(); }, atb);
		writeLog("Congratulations!");
		writeLog("You Win!");
	}
	atb = 0;
	
}

// allows the turn to pass with the spell action from the hero and an attack option from the monster
function magicButton() {
	buttonSwitch();
	yuusha.heroMagic(monList[scoreCount].mdef);
	turnCount += 1;
	deathCheck();
	
	// checks if player/monster is dead and moves to the next fight if necessary
	if (gameState == 0) {
		monList[scoreCount].damage(yuusha.def, yuusha.mdef);
		deathCheck();
		setTimeout(function(){ buttonSwitch(); }, atb);
	}
	else if(gameState == 1){
		setTimeout(function(){monList[scoreCount].enterBattle();}, atb);
		setTimeout(function(){ buttonSwitch(); }, atb);
		turnCount = 0;
		gameState = 0;
	}
	else if(gameState == 3){
		buttonSwitch();
		setTimeout(function(){ victory(); }, atb);
		writeLog("Congratulations!");
		writeLog("You Win!");
	}
	atb = 0;
}

// allows the turn to pass with the heal action from the hero and an attack option from the monster
function healButton() {
	buttonSwitch();
	yuusha.heroHeal();
	turnCount += 1;
	deathCheck();
	
	// checks if player/monster is dead and moves to the next fight if necessary
	if (gameState == 0) {
		monList[scoreCount].damage(yuusha.def, yuusha.mdef);
		deathCheck();
		setTimeout(function(){ buttonSwitch(); }, atb);
	}
	else if(gameState == 1){
		setTimeout(function(){monList[scoreCount].enterBattle();}, atb);
		setTimeout(function(){ buttonSwitch(); }, atb);
		turnCount = 0;
	}
	else if(gameState == 3){
		buttonSwitch();
		setTimeout(function(){ victory(); }, atb);
		writeLog("Congratulations!");
		writeLog("You Win!");
	}
	atb = 0;
}

// allows the turn to pass with the defend action from the hero and an attack option from the monster
function defendButton() {
	buttonSwitch();
	yuusha.heroDefend();
	turnCount += 1;
	deathCheck();
	
	// checks if player/monster is dead and moves to the next fight if necessary
	if (gameState == 0) {
		monList[scoreCount].damage(yuusha.def, yuusha.mdef);
		deathCheck();
		setTimeout(function(){ buttonSwitch(); }, atb);
		yuusha.def = yuusha.tempDef;
		yuusha.mdef = yuusha.tempMdef;
	}
	else if(gameState == 1){
		setTimeout(function(){monList[scoreCount].enterBattle();}, atb);
		setTimeout(function(){ buttonSwitch(); }, atb);
		turnCount = 0;
	}
	else if(gameState == 3){
		buttonSwitch();
		setTimeout(function(){ victory(); }, atb);
		writeLog("Congratulations!");
		writeLog("You Win!");
	}
	atb = 0;
}

// dud function for when the player is not allowed to hit buttons
function dud() {
	console.log("RESET/START THE GAME, BUTTON IS A DUD");
	
}

// function that switches all the buttons excluding reset/start into duds or unduds them
function buttonSwitch() {
	if(onOff == true) {
		document.getElementById('attackBtn').onclick = attackButton;
		document.getElementById('magicBtn').onclick = magicButton;
		document.getElementById('healBtn').onclick = healButton;
		document.getElementById('defendBtn').onclick = defendButton;
		document.getElementById("startReset").onclick = resetGame;
		document.getElementById("startReset").innerHTML = "RESET GAME";
		onOff = false;
	}
	else {
		document.getElementById('attackBtn').onclick = dud;
		document.getElementById('magicBtn').onclick = dud;
		document.getElementById('healBtn').onclick = dud;
		document.getElementById('defendBtn').onclick = dud;
		onOff = true;
	}
	
}

// function that checks whether the player is dead and the monster is dead and switches the gameState accordingly
function deathCheck() {
	if (monList[scoreCount].currentHealth <= 0) {
		writeLog(monList[scoreCount].name + " has been slain!");
		//setTimeout(function(){ monList[scoreCount].exitBattle(); }, 1100);
		scoreCount += 1;
		
		if (scoreCount == 12){ 
			gameState = 3;
			buttonSwitch();
		}
		else { gameState = 1; }
		
		document.getElementById('scoreBoard').value = scoreCount;
	}
	if(yuusha.currentHealth == 0){
		writeLog(yuusha.name + " has been slain!");
		writeLog("GAME OVER");
		setTimeout(function(){ deathFX.play(); }, atb);
		gameState = 2;
		buttonSwitch();
	}
	
}

// switches the locale the player is fighting in based on the score count 
function arenaSwap() {
	switch(scoreCount) {
		case 0:
			document.getElementById('locationName').innerHTML = "Beginner Plains";
			document.getElementById('backgroundIMG').src = "battle-scene-1.jpg";
			break;
		
		case 3:
			document.getElementById('locationName').innerHTML = "Gloomy Forest";
			document.getElementById('backgroundIMG').src = "battle-scene-2.jpg";
			levelUp();
			break;
			
		case 6:
			document.getElementById('locationName').innerHTML = "Warrior's Valley";
			document.getElementById('backgroundIMG').src = "battle-scene-3.jpg";
			levelUp();
			break;
			
		case 9:
			document.getElementById('locationName').innerHTML = "Journey's End";
			document.getElementById('backgroundIMG').src = "battle-scene-8.jpg";
			levelUp();
			break;
	}	
}

// general function for putting any text directly into the battleText box
function writeLog(words) {
	setTimeout(function(){
		document.getElementById('battleText').value = words;
	}, atb);
	atb += 620;
}

// interval function that shows the timer and ends the game when time is up
function startTimer() {
	var thisClock = setInterval(updateTime, 1000);
	var interval = 300;
	
	// will stop the timer on reset, death, timeout, and/or victory
	function updateTime() {
		if(gameState == 3) {
			document.getElementById('timeCount').value = interval;
			writeScore(interval);
			interval = 300;
			clearInterval(thisClock);
		}
		else if(gameState == 2) {
			document.getElementById('timeCount').value = interval;
			writeScore(interval);
			interval = 300;
			clearInterval(thisClock);
		}
		else if(gameState == 4) {
			document.getElementById('timeCount').value = "";
			document.getElementById('battleText').value = "";
			interval = 300;
			clearInterval(thisClock);
		}
		else if (interval > 0) {
			document.getElementById('timeCount').value = interval;
			interval -= 1;
		}
		else if (interval == 0){
			document.getElementById('timeCount').value = interval;
			writeScore(interval);
			closeGame();
			interval = 300;
			clearInterval(thisClock);
		}
	}
}

// general function that duds the buttons upon timeout
function closeGame() {
	buttonSwitch();
	writeLog("TIME'S UP");
	setTimeout(function(){ timeoutFX.play(); }, atb);
	gameState = 2;
}

// slashing animation when the hero lands a basic attack
function animateS() {
	setTimeout(function(){
		document.getElementById('slashEffect').style.width = "300px";
		document.getElementById('slashEffect').src = "slash_effect_transparent_2.gif";
		hitFX.play();
	}, 600);
	setTimeout(function(){ 
		document.getElementById('slashEffect').src = ""; 
		document.getElementById('slashEffect').style.width = "0px";
	}, 1100);
}

// slashing animation when the hero whiffs a basic attack
function animateMS() {
	setTimeout(function(){
		document.getElementById('slashEffect').style.width = "300px";
		document.getElementById('slashEffect').src = "slash_effect_transparent_2.gif";
		missFX.play();
	}, 600);
	setTimeout(function(){ 
		document.getElementById('slashEffect').src = ""; 
		document.getElementById('slashEffect').style.width = "0px";
	}, 1100);
}

// slashing animation when the hero lands a critical hit
function animateCS() {
	setTimeout(function(){
		document.getElementById('slashEffect').style.width = "300px";
		document.getElementById('slashEffect').src = "slash_effect_transparent_2.gif";
		hitFX.play();
	}, 600);
	setTimeout(function(){ 
		document.getElementById('slashEffect').src = ""; 
		document.getElementById('slashEffect').style.width = "0px";
	}, 1100);
	setTimeout(function(){
		document.getElementById('slashEffect').style.transform = "scaleX(-1)";
		document.getElementById('slashEffect').style.width = "300px";
		document.getElementById('slashEffect').src = "slash_effect_transparent_2.gif";
		critFX.play();
	}, 1101);
	setTimeout(function(){ 
		document.getElementById('slashEffect').src = ""; 
		document.getElementById('slashEffect').style.width = "0px";
		document.getElementById('slashEffect').style.transform = "scaleX(1)";
	}, 1601);
}

// magic animation when the hero casts fireball
function animateM() {
	setTimeout(function(){ 
		document.getElementById('fireEffect').style.height = "200px";
		document.getElementById('fireEffect').src = "fireball.gif"; 
		fireFX.play();
	}, 650);
	setTimeout(function(){ 
		document.getElementById('fireEffect').src = ""; 
		document.getElementById('fireEffect').style.height = "0px";
	}, 1200);
}

// healing animation when the hero casts heal
function animateH() {
	setTimeout(function(){
		document.getElementById('healingEffect').style.width = "300px";
		document.getElementById('healingEffect').src = "healing.gif";
		healFX.play();
	}, 600);
	
	setTimeout(function(){ 
		document.getElementById('healingEffect').src = ""; 
		document.getElementById('healingEffect').style.width = "0px";
	}, 1700);
}

function animateD() {
	setTimeout(function(){
		document.getElementById('shieldEffect').style.height = "280px";
		document.getElementById('shieldEffect').style.width = "250px";
		document.getElementById('shieldEffect').src = "shield.png";
		shieldFX.play();
	}, 600);
	
	setTimeout(function(){ 
		document.getElementById('shieldEffect').src = ""; 
		document.getElementById('shieldEffect').style.height = "0px";
		document.getElementById('shieldEffect').style.width = "0px";
	}, 2400);
}

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}

// updates the scoreboard with the total points and time taken for that particular run
// does NOT include the score for resets
function writeScore(timeLeft) {
	for(var i = 13; i > 1; i-= 1) {
		var logTitle = "actionLog" + i;
		var logTitle2 = "actionLog" + (i - 1);
		document.getElementById(logTitle).value = document.getElementById(logTitle2).value;
	}
	
	var totalTime = 300 - timeLeft;
	document.getElementById('actionLog1').value = yuusha.name + " - " + scoreCount + "pts - " + totalTime + "sec";
	
}

// levels up the hero after completing a stage/arena
function levelUp() {
	yuusha.health += 150;
	yuusha.magic += 100;
	yuusha.atk += 30;
	yuusha.matk += 30;
	yuusha.def += 20;
	yuusha.tempDef += 20;
	yuusha.mdef += 20;
	yuusha.tempMdef += 20;
	
	yuusha.currentHealth += Math.floor(yuusha.health / 9) + 150;
	if(yuusha.currentHealth > yuusha.health) { yuusha.currentHealth = yuusha.health; };
	yuusha.currentMagic += Math.floor(yuusha.magic / 5) + 100;
	if(yuusha.currentMagic > yuusha.magic) { yuusha.currentMagic = yuusha.magic; };
	
	document.getElementById('hpBar').value = yuusha.currentHealth + "/" + yuusha.health;
	document.getElementById('mpBar').value = yuusha.currentMagic + "/" + yuusha.magic;
	
}

// puts confetti on the screen when the player beats the final monster
function victory() {
	document.getElementById('monsterIMG').style.height = "1px";
	document.getElementById('monsterIMG').style.width = "1px";
	document.getElementById('victory').style.width = "350px";
	document.getElementById('victory').style.height = "300px";
	victoryFX.play();
}