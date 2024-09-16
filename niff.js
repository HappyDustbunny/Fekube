const pi = Math.PI;
const kv3h = Math.sqrt(3)/2;
const timer = ms => new Promise(res => setTimeout(res, ms));
const winWidth = window.screen.width;
const winHeight = winWidth;  // These two variables are currently used together to make square displays
const zoomFactor = winWidth * 0.8 / 300;
const config = {fps: 10, qrbox: {width: 0.8 * winWidth, height: 0.8 * winHeight}};
// Initialize QR-code reader
const html5Qrcode = new Html5Qrcode("reader");


let gameMode = '';
let globalMana = 500;  // Start with some mana to heal attacked players
let localMana = 0;
let currentUser = '';
let isVictim = 0;  // Change to 5 if player is attacked and needs healing. Is healed fully by Healer, but need a few scans of '0' to heal alone

let messageDiv = document.getElementById('messageDiv');
let healMsgs = [
    'Det var bedre!',
    'Det hjælper',
    'Lidt mere',
    'Og ... sidste gang'
]

let lastScan = 0;     // Used for M3T1G1
let clockFaceCoor = { // Used for M3T1G1
    0: [130 * 0.0 + 150, -130 * 0.0 + 150],
    1: [130 * 0.5 + 150, -130 * kv3h + 150],
    2: [130 * kv3h + 150, -130 * 0.5 + 150],
    3: [130 * 1.0 + 150, -130 * 0.0 + 150],
    4: [130 * kv3h + 150,  -130 *-0.5 + 150],
    5: [130 * 0.5 + 150, -130 * -kv3h + 150],
    6: [130 * 0.0 + 150, -130 * -1.0 + 150],
    7: [130 * -0.5 + 150, -130 * -kv3h + 150],
    8: [130 * -kv3h + 150, -130 * -0.5 + 150],
    9: [130 * -1.0 + 150, -130 * 0.0 + 150],
    10: [130 * -kv3h + 150, -130 * 0.5 + 150],
    11: [130 * -0.5 + 150, -130 * kv3h + 150],
    12: [130 * 0.0 + 150, -130 * 1.0 + 150]
} ;


// Gamemodes below

class NiffGame {
    constructor(){
        this.globalMana = 500;
    }
}


class NiffUser extends NiffGame {  // Maybe execissive, but opens for change of gamemode during a game
    constructor(gameMode, goalArray) {
        super();
        this.localMana = 0;
    }
    
}


class NiffGameMode extends NiffUser {
    constructor(gameMode) {
        super();
        this.goalArray = ['dummyGoal'];
        this.currentGoalNumber = 0; 
        this.currentGoal = this.goalArray[this.currentGoalNumber];
    }
    
    updateGoal () {
        if (this.currentGoalNumber < this.goalArray.length - 1) {
            this.currentGoalNumber += 1;
            this.currentGoal = this.goalArray[this.currentGoalNumber];
        }
    }
}


class M1T1G1 extends NiffGameMode {  // Healer
    constructor() {
        super();
        this.gameMode = 'M1T1G1';

        generateQRcode("Thy shalst be healed!").append(document.getElementById("canvasQrShow"));
        // ToDo: Add explaning text?
        document.getElementById('healButton').hidden = false;
        document.getElementById('uglyHackSpacer').hidden = false
        clearInterval(attackTimer);  // Makes sure the Healer is not attacked
    }

    applyQrCode(QrNumber) {
        if (QrNumber === 'center') {
            let newDelta = 10;
            this.localMana += Number(newDelta);
            updateManaCounters(newDelta); // Todo: Remove the Healers scan-button for 10 seconds after each scan?
        }
    }
}


class M2T2G1 extends NiffGameMode {  // Indstil visere
    constructor() {
        super();
        this.gameMode = 'M2T2G1';
        this.firstGuess = true;

        let arrayLen = 20;
        this.goalArray = [];
        for (var i = 0; i < arrayLen; i++) {
            let hour = Math.floor(Math.random() * 25);
            let min = Math.floor(Math.random() * 12) * 5;
            this.goalArray.push([hour, min]);
        }
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        
        showText = document.getElementById('showText');
        showText.hidden = false;
        showText.innerHTML = '<h2>' + this.currentGoal[0] + ':' + this.currentGoal[1] + '</h2> <span> (Sæt den lille viser først) </span>';
        if (this.currentGoal[1] === 0 || this.currentGoal[1] === 5) {
            showText.innerHTML = '<h2>' + this.currentGoal[0] + ':0' + this.currentGoal[1] + '</h2> <span> (Sæt den lille viser først) </span>';
        }

        drawClockHandOnOverlay(6, false, 12, false);  // Draw hands pointing to 6 and 12, not filled, as a placeholder/reminder
    }

    applyQrCode(QrNumber) {
        let num = Number(QrNumber);
        var curGo = this.currentGoal;
        if (this.firstGuess && (num === curGo[0] || num + 12 === curGo[0] || (num === 12 && curGo[0] === 0))) {
            this.firstGuess = false;
            this.smallHandNum = QrNumber;
            drawClockHandOnOverlay(QrNumber, true, 12, false);
        } else if (!this.firstGuess && (num * 5 === curGo[1] || (curGo[1] === 0 && num === 12))) {
            drawClockHandOnOverlay(this.smallHandNum, true, QrNumber, true);
            let newDelta = 100;
            this.localMana += Number(newDelta);
            updateManaCounters(newDelta);
            document.getElementsByTagName('h2')[0].style.color = 'rgb(53, 219, 53)';
            
            setTimeout(() => {drawClockHandOnOverlay(6, false, 12, false)
                this.updateGoal();
                var curGo = this.currentGoal;
                showText = document.getElementById('showText');
                showText.innerHTML = '<h2>' + curGo[0] + ':' + curGo[1] + '</h2> <span> (Sæt den lille viser først) </span>';
                if (this.currentGoal[1] === 0 || this.currentGoal[1] === 5) {
                    showText.innerHTML = '<h2>' + this.currentGoal[0] + ':0' + this.currentGoal[1] + '</h2> <span> (Sæt den lille viser først) </span>';
                }
                this.firstGuess = true;
                document.getElementsByTagName('h2')[0].style.color = 'black';
            }, 5000);
        } else {
            showText = document.getElementById('showText');
            let oldText = showText.innerHTML;
            showText.innerHTML = '<h1> Prøv igen &#x1F642; </h1>';  // Smiley :-)
            setTimeout(() => showText.innerHTML = oldText, 3000);
        }
    }
}


class M3T1G1 extends NiffGameMode {  // Scan løs
    constructor() {
        super();
        this.gameMode = 'M1T1G1';
        this.lastScan = 0;
    }

    applyQrCode(QrNumber) {
        let newDelta = 0;
        if (this.lastScan === 0) {
            newDelta = QrNumber;
        } else {
            newDelta = Math.round(5/10000 * ((clockFaceCoor[QrNumber][0] - clockFaceCoor[this.lastScan][0]) * (clockFaceCoor[QrNumber][0] - clockFaceCoor[this.lastScan][0]) + (clockFaceCoor[QrNumber][1] - clockFaceCoor[this.lastScan][1]) * (clockFaceCoor[QrNumber][1] - clockFaceCoor[this.lastScan][1])));
        }
        this.localMana += Number(newDelta);
        updateManaCounters(newDelta);
        this.lastScan = QrNumber;
    }
}


class M3T1G2 extends NiffGameMode {  // Følg det viste mønster
    constructor() {
        super();
        this.gameMode = 'M3T1G2';
        
        let arrayLen = 20;
        let startNum = 0;
        let tempArray = Array.from({length: arrayLen},()=> startNum += Math.ceil(Math.random()*6) + 2);  // Avoid the same number twice and neighboring numbers by stepping 2 to 8 steps forward. The next function brings the numbers back into 1-12
        let mod12 = (number) => number%12 + 1; // Plus 1 to avoid 12%12 = 0
        this.goalArray = tempArray.map(mod12);
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        
        drawClockfaceOverlay(this.currentGoal, [0, 255, 0]);
    }

    async applyQrCode(QrNumber) {
        if (Number(QrNumber) === this.currentGoal) {
            let newDelta = 50;
            this.localMana += Number(newDelta);
            updateManaCounters(newDelta);
            this.updateGoal();
            drawClockfaceOverlay(this.currentGoal, [0, 255, 0]);
        } else {
            drawClockfaceOverlay(QrNumber, 'red');
            await timer(600);
            drawClockfaceOverlay(this.currentGoal, [0, 255, 0]);
        }
    }
}


class M3T1G3 extends NiffGameMode {  // Følg mønster efter tal
    constructor() {
        super();
        this.gameMode = 'M3T1G3';
        
        let arrayLen = 20;
        let startNum = 0;
        let tempArray = Array.from({length: arrayLen},()=> startNum += Math.ceil(Math.random()*6) + 2);  // Avoid the same number twice and neighboring numbers by stepping 2 to 8 steps forward. The next function brings the numbers back into 1-12
        let mod12 = (number) => number%12 + 1; // Plus 1 to avoid 12%12 = 0
        this.goalArray = tempArray.map(mod12);
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        
        showText = document.getElementById('showText');
        showText.hidden = false;
        showText.innerHTML = '<h2> Scan ' + this.currentGoal + '</h2>';
    }
    
    async applyQrCode(QrNumber) {
        showText = document.getElementById('showText');
        if (Number(QrNumber) === this.currentGoal) {
            let newDelta = 50;
            this.localMana += Number(newDelta);
            updateManaCounters(newDelta);
            this.updateGoal();
            showText.innerHTML = '<h2> Skan ' + this.currentGoal + '</h2>';
        } else {
            showText.innerHTML = '<h2> Det var ikke ' + this.currentGoal + '<br>  &#x1FAE4;</h2>';  // Smiley :-/
            await timer(1000);
            showText.innerHTML = '<h2> Skan ' + this.currentGoal + '</h2>';
        }
    }
}


class M3T2G1 extends NiffGameMode {  //  Gentag mønster
    constructor() {
        super();
        this.gameMode = 'M3T2G1';

        let arrayLen = 20;
        let startNum = 0;
        let tempArray = Array.from({length: arrayLen},()=> startNum += Math.ceil(Math.random()*6) + 2);  // Avoid the same number twice and neighboring numbers by stepping 2 to 8 steps forward. The next function brings the numbers back into 1-12
        let mod12 = (number) => number%12 + 1; // Plus 1 to avoid 12%12 = 0
        this.goalArray = tempArray.map(mod12);
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        
        showText = document.getElementById('showText');
        showText.hidden = false;
        showText.innerHTML = '<h3> Scan i samme rækkefølge </h3>';
        
        this.currentPatternPosition = 0;
        this.patternLenght = 2;

        document.getElementById('showPatternButton').hidden = false;
        document.getElementById('scanButton').hidden = true;
    }


    
    async applyQrCode(QrNumber) {
        let num = Number(QrNumber);
        if (num === this.goalArray[this.currentGoalNumber]) {
            if (this.currentPatternPosition < this.patternLenght - 1) {
                this.updateGoal();
                this.currentPatternPosition += 1;
                // TODO Show scanned number in Yellow for 2 seconds
            } else {
                let newDelta = 50 * this.patternLenght;
                this.localMana += Number(newDelta);
                updateManaCounters(newDelta);
                
                this.currentPatternPosition = 0;
                this.currentGoalNumber = 0;
                this.patternLenght += 1;
                document.getElementById('showPatternButton').hidden = false;
                document.getElementById('scanButton').hidden = true;
            }
        } else {
            showText = document.getElementById('showText');
            let oldText = showText.innerHTML;
            showText.innerHTML = '<h1> Ups! Start forfra &#x1FAE4; </h1>'; // Smiley :-/
            setTimeout(() => showText.innerHTML = oldText, 3000);
            await showError(num);  // Show scanned number in red for 2 seconds
            
            this.currentPatternPosition = 0;
            this.currentGoalNumber = 0;
            showPattern(this.patternLenght);
        }
    }
}

// Game modes above


// class M1T1G1 extends NiffGameMode {  // 
//     constructor() {
//         super();
//         this.gameMode = 'M1T1G1';

//     }

//     applyQrCode(QrNumber) {
//     }
// }

const gameModes = {
    'M1T1G1': M1T1G1,
    'M2T2G1': M2T2G1,
    'M3T1G1': M3T1G1,
    'M3T1G2': M3T1G2,
    'M3T1G3': M3T1G3,
    'M3T2G1': M3T2G1,
}


// Eventlisteners
document.getElementById('closeIntro1').addEventListener('click', closeIntro);
document.getElementById('closeIntro2').addEventListener('click', closeIntro);
document.getElementById('closeIntro3').addEventListener('click', closeIntro);
document.getElementById('closeIntro4').addEventListener('click', closeIntro);

document.getElementById('selectGameModeContainer').addEventListener('click', 
    function(event) { gameModeHasBeenClicked(event); }, true);

document.getElementById('scanButton').addEventListener('click', function() {
    document.getElementById('scanButton').hidden = true;
    document.getElementById('cancelScanButton').hidden = false;
    scanQRcode();
});
document.getElementById('showPatternButton').addEventListener('click', function() {
    document.getElementById('showPatternButton').hidden = true;
    showPattern(currentUser.patternLenght);
})
document.getElementById('cancelScanButton').addEventListener('click', stopScan);
document.getElementById('healButton').addEventListener('click', heal);
document.getElementById('stopHealButton').addEventListener('click', stopHealing);
// End of eventlisteners

console.clear();


function setUpFunction() {
    document.getElementById('page').style.height = window.innerHeight - 30 + 'px';
    document.getElementById('canvasQrShow').style.left = '' + -0.8 * winWidth / 2 + 'px';
    document.getElementById('canvasClockface').style.left = '' + -0.8 * winWidth / 2 + 'px';
    document.getElementById('canvasClockfaceOverlay').style.left = '' + -0.8 * winWidth / 2 + 'px';
}


function closeIntro() {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('closeIntro4').style.display = 'none';
    document.getElementById('selectGameModeContainer').hidden = false;
}


function scanQRcode() {
    html5Qrcode.start({facingMode: "environment"}, config, (decodedText, decodedResult) => {
        console.log('We have got ' + decodedText);
        stopQrReading();
        useQRcode(decodedText);
    }, (errorMessage) => {
        console.log('Camera says ' + errorMessage);
    }).catch((err) => {
        console.log('Camera failed to start');
    });
}

function stopScan() {
    if (html5Qrcode.getState() === 2) {  // 1 is not-scanning, 2 is scanning
        document.getElementById('scanButton').hidden = false;
        document.getElementById('cancelScanButton').hidden = true;
        stopQrReading();
    }
}


let healingDrainTimer = '';

function heal() {
    if (9 < currentUser.localMana || 9 < currentUser.globalMana) {
        stopStopHealingTimeOut = setTimeout(stopHealing, 5000);
        document.getElementById('canvasQrShow').hidden = false;
        document.getElementById('healButton').hidden = true;
        document.getElementById('stopHealButton').hidden = false;
        healingDrainTimer = setInterval(whileHealing, 1000);
    } else {  // If there is no mana, the QR code should not be shown
        whileHealing();
    }
}


function whileHealing() {
    if (10 < currentUser.localMana) {
        let newDelta = 10;
        currentUser.localMana -= Number(newDelta);
        updateManaCounters(newDelta); 
    } else if (9 < currentUser.globalMana) {
        currentUser.globalMana -= 10;
        updateManaCounters();
    } else {
        stopHealing();
        showText = document.getElementById('showText');
        let oldText = showText.innerHTML;
        showText.hidden = false;
        showText.innerHTML = '<h1> Beklager, der er ikke mere mana <br><br> Skaf ny mana, før du kan heale andre <br> <br> (Skan QR koden \'0\') &#x1F642; </h1>';  // Smiley :-)
        setTimeout(() => {showText.innerHTML = oldText; showText.hidden = true}, 3000);
    }
}

function stopHealing() {
    document.getElementById('canvasQrShow').hidden = true;
    clearInterval(healingDrainTimer);
    clearInterval(stopStopHealingTimeOut);
    document.getElementById('stopHealButton').hidden = true;
    document.getElementById('healButton').hidden = false;
}


async function updateManaCounters(newMana) {
    if (newMana) {
        let showAddingManaP = document.getElementById('showAddingMana');
        showAddingManaP.innerText = '+' + newMana;
        showAddingManaP.classList.add('triggerAnimation');
        await timer(1600);
        showAddingManaP.classList.remove('triggerAnimation');
        showAddingManaP.innerText = '';
    }
    document.getElementById('localManaCounter').innerHTML = 
    '<span>Nyhøstet Mana</span> <span class="score">' + currentUser.localMana + '</span>';
    document.getElementById('globalManaCounter').innerHTML = 
    '<span>Samlet Mana</span> <span class="score">' + currentUser.globalMana + '</span>';
}


let attackTimer = setInterval(attackChance, 10000);

let whileAttackedTimer = '';                

function attackChance() {
    if (isVictim === 0 && Math.random() < 0.001) {
        isVictim = 5;  // Requires 5 healing to be well. A healer can do it in one go. Scanning "0" five times works too
        document.getElementById('page').style.background = 'rgba(255, 0, 0, .36)';
        messageDiv.hidden = false;
        messageDiv.innerHTML = '<p>Du er blevet angrebet! <br> Skynd dig at blive healet ved at finde Healeren eller scanne 0 flere gange</p>'
        whileAttackedTimer = setInterval(whileAttacked, 1000);
    }
}


function whileAttacked() {
    currentUser.localMana -= 1;
    updateManaCounters(currentUser.localMana);
    
    if (isVictim === 0) {
        clearInterval(whileAttackedTimer);
    }
}


function gameModeHasBeenClicked(event) {
    gameMode = event.target.id; // Id in the format M3T1G1 for Movement level 3, Thinking level 1 and Game number 1
    console.log(gameMode);
    
    if (gameMode !== '' && gameMode !== 'selectGameModeContainer') {
        // Adjust layout to game mode
        document.getElementById('selectGameModeContainer').hidden = true;
        document.getElementById('globalManaCounter').style.visibility = 'visible';
        document.getElementById('localManaCounter').style.visibility = 'visible';
        document.getElementById('QrContainer').hidden = false;
        document.getElementById('navigationContainer').style.visibility = 'visible';

        let gameModeClass = gameModes[gameMode];
        currentUser = new gameModeClass();
        
        updateManaCounters();
    }
}


async function showPattern(patternLenght){
    drawClockface();
    await timer(500);
    for (var i = 0; i < patternLenght; i++) {
        drawClockfaceOverlay(currentUser.goalArray[i], [0, 255, 0]);
        await timer(1000);
    }
    document.getElementById("canvasClockfaceOverlay").hidden = true
    document.getElementById('showPatternButton').hidden = true;
    document.getElementById('scanButton').hidden = false;
}


async function showError(number) {
    drawClockface();
    await timer(500);
    drawClockfaceOverlay(number, [255, 0, 0]);
    await timer(500);
    drawClockfaceOverlay(number, [255, 255, 255]);
    await timer(500);
    drawClockfaceOverlay(number, [255, 0, 0]);
    await timer(500);
    drawClockfaceOverlay(number, [255, 255, 255]);
    await timer(500);
    document.getElementById("canvasClockfaceOverlay").hidden = true
}


function useQRcode(QrNumber) {
    if (-1 < QrNumber && QrNumber < 13) {
        currentUser.applyQrCode(QrNumber);
    } else if (isVictim !== 0 && -1 < QrNumber && QrNumber < 13) {
        messageDiv.innerHTML = '<p> Du er skadet og skal heales før du kan andet <br> Find en Healer eller scan 0 flere gange </p>'

    } else if (isVictim !== 0  && QrNumber === 'center') {
        isVictim -= 1;
        if (isVictim < 0.00001) {
            isVictim = 0;
            messageDiv.innerHTML = '';
            messageDiv.hidden = true;
        }
        document.getElementById('page').style.background = 'rgba(255, 0, 0, '+ isVictim / 14 + ')';
        messageDiv.innerHTML = '<p> ' + healMsgs[isVictim] + ' <br> Scan 0 igen</p>' 

    } else if (isVictim !== 0  && QrNumber === 'Thy shalst be healed') {
            isVictim = 0;
            document.getElementById('page').style.background = 'white';
            messageDiv.innerHTML = '';
            messageDiv.hidden = true;

    } else {
        messageDiv.innerHTML = '<p> Denne QR kode er dårlig magi! <br> Scan en anden </p>';
        messageDiv.hidden = false;

        // Then remove message after 2 sec
        msgTimeOut = setTimeout(function () {
            messageDiv.innerHTML = '';
            messageDiv.hidden = true;
        }, 3000);
    }
}


function stopQrReading() {
    html5Qrcode.stop().then((ignore) => {
        document.getElementById('scanButton').hidden = false;
        document.getElementById('cancelScanButton').hidden = true;
        console.log('QR scanning stopped');
    }).catch((err) => {
        console.log('QR scanning did not stop for some reason');
    });
}

// DRAWING BELOW

// Draw on cameraOverlay
function drawOnCameraOverlay() {  // TODO: Draw on qr-canvas instead? Gets rid of positioning problems. Have to check if camera is active, but whatevs...
    let cameraOverlay = document.getElementById('canvasCameraOverlay');
    cameraOverlay.hidden = false;
    let drawArea = cameraOverlay.getContext('2d');
    cameraOverlay.width = 0.8 * winWidth;  
    cameraOverlay.height = 0.8 * winHeight;
    drawArea.scale(zoomFactor, zoomFactor);

    drawArea.moveTo(winWidth / 2 + 50, winHeight / 2);
    drawArea.arc(winWidth / 2, winHeight / 2, 50, 0, 2*pi);  // Draw disk-monster... Camera position needst to be changed to absolute after camera is started.
    drawArea.fill();
}


// Draw clockface    TODO: Make colour gradients instead of arcs
function drawClockface() {
    // Find and show Clockface
    let canvasClockface = document.getElementById("canvasClockface");
    canvasClockface.hidden = false;
    let drawArea = canvasClockface.getContext("2d");
    canvasClockface.width = 0.8 * winWidth;
    canvasClockface.height = 0.8 * winHeight;
    drawArea.scale(zoomFactor, zoomFactor);

    let r = 10;
    let offset = 3;
    drawArea.strokeStyle = "blue";
    drawArea.beginPath();
    for (const [i, coor] of Object.entries(clockFaceCoor)) {
        let xc = Math.floor(coor[0]);
        let yc = Math.floor(coor[1]);  // Minus 130 to flip coordinate system to programmer style with y-axis downwards
        drawArea.moveTo(xc + r, yc);  // Add radius to avoid drawing a horizontal radius
        drawArea.arc(xc, yc, r, 0, 2*pi);
        drawArea.stroke();
        if (9 < Number(i)) {offset = 7}
        drawArea.fillText(i, xc - offset, yc + 3);
    }
}

function drawClockfaceOverlay(number, rgb) {
    drawClockface();
    // let red = 0;
    // let green = 255;
    // if (colour === 'red') {
    //     red = 255;
    //     green = 0;
    // }
    // Find and show ClockfaceOverlay
    let canvasClockfaceOverlay = document.getElementById("canvasClockfaceOverlay");
    canvasClockfaceOverlay.hidden = false;
    let drawArea = canvasClockfaceOverlay.getContext("2d");
    canvasClockfaceOverlay.width = 0.8 * winWidth;
    canvasClockfaceOverlay.height = 0.8 * winHeight;
    drawArea.scale(zoomFactor, zoomFactor);

    let r = 10;
    let offset = 3;
    if (number) {
        let xc = Math.floor(clockFaceCoor[number][0]);
        let yc = Math.floor(clockFaceCoor[number][1]);
        const radgrad3 = drawArea.createRadialGradient(xc - 4, yc - 4, 1, xc, yc, r); // Red sphere
        radgrad3.addColorStop(0, 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ',.3)');
        radgrad3.addColorStop(0.5, 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')');
        radgrad3.addColorStop(0.9, 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')');
        radgrad3.addColorStop(1, 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', 0)');
        drawArea.fillStyle = radgrad3;
        drawArea.fillRect(xc-r, yc -r, 2 * r, 2 * r)

        // drawArea.moveTo(xc + r, yc);
        // drawArea.arc(xc, yc, r, 0, 2*pi);
        // drawArea.fillStyle = "red";
        // drawArea.fill();
        if (9 < Number(number)) {offset = 7}
        drawArea.fillStyle = "black";
        drawArea.fillText(number, xc - offset, yc + 3);
    }
}


function drawClockHandOnOverlay(smallHandNum, sFill, bigHandNum, bFill) {
    drawClockface();
    // Find and show ClockfaceOverlay
    let canvasClockfaceOverlay = document.getElementById("canvasClockfaceOverlay");
    canvasClockfaceOverlay.hidden = false;
    let drawArea = canvasClockfaceOverlay.getContext("2d");
    canvasClockfaceOverlay.width = 0.8 * winWidth;
    canvasClockfaceOverlay.height = 0.8 * winHeight;
    drawArea.scale(zoomFactor, zoomFactor);

    for (let i = 0; i < 2; i++) {
        if (i === 0) {
            handSize = 0.5;
            number = smallHandNum;
        } else {
            handSize = 1;
            number = bigHandNum;
        }

        let xNum = clockFaceCoor[number][0];
        let yNum = clockFaceCoor[number][1];
        let xc = clockFaceCoor[0][0];
        let yc = clockFaceCoor[0][1];
        let handVec = vecAB([xc, yc], [xNum, yNum]);
        let handVecHatNorm = unitVector(hatVector(handVec));
        let xt = handVecHatNorm[0];
        let yt = handVecHatNorm[1];
    
        // Transform coordinates back into the unit circle, resize clock hand and transform back
        let xh = ((xNum  - 150) / 130 * handSize) * 130 + 150; 
        let yh = ((yNum - 150) / 130 * handSize) * 130 + 150;
    
        drawArea.beginPath();
        drawArea.moveTo(xc + 5 * xt, yc + 5 * yt);
        drawArea.lineTo(xh, yh);
        drawArea.lineTo(xc - 5 * xt, yc - 5 * yt);
        if ((i === 0 && sFill) || (i === 1 && bFill)) {
            drawArea.fill();
        } else {
            drawArea.closePath();
            drawArea.stroke();
        }
    }
}


class NiffPuzzle {
    constructor() {
        this.pieces = [];
        this.usedAnchors = [1];

        this.generatePieces();
    }
    

    generatePieces() {
        let lastAnchor;
        let nextAnchor;
        for (var n = 1; n < 6; n++) {
            lastAnchor = this.usedAnchors[this.usedAnchors.length - 1];
            nextAnchor = lastAnchor + Math.floor(Math.random() * 3) + 1;
            const currentPuzzlePiece = new NiffPuzzlePiece(n, this, lastAnchor, nextAnchor);
            this.pieces.push(currentPuzzlePiece);
        }
    }
}

class NiffPuzzlePiece {
    constructor(pieceID, puzzle, lastAnchor, nextAnchor) {
        this.pieceID = pieceID;
        this.puzzle = puzzle;
        this.anchors = [lastAnchor, nextAnchor];
        this.possibleNewAnchors = [];
        
        this.puzzle.usedAnchors.push(nextAnchor);

        this.anchors.push(nextAnchor, lastAnchor);
    }
}

class NiffArc {
    constructor(cx, cy, R, v1, v2, A, B, Ma, MaL, MaR) {
        this.cx = cx; // Center x coordinate
        this.cy = cy; // Center y coordinate
        this.R = R; // Radius of the arc
        this.v1 = v1; // First angle with x-axis
        this.v2 = v2; // Second angle with x-axis
        this.A = A; // Coordinates for the first endpoint of the arc
        this.B = B; // Coordinates for the second endpoint of the arc
        this.Ma = Ma;  // Coordinates for center of arc
        this.MaL = MaL; // Coordinates for the center of the left part of the arc
        this.MaR = MaR; // Coordinates for the center of the right part of the arc
    }
}

function drawPuzzle(puzzle) {
    drawClockface();
    let canvasClockfaceOverlay = document.getElementById("canvasClockfaceOverlay");
    canvasClockfaceOverlay.hidden = false;
    let drawArea = canvasClockfaceOverlay.getContext("2d");
    canvasClockfaceOverlay.width = 0.8 * winWidth;
    canvasClockfaceOverlay.height = 0.8 * winHeight;
    drawArea.scale(zoomFactor, zoomFactor);
    
    drawArea.beginPath();

    for (var puzzlePiece of puzzle.pieces) {
        for (var i = 0; i < puzzlePiece.anchors.length; i += 2) {
            let arc = getCenterAndAngles(puzzlePiece.anchors[i], puzzlePiece.anchors[i + 1], 130);
            drawArea.arc(arc.cx, arc.cy, arc.R, arc.v1, arc.v2);
        }
    }
    
    drawArea.stroke();

    // let arc = getCenterAndAngles(clockFaceCoor[A], clockFaceCoor[B], 130);
    // drawArea.arc(arc.cx, arc.cy, arc.R, arc.v1, arc.v2);
    // for (var n = -15; n < 21; n+=5) {
    //     // drawArcOnOverlay(arc.cx, arc.cy, arc.R, arc.v1, arc.v2, drawArea)    
    //     drawArea.arc(arc.cx, arc.cy, arc.R, arc.v1, arc.v2);
    // }

    // drawArea.fill();
}


function drawArcOnOverlay(cx, cy, R, v1, v2, drawArea) {
    drawClockface();
    // Find and show ClockfaceOverlay
    // let canvasClockfaceOverlay = document.getElementById("canvasClockfaceOverlay");
    // canvasClockfaceOverlay.hidden = false;
    // let drawArea = canvasClockfaceOverlay.getContext("2d");
    // canvasClockfaceOverlay.width = 0.8 * winWidth;
    // canvasClockfaceOverlay.height = 0.8 * winHeight;
    // drawArea.scale(zoomFactor, zoomFactor);

    drawArea.beginPath();
    drawArea.arc(cx, cy, R, v1, v2);
    drawArea.stroke();
}


function getCenterAndAngles(A, B, R) {  // Return the center and the two angles necessarty for drawing an arc defined by its endpoints A[xa, ya] and B[xb, yb] and radius R
    if (typeof(A) === "number") {
        A = clockFaceCoor[A];  // Bad practice to allow two input formats, I know, I know, but it saves a lot of lines and makes testing way easier ...
        B = clockFaceCoor[B];
    }
    let distAB = dist(A, B);
    if (R < distAB / 2) {R = distAB / 2 + 1; console.log('Radius too small. R set to ' + R)};
    let distABtoC = Math.sqrt(R * R - (distAB/2) * (distAB/2));
    let AB = vecAB(A, B);
    let hatAB = hatVector(AB);
    let M = midPoint(A, B);  // Also the vector from (0, 0) to M
    let C = subtractVector(M, scalarMult(unitVector(hatAB), distABtoC));
    let CA = vecAB(C, A);
    let CB = vecAB(C, B);
    let i = [1, 0];  // Unit vector along x-axis
    angleACO = Math.acos(dotProd(CA, i)/(vectorLength(CA)*vectorLength(i))); // The angle between the x-axis and the first vector
    angleBCO = Math.acos(dotProd(CB, i)/(vectorLength(CB)*vectorLength(i)));  // The angle between the x-axis and the second vector
    if (A[1] < C[1]) {
        angleACO = 2 * pi - angleACO;
    } 
    if (B[1] < C[1]) {
        angleBCO = 2 * pi - angleBCO;
    }

    let angleSpan = angleACO - angleBCO;
    let Ma = [C[0] + R * Math.cos(angleSpan/2 + angleBCO), C[1] + R * Math.sin(angleSpan/2 + angleBCO)];
    let MaL = [C[0] + R * Math.cos(3 * angleSpan/4 + angleBCO), C[1] + R * Math.sin(3 * angleSpan/4 + angleBCO)];
    let MaR = [C[0] + R * Math.cos(angleSpan/4 + angleBCO), C[1] + R * Math.sin(angleSpan/4 + angleBCO)];

    let arc = new NiffArc(C[0], C[1], R, angleBCO, angleACO, A, B, Ma, MaL, MaR);
    
    return arc;
}


// Functions for vector manipulation
function dist(A, B) {  // Returns the distance between two points A[xa, ya] and B[xb, yb]
    return Math.sqrt((A[0] - B[0])*(A[0] - B[0]) + (A[1] - B[1])*(A[1] - B[1]));
}


function midPoint(A, B) {  // Returns the midpoint between point A[xa, ya] and B[xb, yb]
    return [(A[0] + B[0])/2, (A[1] + B[1])/2];
}


function vecAB(A, B) {  // Returns the vector from point A[xa, ya] to point B[xb, yb]
    return [B[0] - A[0], B[1] - A[1]];
}

function subtractVector(B, A) {  // Return vector A[xa, ya] subtracted from B[xb, yb]
    return [B[0] - A[0], B[1] - A[1]];
}


function hatVector(A) {  // Return a vector orthogonal on vector A[x,y] rotated 90 degrees
    return [-A[1], A[0]];
}


function vectorLength(A) {
    return Math.sqrt(A[0] * A[0] + A[1] * A[1]);
}

function unitVector(A) {  // Return a unitvector in the direction of vector A[x,y]
    lenA = vectorLength(A);
    return [A[0]/lenA, A[1]/lenA];
}


function scalarMult(A, k) { // Returns a vector A[x, y] multiplied with a scalar k
    return [A[0] * k, A[1] * k];
}


function dotProd(A, B) {  // Returns the dot product between vector A[xa, ya] and B[xb, yb]
    return A[0] * B[0] + A[1] * B[1];
}


// DRAWING ABOVE

// QR-code generator
function generateQRcode(text) {
    let responseQRcode = new QRCodeStyling({
        width: winWidth,
        height: winHeight,
        type: "svg",
        data: text,
        image: "qr-codes/fairy.png",
        dotsOptions: {
            color: "000",
            type: "squrare"
        },
        imageOptions:{
            crossOrigin: "anonymous",
            margin: 20
        }
    });

    return responseQRcode;
}



// let result = html5Qrcode.start({facingMode: "environment"}, config, qrCodeHasBeenRead);

// // QR-code reader
// function grabQRcode() {
//     const html5Qrcode = new Html5Qrcode("reader");
//     const config = {fps: 10, qrbox: {width: 300, height: 300}};
//     const qrCodeHasBeenRead = (decodedText, decodedResult) => {
//         console.log(`Code matched = ${decodedText}`, decodedResult);
//         let readerDiv = document.getElementById('readerDiv');
//         let content = document.createTextNode(decodedText);
//         readerDiv.appendChild(content);

//         html5Qrcode.stop().then((ignore) => {
//             console.log('QR scanning stopped');
//         }).catch((err) => {
//             console.log('QR scanning did not stop for some reason');
//         })
//     }

//     let result = html5Qrcode.start({facingMode: "environment"}, config, qrCodeHasBeenRead);
    
//     return result;
// }


// function onScanSuccess(decodedText, decodedResult) {
//     // handle the scanned code as you like, for example:
//     console.log(`Code matched = ${decodedText}`, decodedResult);
//     let outputDiv = document.getElementById('output');
//     let content = document.createTextNode(decodedText);
//     outputDiv.appendChild(content);
// }

// function onScanFailure(error) {
//     // handle scan failure, usually better to ignore and keep scanning.
//     // for example:
//     console.warn(`Code scan error = ${error}`);
// }


// document.getElementById('firstButton').addEventListener('click', function() {
//     let html5QrcodeScanner = new Html5QrcodeScanner(
//         "reader", { fps: 10, qrbox: {width: 250, height: 250} }, /* verbose= */ false);
//     html5QrcodeScanner.render(onScanSuccess, onScanFailure);
// });
