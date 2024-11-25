const pi = Math.PI;
const kv3h = Math.sqrt(3)/2;
const timer = ms => new Promise(res => setTimeout(res, ms));
const winWidth = window.screen.width;
const sizeFactor = 0.64;
const zoomFactor = sizeFactor * winWidth / 300;
const winHeight = winWidth;  // These two variables are currently used together to make square displays
const config = {fps: 10, qrbox: {width: sizeFactor * winWidth, height: sizeFactor * winHeight}};
// Initialize QR-code reader
const html5Qrcode = new Html5Qrcode("reader");


let gameMode = '';
let gameState = 'chooseCoordinator';
let participantList = [];
let globalMana = 500;  // Start with some mana to heal attacked players
let localMana = 0;
let amulet = false;
let coordinator = false;
let currentUser = '';
let attackProbability = 0.001;
let isVictim = 0;  // Change to 5 if player is attacked and needs healing. Is healed fully by Healer, but need a few scans of '0' to heal alone

let messageDiv = document.getElementById('messageDiv');
let showText = document.getElementById('showText');
let healMsgs = [
    '',  // No message when healing has occured
    'Og ... sidste gang',
    'Lidt mere',
    'Det hjælper',
    'Det var bedre!',
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
        this.playerList = [];
        this.healerParticipates = false;
    }
}


class NiffUser extends NiffGame {  // Maybe execissive, but opens for change of gamemode during a game - OR NOT? May need a decoupling like the puzzle class
    constructor(gameMode, goalArray) {
        super();
        this.localMana = 0;
        this.amulet = false;
        this.coordinator = false;
        this.ID = Math.floor(Math.random() * 1000000);
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
        document.getElementById('canvasQrShow').style.display = 'none';
        // ToDo: Add explaning text?
        setActionButton('Skan', 'hidden');
        // document.getElementById('healButton').hidden = false;
        // document.getElementById('uglyHackSpacer').hidden = false
        clearInterval(attackTimer);  // Makes sure the Healer is not attacked

        setActionButton('Heal', 'active');
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
        // let showText;
        this.goalArray = [];
        for (var i = 0; i < arrayLen; i++) {
            let hour = Math.floor(Math.random() * 24);
            let min = Math.floor(Math.random() * 12) * 5;
            this.goalArray.push([hour, min]);
        }
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        
        showText.hidden = false;
        showText.innerHTML = '<h2>' + this.currentGoal[0] + ':' + this.currentGoal[1] + '</h2> <span> (Sæt den lille viser først) </span>';
        if (this.currentGoal[1] === 0 || this.currentGoal[1] === 5) {
            showText.innerHTML = '<h2>' + this.currentGoal[0] + ':0' + this.currentGoal[1] + '</h2> <span> (Sæt den lille viser først) </span>';
        }

        document.getElementById('canvasStack').style.display = 'block';

        drawClockHandOnOverlay(6, false, 12, false);  // Draw hands pointing to 6 and 12, not filled, as a placeholder/reminder

        setActionButton('Skan', 'active');
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
            setActionButton('Skan', 'inactive');  // Scanning the last digit multiple times shouldn't be possible
            
            setTimeout(() => {drawClockHandOnOverlay(6, false, 12, false)
                this.updateGoal();
                var curGo = this.currentGoal;
                showText.innerHTML = '<h2>' + curGo[0] + ':' + curGo[1] + '</h2> <span> (Sæt den lille viser først) </span>';
                if (this.currentGoal[1] === 0 || this.currentGoal[1] === 5) {
                    showText.innerHTML = '<h2>' + this.currentGoal[0] + ':0' + this.currentGoal[1] + '</h2> <span> (Sæt den lille viser først) </span>';
                }
                this.firstGuess = true;
                document.getElementsByTagName('h2')[0].style.color = 'black';
                setActionButton('Skan', 'active');
            }, 3000);
        } else {
            let oldText = showText.innerHTML;
            showText.innerHTML = '<h1> Prøv igen &#x1F642; </h1>';  // Smiley :-)
            setTimeout(() => showText.innerHTML = oldText, 3000);
        }
    }
}


class M3T1G1 extends NiffGameMode {  // Scan løs
    constructor() {
        super();
        this.gameMode = 'M3T1G1';
        this.lastScan = 0;

        setActionButton('Skan', 'active');
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

        document.getElementById('canvasStack').style.display = 'block';
        drawClockfaceOverlay(this.currentGoal, [0, 255, 0]);

        setActionButton('Skan', 'active');
    }

    async applyQrCode(QrNumber) {
        if (Number(QrNumber) === this.currentGoal) {
            let newDelta = 50;
            this.localMana += Number(newDelta);
            updateManaCounters(newDelta);
            this.updateGoal();
            drawClockfaceOverlay(this.currentGoal, [0, 255, 0]);
        } else {
            showError(QrNumber);
            await timer(1600);
            currentUser.localMana -= 10;
            updateManaCounters(-10);
            await timer(300);
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
        
        showText.hidden = false;
        showText.innerHTML = '<h2> Scan ' + this.currentGoal + '</h2>';

        setActionButton('Skan', 'active');
    }
    
    async applyQrCode(QrNumber) {
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


class M3T2G1 extends NiffGameMode {  //  Gentag mønster  TODO: Debug when buttons are shown and change first ShowPatternButton to green, then yellow
    constructor() {
        super();
        this.gameMode = 'M3T2G1';
        this.showedPattern = false;

        let arrayLen = 20;
        let startNum = 0;
        let tempArray = Array.from({length: arrayLen},()=> startNum += Math.ceil(Math.random()*6) + 2);  // Avoid the same number twice and neighboring numbers by stepping 2 to 8 steps forward. The next function brings the numbers back into 1-12
        let mod12 = (number) => number%12 + 1; // Plus 1 to avoid 12%12 = 0
        this.goalArray = tempArray.map(mod12);
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        
        showText.hidden = false;
        showText.innerHTML = '<h3> Scan i samme rækkefølge </h3> <span> (Tryk på <em>Vis mønster</em> knappen for at se mønsteret) </span>';
        
        this.currentPatternPosition = 0;
        this.patternLenght = 2;

        setActionButton('Skan', 'inactive');
        setInfoButton('Vis Mønster', 'active');
    }


    
    async applyQrCode(QrNumber) {
        let num = Number(QrNumber);
        if (num === this.goalArray[this.currentGoalNumber]) {
            drawClockfaceOverlay(currentUser.goalArray[this.currentPatternPosition], [255, 255, 0]);
            await timer(1000);
            document.getElementById("canvasClockfaceOverlay").hidden = true;
            if (this.currentPatternPosition < this.patternLenght - 1) {
                this.updateGoal();
                this.currentPatternPosition += 1;
            } else {
                let newDelta = 50 * this.patternLenght;
                this.localMana += Number(newDelta);
                updateManaCounters(newDelta);
                
                this.currentPatternPosition = 0;
                this.currentGoalNumber = 0;
                this.patternLenght += 1;
                this.showedPattern = false;
                setInfoButton('Vis Mønster', 'active');
                document.getElementById('showPatternButton').hidden = false;
                setActionButton('Skan', 'hidden');
            }
        } else {
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
    'M1T1G1': M1T1G1,  // Healer
    'M2T2G1': M2T2G1,  // Indstil visere
    //'M2T2G2': M2T2G2,  // Jæger
    'M3T1G1': M3T1G1,  // Skan løs
    'M3T1G2': M3T1G2,  // Følg det viste mønster
    'M3T1G3': M3T1G3,  // Følg mønster efter tal
    'M3T2G1': M3T2G1,  // Gentag mønster
}


// Eventlisteners

document.getElementById('chooseGameMode').addEventListener('click', 
    function(event) { chooseGameModeHasBeenClicked(event); }, true);  // Normal/coordinator

document.getElementById('selectRoleContainer').addEventListener('click', 
    function(event) { roleHasBeenClicked(event); }, true);

document.getElementById('actionButton').addEventListener('click', actionButtonHasBeenClicked);

document.getElementById('infoButton').addEventListener('click', infoButtonHasBeenClicked);

document.getElementById('advanceGameStateButton').addEventListener('click', 
    advanceGameStateButtonHasBeenClicked);

// End of eventlisteners

console.clear();


function actionButtonHasBeenClicked() {
    let actionButton = document.getElementById('actionButton'); 
    if (!actionButton.classList.contains('inactiveButton')) { // ! not
        switch(actionButton.textContent) {
            case 'Skan':
                setActionButton('Stop Skan', 'obs');
                scanQRcode();
                break;
            case 'Stop Skan':
                setActionButton('Skan', 'active');
                stopScan();
                break;
            case 'Heal':
                setActionButton('Stop Healing', 'obs');
                heal();
                break;
            case 'Stop Healing':
                setActionButton('Heal', 'active');
                break;
        }
    }
}


function infoButtonHasBeenClicked() {
    let infoButton = document.getElementById('infoButton');
    if (!infoButton.classList.contains('inactiveButton')) {  // ! not
        switch(infoButton.textContent) {
            case 'Vis Mønster':
                setInfoButton('Vis Mønster', 'inactive');
                showPattern(currentUser.patternLenght);
        }
    }
}
   

function advanceGameStateButtonHasBeenClicked(event) {
    let advanceGameStateButton = document.getElementById('advanceGameStateButton');
    if (coordinator && gameState === 'shareStartInfo') {  // ToDo: Fix this
        stopScan();
        
        setActionButton('Skan', 'hidden');
        setAdvanceGameStateButton('Videre', 'active');
        
        let participantComposition = JSON.stringify(participantList);
        generateQRcode(participantComposition).append(document.getElementById("canvasQrShow"));

        showText.innerHTML = '<h2> Lad de andre deltagere skanne denne QR kode </h2> <br> Og tryk så på <em>Videre</em>';

        gameState = 'towerOfPower';
    } else if (coordinator && gameState === 'towerOfPower') {
        canvasQrShow = document.getElementById("canvasQrShow");
        canvasQrShow.removeChild(canvasQrShow.firstChild);
        
        showText.innerHTML = '';

        setAdvanceGameStateButton('Videre', 'hidden');
        firstTradeInterval();
    } else if (!coordinator && gameState === 'shareStartInfo') {
        canvasQrShow = document.getElementById("canvasQrShow");
        canvasQrShow.removeChild(canvasQrShow.firstChild);

        showText.innerHTML = '<h2> Scan tovholderens QR kode </h2>';
        
        setActionButton('Skan', 'active');
        setAdvanceGameStateButton('Videre', 'hidden');
        gameState = 'towerOfPower';
        
    } else if (gameState === 'firstTradeInterval') {
        location.hash = '#gameMode';
        setAdvanceGameStateButton('Videre', 'hidden');
        beginRound();

    } else {
        console.log('AdvanceGameStateButton clicked outside gameflow')
    }
}


function firstTradeInterval() {
    gameState = 'firstTradeInterval';
    location.hash = '#firstTradeInterval';

    setAdvanceGameStateButton('Videre', 'active');
    setActionButton('Skan', 'hidden');
    textNode = document.getElementById('firstTradeInfo');
    let paragraph = document.createElement("p");
    let textContent = document.createTextNode('I de verdener den magiske cirkel åbner portaler til, ' + 
        'kan der være magiske væsener der angriber dig\n');
        paragraph.appendChild(textContent);
        textNode.appendChild(paragraph);
        
    if (!participantList.includes('M2T2G2')) {  // Ingen jæger
        if (participantList.includes('M1T1G1')) {  // Healer
            attackProbability *= 10;
            let paragraph = document.createElement("p");
            let textContent = document.createTextNode('Der er en healer på holdet. Find dem og ' +
                'skan deres tavle, hvis du bliver angrebet\n');
            paragraph.appendChild(textContent);
            textNode.appendChild(paragraph);
        } else {
            let paragraph = document.createElement("p");
            let textContent = document.createTextNode('Hvis du bliver angrebet, kan du blive healet ved at ' +
                'skanne 0 flere gange\n');
                paragraph.appendChild(textContent);
                textNode.appendChild(paragraph);
        }
        let paragraph = document.createElement("p");
        let textContent = document.createTextNode('Hvis du ikke kan lide tanken om at blive angrebet, ' +
            'kan du bruge lidt mana på at købe en amulet der beskytter mod magiske væsener');
            paragraph.appendChild(textContent);
            textNode.appendChild(paragraph);
            document.getElementById('buyAmuletButton').hidden = false;  // ToDo: Implement action here
    } else {
        amulet = true;
        let hunter1 = 'en jæger';
        let hunter2 = 'en';
        if (1 < participantList.filter(elem => elem === 'M2T2G2').length) {
            hunter1 = 'jægere';
            hunter2 = 'ne';
        }
        let textContent = document.createTextNode(', men da der er ' + hunter1 + ' på holdet, vil de ' +
            'magiske væsener angribe jæger' + hunter2 + ' i stedet for dig. \n');
        paragraph.appendChild(textContent);
        textNode.appendChild(paragraph);

        let paragraph1 = document.createElement("p");
        let textContent1 = document.createTextNode('En amulet er derfor unødvendig');
        paragraph1.appendChild(textContent1);
        textNode.appendChild(paragraph1);
    }
}


function setUpFunction() {
    document.getElementById('page').style.height = window.innerHeight - 30 + 'px';
    document.getElementById('gameMode').style.height = window.innerHeight - 90 + 'px'; 
    document.getElementById('canvasQrShow').style.left = '' + -sizeFactor * winWidth / 2 + 'px';
    document.getElementById('canvasClockface').style.left = '' + -sizeFactor * winWidth / 2 + 'px';
    document.getElementById('canvasClockfaceOverlay').style.left = '' + -sizeFactor * winWidth / 2 + 'px';

    location.hash = '#intro';
}


// ToDO: Change the non-functioning config parameter or incorporate the following line:
// document.getElementsByTagName('video')[0].style.width = "" + sizeFactor * winWidth + "px";


function scanQRcode() {
    html5Qrcode.start({facingMode: "environment"}, config, (decodedText, decodedResult) => {
        console.log('We have got ' + decodedText);
        stopQrReading();
        useQRcode(decodedText);
    }, (errorMessage) => {
        console.log('Camera says ' + errorMessage);
        if (document.getElementsByTagName('video')[0]) {
            document.getElementsByTagName('video')[0].style.width = "" + sizeFactor * winWidth + "px";  // Ugly hack!
        }
    }).catch((err) => {
        console.log('Camera failed to start');
    });
}

function stopScan() {
    if (html5Qrcode.getState() === 2) {  // 1 is not-scanning, 2 is scanning
        setActionButton('Skan', 'hidden');
        // document.getElementById('cancelScanButton').hidden = true;
        stopQrReading();
    }
}

function setActionButton(text, state) {
    let actionButton = document.getElementById('actionButton');
    if (text != '') {
        actionButton.textContent = text;
    }

    toggleButton(actionButton, state);
}


function setInfoButton(text, state) {
    let infoButton = document.getElementById('infoButton');
    if (text != '') {
        infoButton.textContent = text;
    }

    toggleButton(infoButton, state);
}


function setAdvanceGameStateButton(text, state) {
    let advanceGameStateButton = document.getElementById('advanceGameStateButton');
    if (text != '') {
        advanceGameStateButton.textContent = text;
    }

    toggleButton(advanceGameStateButton, state);
}


function toggleButton(button, state) {
    button.removeAttribute('class');

    if (state === 'active') {
        button.hidden = false;
        button.classList.add('activeButton');
        button.removeAttribute('disabled');
        // button.classList.remove('inactiveButton');
    } else if (state === 'inactive') {
        button.hidden = false;
        button.classList.add('inactiveButton');
        button.setAttribute('disabled', true);
        // button.classList.remove('activeButton');
    } else if (state === 'hidden') {
        button.hidden = true;
        // button.classList.remove('inactiveButton');
    } else if (state === 'obs') {
        button.hidden = false;
        // button.classList.remove('inactiveButton');
        button.classList.add('obsButton');
    } else {
        console.log('Wrong state statement for toggleButton');
    }
}



let healingDrainTimer = '';

function heal() {
    if (9 < currentUser.localMana || 9 < currentUser.globalMana) {
        stopStopHealingTimeOut = setTimeout(stopHealing, 5000);
        document.getElementById('canvasQrShow').style.display = 'block';
        setActionButton('Stop Healing', 'obs');
        // document.getElementById('healButton').hidden = true;
        // document.getElementById('stopHealButton').hidden = false;
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
        let oldText = showText.innerHTML;
        showText.hidden = false;
        showText.innerHTML = '<h1> Beklager, der er ikke mere mana <br><br> Skaf ny mana, før du kan heale andre <br> <br> (Skan QR koden \'0\') &#x1F642; </h1>';  // Smiley :-)
        setTimeout(() => {showText.innerHTML = oldText; showText.hidden = true}, 3000);
    }
}

function stopHealing() {
    document.getElementById('canvasQrShow').style.display = 'none';
    clearInterval(healingDrainTimer);
    clearInterval(stopStopHealingTimeOut);
    setActionButton('Heal', 'active');
    // document.getElementById('stopHealButton').hidden = true;
    // document.getElementById('healButton').hidden = false;
}


async function updateManaCounters(newMana) {
    if (newMana) {
        let sign  = '';
        let showAddingManaP = document.getElementById('showAddingMana');
        if (0 < newMana) {sign = '+';}
        showAddingManaP.innerText = sign + newMana;
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


let attackTimer = setInterval(attackChance, 10000);  // TODO: Move to Start Main Game routine

let whileAttackedTimer = '';                

function attackChance() {
    if (!currentUser.amulet && isVictim === 0 && Math.random() < attackProbability) {
        isVictim = 5;  // Requires 5 healing to be well. A healer can do it in one go. Scanning "0" five times works too
        document.getElementById('page').style.background = 'rgba(255, 0, 0, .36)';
        messageDiv.hidden = false;
        showText.hidden = true;
        if (currentUser.healerParticipates) {
            messageDiv.innerHTML = '<p>Du er blevet angrebet! <br> Skynd dig at blive healet ved at finde Healeren </p>'
        } else {
            messageDiv.innerHTML = '<p>Du er blevet angrebet! <br> Skynd dig at blive healet ved at scanne 0 flere gange </p>'
        }
        whileAttackedTimer = setInterval(whileAttacked, 1000);
    }
}


function whileAttacked() {
    currentUser.localMana -= 1;
    updateManaCounters();
    
    if (isVictim === 0) {
        clearInterval(whileAttackedTimer);
    }
}


async function chooseGameModeHasBeenClicked(event) {
    if (event.target.id === 'normal') {
        localMana = 0;
    // } else if (event.target.id === 'buyAmulet') {
    //     localMana = -200;
    //     amulet = true;
    } else if (event.target.id === 'coordinator') {
        coordinator = true;
    }
    gameState = 'selectRole';
    location.hash = '#selectRole';
    // document.getElementById('intro').style.display = 'none';
    // document.getElementById('selectRoleContainer').style.display = 'grid';
    await timer(600);
    // document.getElementById('startInstruktion').hidden = false;
    document.getElementById('secondInstruction').style.visibility = 'visible';
}


function roleHasBeenClicked(event) {
    gameMode = event.target.id; // Id in the format M3T1G1 for Movement level 3, Thinking level 1 and Game number 1
    console.log(gameMode);
    
    if (gameMode !== '' && gameMode !== 'selectRoleContainer') {
        
        if (coordinator) {
            showText.innerHTML = '<h2> Scan de andre deltageres QR koder </h2> Og tryk så på <em>Videre</em>';
            setActionButton('Skan', 'active');
            setAdvanceGameStateButton('Videre', 'inactive');
        } else {
            generateQRcode(gameMode).append(document.getElementById("canvasQrShow"));
            document.getElementById('canvasQrShow').style.display = 'block';
            showText.innerHTML = '<h2> Lad tovholderen skanne din QR kode </h2> Og tryk så på <em>Videre</em>';
            setActionButton('Skan', 'hidden');
            setAdvanceGameStateButton('Videre', 'active');
        }

        gameState = 'shareStartInfo';

        location.hash = '#gameMode';

        // navigator.vibrate(200);  // Just to test it. Will not work in Firefox :-/ TODO: Seems to not work in Chrome
    }
}


function beginRound() {
    gameState = 'firstRound';
    location.hash = '#gameMode'; // Adjust layout to game mode
    
    document.getElementById('globalManaCounter').style.visibility = 'visible';
    document.getElementById('localManaCounter').style.visibility = 'visible';
    document.getElementById('QrContainer').hidden = false;
    
    // If healer --> sligthly more risk of monsters
    let gameModeClass = gameModes[gameMode];
    currentUser = new gameModeClass();
    currentUser.localMana = localMana;
    currentUser.globalMana = globalMana;
    currentUser.amulet = amulet;
    currentUser.coordinator = coordinator;

    updateManaCounters();
}


async function showPattern(patternLenght){
    drawClockface();
    await timer(500);
    for (var i = 0; i < patternLenght; i++) {
        drawClockfaceOverlay(currentUser.goalArray[i], [0, 255, 0]);
        await timer(1000);
    }
    document.getElementById("canvasClockfaceOverlay").hidden = true
    // setActionButton('Skan', 'active');
    if (currentUser.showedPattern) {
        currentUser.localMana -= 20;
        updateManaCounters(-20);
    } else {
        currentUser.showedPattern = true;
    }
    setInfoButton('Vis Mønster', 'active');
    setActionButton('Skan', 'active');
}


async function showError(number) {  // Blink number red two times
    drawClockface();
    await timer(300);
    drawClockfaceOverlay(number, [255, 0, 0]);
    await timer(300);
    drawClockfaceOverlay(number, [255, 255, 255]);
    await timer(300);
    drawClockfaceOverlay(number, [255, 0, 0]);
    await timer(300);
    drawClockfaceOverlay(number, [255, 255, 255]);
    await timer(300);
    document.getElementById("canvasClockfaceOverlay").hidden = true
}


function useQRcode(QrNumber) {
    let deStringify = () => {try {return JSON.parse(QrNumber);} catch {return QrNumber; }};
    QrNumber = deStringify();
    if (-1 < QrNumber && QrNumber < 13) {
        currentUser.applyQrCode(QrNumber);
    } else if (isVictim !== 0 && -1 < QrNumber && QrNumber < 13) {
        showText.hidden = true;
        messageDiv.innerHTML = '<p> Du er skadet og skal heales før du kan andet <br> Find en Healer eller scan 0 flere gange </p>'

    } else if (isVictim !== 0  && QrNumber === 'center') {
        isVictim -= 1;  // Heal a little
        if (isVictim < 0.00001) {
            isVictim = 0;
            messageDiv.innerHTML = '';
            messageDiv.hidden = true;
            showText.hidden = false;
        }
        document.getElementById('page').style.background = 'rgba(255, 0, 0, '+ isVictim / 14 + ')';
        messageDiv.innerHTML = '<p> ' + healMsgs[isVictim] + ' <br> Scan 0 igen</p>' 
        
    } else if (isVictim !== 0  && QrNumber === 'Thy shalst be healed') {
        isVictim = 0;  // Heal fully
        document.getElementById('page').style.background = 'white';
        messageDiv.innerHTML = '';
        messageDiv.hidden = true;
        showText.hidden = false;

    } else if (Array.isArray(QrNumber)) {  // If paticipantslist ...
        participantList = QrNumber;
        firstTradeInterval();
        
    } else if (coordinator && /M\dT\dG\d/.test(QrNumber)) {  // If game ID ...
        participantList.push(QrNumber);
        setAdvanceGameStateButton('Videre', 'active');

    } else {
        showMessage('<p> Denne QR kode er dårlig magi! <br> Scan en anden </p>', 3000);
    }
}


function showMessage(text, time) {
    messageDiv.innerHTML = text;
    messageDiv.hidden = false;
    showText.hidden = true;
    
    // Then remove message after 2 sec
    msgTimeOut = setTimeout(function () {
        messageDiv.innerHTML = '';
        messageDiv.hidden = true;
        showText.hidden = false;
    }, time);
}


function stopQrReading() {
    html5Qrcode.stop().then((ignore) => {
        setActionButton('Skan', 'active');
        // document.getElementById('cancelScanButton').hidden = true;
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
    cameraOverlay.width = sizeFactor * winWidth;  
    cameraOverlay.height = sizeFactor * winHeight;
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
    canvasClockface.width = sizeFactor * winWidth;
    canvasClockface.height = sizeFactor * winHeight;
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
    document.getElementById('canvasStack').style.display = 'block';
    let canvasClockfaceOverlay = document.getElementById("canvasClockfaceOverlay");
    canvasClockfaceOverlay.hidden = false;
    let drawArea = canvasClockfaceOverlay.getContext("2d");
    canvasClockfaceOverlay.width = sizeFactor * winWidth;
    canvasClockfaceOverlay.height = sizeFactor * winHeight;
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
    document.getElementById('canvasStack').style.display = 'block';
    let canvasClockfaceOverlay = document.getElementById("canvasClockfaceOverlay");
    canvasClockfaceOverlay.hidden = false;
    let drawArea = canvasClockfaceOverlay.getContext("2d");
    canvasClockfaceOverlay.width = sizeFactor * winWidth;
    canvasClockfaceOverlay.height = sizeFactor * winHeight;
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
        this.usedRimAnchors = [1];  // TODO: Oups. Currently anchors is numbers around the clock. Refactor to make them coordinates
        this.potentialAnchors = [];  // Hmm. A lot of debugging needed. Remember: rap = new NiffPuzzle(); drawPuzzle(rap) to test puzzle in browser

        this.generatePieces();
    }
    

    generatePieces() {
        let firstAnchor;
        let nextAnchor;
        for (var n = 1; n < 6; n++) {  // Ouch. Still confusion if clockposition numbers or coordinates are being used...
            const bigPiece = Math.random();
            if (0 < this.potentialAnchors.length && bigPiece < 0.9) {
                firstAnchor = this.potentialAnchors[1];
            } else {
                firstAnchor = this.usedRimAnchors[this.usedRimAnchors.length - 1];
                nextAnchor = firstAnchor + Math.floor(Math.random() * 2 ) + 2;
                this.usedRimAnchors.push(nextAnchor);
            }
            // nextAnchor = firstAnchor + Math.floor(Math.random() * 3) + 1;
            const currentPuzzlePiece = new NiffPuzzlePiece(n, this, clockFaceCoor[firstAnchor], clockFaceCoor[nextAnchor]);
            this.pieces.push(currentPuzzlePiece);

            const centerAndAngles = getCenterAndAngles(clockFaceCoor[firstAnchor][0], clockFaceCoor[firstAnchor][1], 130);
            this.potentialAnchors.push(centerAndAngles.Ma);
            this.potentialAnchors.push(centerAndAngles.MaL);
            this.potentialAnchors.push(centerAndAngles.MaR);
            this.potentialAnchors.push(this.usedRimAnchors[this.usedRimAnchors.length - 1] + 1);
            this.potentialAnchors.push(this.usedRimAnchors[this.usedRimAnchors.length - 1] + 2);
            this.potentialAnchors.push(this.usedRimAnchors[this.usedRimAnchors.length - 1] + 3);
        }
    }
}

class NiffPuzzlePiece {
    constructor(pieceID, puzzle, firstAnchor, nextAnchor) {
        this.pieceID = pieceID;
        this.puzzle = puzzle;
        this.anchors = [firstAnchor, nextAnchor];
        this.possibleNewAnchors = [];
        
        this.puzzle.usedRimAnchors.push(nextAnchor);

        this.anchors.push(nextAnchor, firstAnchor);
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
    canvasClockfaceOverlay.width = sizeFactor * winWidth;
    canvasClockfaceOverlay.height = sizeFactor * winHeight;
    drawArea.scale(zoomFactor, zoomFactor);
    
    
    for (var [index, puzzlePiece] of puzzle.pieces.entries()) {
        drawArea.beginPath();
        drawArea.fillStyle = ['red', 'blue', 'green', 'yellow', 'magenta'][index];
        for (var i = 0; i < puzzlePiece.anchors.length; i += 2) {
            let anch1 = puzzlePiece.anchors[i];
            let anch2 = puzzlePiece.anchors[i + 1];
            let arc = getCenterAndAngles(anch1[0], anch1[1], 130);
            drawArea.moveTo(anch2[0], anch2[1]);
            // drawArea.moveTo(clockFaceCoor[anch2][0], clockFaceCoor[anch2][1]);
            drawArea.arc(arc.cx, arc.cy, arc.R, arc.v1, arc.v2);
        }
        drawArea.fill();
    }
    
    // drawArea.stroke();

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
    // canvasClockfaceOverlay.width = sizeFactor * winWidth;
    // canvasClockfaceOverlay.height = sizeFactor * winHeight;
    // drawArea.scale(zoomFactor, zoomFactor);

    drawArea.beginPath();
    drawArea.arc(cx, cy, R, v1, v2);
    drawArea.stroke();
}


function getCenterAndAngles(A, B, R) {  // Return the center and the two angles necessarty for drawing an arc defined by its endpoints A[xa, ya] and B[xb, yb] and radius R
    // if (typeof(A) === "number") {
    //     A = clockFaceCoor[A];  // Bad practice to allow two input formats, I know, I know, but it saves a lot of lines and makes testing way easier ...
    //     B = clockFaceCoor[B];
    // }
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
        width: sizeFactor * winWidth,
        height: sizeFactor * winHeight,
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

// For debugging purposes
function scanCoordinator() {
    participantList.push('M2T2G1'); 
    participantList.push('M1T3G1');
    useQRcode(participantList);
}