// Thanks to Atle Aamodt for the chime sound. Obtained from https://samplefocus.com/samples/chime-hall-reverb-soft-2 


const pi = Math.PI;
const kv3h = Math.sqrt(3)/2;

const timer = ms => new Promise(res => setTimeout(res, ms));

const winWidth = window.screen.width;
const sizeFactor = 0.64;
const zoomFactor = sizeFactor * winWidth / 300;
const winHeight = winWidth;  // These two variables are currently used together to make square displays

// Manacosts
const manaPrice = 50;
const boosterPrice = 100;
const wrongPatternPrice = 10;
const showPatternAgainCost = 20;
const attackedCost = 1;


// Initialize QR-code reader
const html5Qrcode = new Html5Qrcode("reader");
const config = {fps: 10, qrbox: {width: sizeFactor * winWidth, height: sizeFactor * winHeight}};

const messageDiv = document.getElementById('messageDiv');
const showTextDiv = document.getElementById('showTextDiv');
const canvasQrShow = document.getElementById("canvasQrShow");


let gameTime = 2 * 60000;  // 2 minutes of game time
let attackTimer = '';
let whileAttackedTimer = '';                
let amulet = false;
let attackProbability = 0.001;
let booster = false;
let coordinator = false;
let solo = false;
let currentUser = '';
let endRoundAt = 0;
let endGameAt = 0;
let gameMode = '';
let gameState = 'chooseCoordinator';
let participantList = [];
let id = 0;
let globalMana = 500;  // Start with some mana to heal attacked players
let isVictim = 0;  // Change to 5 if player is attacked and needs healing. Is healed fully by Healer, but need a few scans of '0' to heal alone
let localMana = 0;
let isRoundOverTimer;
let isGameOverTimer;
let soloEndScans = Math.floor((Math.random() * 6) + 3);

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

class NiffDataPacket {
    constructor(packetType) {
        this.pt = packetType;  // (p)articipants (s)core (f)inalMana
        // this.participantList = [];
        // this.participantListOriginalLength = 0;
        this.era = new Date().valueOf();  // EndRoundAt
        // this.id = 0;
        // this.score = 0;
        // this.finalMana = 0;
        // this.gameOver = false;
    }
}


class NiffGame {
    constructor(){
        this.globalMana = 500;
        this.localMana = 0;
        this.playerList = [];
        // this.healerParticipates = false;
        this.amulet = false;
        this.booster = false;
        this.coordinator = false;
        this.id = 0;
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


class M1T1G1 extends NiffGame {  // Healer
    constructor() {
        super();
        this.gameMode = 'M1T1G1';

        generateQRcode("Thy shalst be healed!").append(document.getElementById("canvasQrShow"));
        document.getElementById('canvasQrShow').style.display = 'none';
        // ToDo: Add explaning text?
        setActionButton('Skan', 'active');
        setInfoButton('Heal', 'active');

        clearInterval(attackTimer);  // Makes sure the Healer is not attacked

        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h2> Heal dem der er blevet skadet</h2> <span> Tryk på Heal-knappen, ' +
        'når spillere <br>kommer med en rød skærm. <br> Det koster mana at heale, så gør det kort <br><br>' + 
        'Tryk på Skan-knappen og skan 0 en gang imellem for at samle mana </span>';

    }

    async applyQrCode(QrNumber) {
        if (QrNumber === 'center') {
            let newDelta = 10;
            this.localMana += Number(newDelta);
            await updateManaCounters(newDelta); // Todo: Remove the Healers scan-button for 10 seconds after each scan?
            setActionButton('Skan', 'inactive');
            await timer(5000);
            setActionButton('Skan', 'active');
        }
    }
}


class M2T1G1 extends NiffGame {  // Skan i rækkefølge
    constructor() {
        super();
        this.gameMode = 'M3T1G1';
        this.lastScan = 0;

        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h2> Skan i rækkefølge </h2> <span> Skan QR-koderne i ' +
        'rækkefølge <br> med eller mod uret<br>(Man kan godt skifte retning) </span>';

        setActionButton('Skan', 'active');
    }

    applyQrCode(QrNumber) {
        let newDelta = 0;
        if (Math.abs(this.lastScan - QrNumber) === 1) {
            newDelta = 45;
        } else {
            newDelta = 1;
        }
        this.localMana += Number(newDelta);
        updateManaCounters(newDelta);
        this.lastScan = QrNumber;
    }
}


class M2T2G1 extends NiffGame {  // Indstil visere
    constructor() {
        super();
        this.gameMode = 'M2T2G1';
        this.firstGuess = true;

        let arrayLen = 20;
        this.goalArray = [];
        for (var i = 0; i < arrayLen; i++) {
            let hour = Math.floor(Math.random() * 24);
            let min = Math.floor(Math.random() * 12) * 5;
            this.goalArray.push([hour, min]);
        }
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        
        showTextDiv.hidden = false;
        let colon = ':';
        if (this.currentGoal[1] === 0 || this.currentGoal[1] === 5) {
            colon = ':0';
        }
        showTextDiv.innerHTML = '<h2> Indstil viserne så de viser </h2><h3>' + this.currentGoal[0] + colon +
        this.currentGoal[1] + '</h3> <span> (Skan først det tal den lille viser skal pege på) </span>';

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
            document.getElementsByTagName('h3')[0].style.color = 'rgb(53, 219, 53)';
            setActionButton('Skan', 'inactive');  // Scanning the last digit multiple times shouldn't be possible
            
            setTimeout(() => {drawClockHandOnOverlay(6, false, 12, false)
                this.updateGoal();
                
                let colon = ':';
                var curGo = this.currentGoal;
                if (curGo[1] === 0 || curGo[1] === 5) {
                    colon = ':0';
                }
                showTextDiv.innerHTML = '<h2> Indstil viserne så de viser </h2><h3>' + curGo[0] + colon 
                + curGo[1] + '</h3> <span> (Skan først det tal den lille viser skal pege på) </span>';

                this.firstGuess = true;
                document.getElementsByTagName('h3')[0].style.color = 'black';
                setActionButton('Skan', 'active');
            }, 3000);
        } else {
            let oldText = showTextDiv.innerHTML;
            showTextDiv.innerHTML = '<h1> Prøv igen &#x1F642; </h1>';  // Smiley :-)
            setTimeout(() => showTextDiv.innerHTML = oldText, 3000);
        }
    }
}


class M3T1G1 extends NiffGame {  // Scan løs
    constructor() {
        super();
        this.gameMode = 'M3T1G1';
        this.lastScan = 0;

        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h2> Skan løs! </h2> <span> Skan så mange QR-koder som muligt<br> '
        + ' (Jo længere QR-koderne ligger langt fra <br> hinanden, jo mere mana giver de) </span>';


        setActionButton('Skan', 'active');
    }

    applyQrCode(QrNumber) {
        let newDelta = 0;
        if (this.lastScan === 0) {
            newDelta = QrNumber;
        } else {
            newDelta = Math.round(5/10000 * ((clockFaceCoor[QrNumber][0] - clockFaceCoor[this.lastScan][0]) * (clockFaceCoor[QrNumber][0] - clockFaceCoor[this.lastScan][0]) + (clockFaceCoor[QrNumber][1] - clockFaceCoor[this.lastScan][1]) * (clockFaceCoor[QrNumber][1] - clockFaceCoor[this.lastScan][1])) + 1);
        }
        this.localMana += Number(newDelta);
        updateManaCounters(newDelta);
        this.lastScan = QrNumber;
    }
}


class M3T1G2 extends NiffGame {  // Følg det viste mønster
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

        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h2> Skan QR-koden med det grønne tal </h2> <span>' +
        '(Når den rigtige QR-kode er skannet, <br>vises den næste der skal skannes) </span>';

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
            currentUser.localMana -= wrongPatternPrice;
            updateManaCounters(-wrongPatternPrice);
            await timer(300);
            drawClockfaceOverlay(this.currentGoal, [0, 255, 0]);
        }
    }
}


class M3T1G3 extends NiffGame {  // Følg mønster efter tal
    constructor() {
        super();
        this.gameMode = 'M3T1G3';
        
        let arrayLen = 20;
        let startNum = 0;
        let tempArray = Array.from({length: arrayLen},()=> startNum += Math.ceil(Math.random()*6) + 2);  // Avoid the same number twice and neighboring numbers by stepping 2 to 8 steps forward. The next function brings the numbers back into 1-12
        let mod12 = (number) => number%12 + 1; // Plus 1 to avoid 12%12 = 0
        this.goalArray = tempArray.map(mod12);
        this.currentGoal = this.goalArray[this.currentGoalNumber];
        
        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h2> Scan ' + this.currentGoal + '</h2>';

        setActionButton('Skan', 'active');
    }
    
    async applyQrCode(QrNumber) {
        if (Number(QrNumber) === this.currentGoal) {
            let newDelta = 50;
            this.localMana += Number(newDelta);
            updateManaCounters(newDelta);
            this.updateGoal();
            showTextDiv.innerHTML = '<h2> Skan ' + this.currentGoal + '</h2>';
        } else {
            showTextDiv.innerHTML = '<h2> Det var ikke ' + this.currentGoal + '<br>  &#x1FAE4;</h2>';  // Smiley :-/
            await timer(1000);
            showTextDiv.innerHTML = '<h2> Skan ' + this.currentGoal + '</h2>';
        }
    }
}


class M3T2G1 extends NiffGame {  //  Gentag mønster
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
        
        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h3> Scan i samme rækkefølge </h3> <span> (Tryk på <em>Vis mønster</em> knappen for at se mønsteret) </span>';
        
        this.currentPatternPosition = 0;
        this.patternLenght = 2;

        setActionButton('Skan', 'inactive');
        setInfoButton('Vis Mønster', 'active', 'green');
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
                setInfoButton('Vis Mønster', 'active', 'green');
                document.getElementById('infoButton').hidden = false;
                setActionButton('Skan', 'hidden');
            }
        } else {
            let oldText = showTextDiv.innerHTML;
            showTextDiv.innerHTML = '<h1> Ups! Start forfra &#x1FAE4; </h1>'; // Smiley :-/
            setTimeout(() => showTextDiv.innerHTML = oldText, 3000);
            await showError(num);  // Show scanned number in red for 2 seconds
            
            this.currentPatternPosition = 0;
            this.currentGoalNumber = 0;
            showPattern(this.patternLenght);
        }
    }
}

// Game modes above


// class M1T1G1 extends NiffGame {  // 
//     constructor() {
//         super();
//         this.gameMode = 'M1T1G1';

//     }

//     applyQrCode(QrNumber) {
//     }
// }

const gameModes = {
    'M1T1G1': M1T1G1,  // Healer
    'M2T1G1' : M2T1G1, // Skan i rækkefølge
    'M2T2G1': M2T2G1,  // Indstil visere
    //'M2T2G2': M2T2G2,  // Jæger
    'M3T1G1': M3T1G1,  // Skan løs
    'M3T1G2': M3T1G2,  // Følg det viste mønster
    'M3T1G3': M3T1G3,  // Følg mønster efter tal
    'M3T2G1': M3T2G1,  // Gentag mønster
}


// Eventlisteners

// document.getElementById('chooseGameMode').addEventListener('click', 
//     function(event) { chooseGameModeHasBeenClicked(event); }, true);  // Normal/coordinator
document.getElementById('start').addEventListener('click', startButtonHasBeenClicked);

document.getElementById('solo').addEventListener('click', soloChecboxHasBeenChecked);
document.getElementById('coordinator').addEventListener('click', coordinatorChecboxHasBeenChecked);


document.getElementById('selectRoleContainer').addEventListener('click', 
    function(event) { roleHasBeenClicked(event); }, true);

document.getElementById('actionButton').addEventListener('click', actionButtonHasBeenClicked);

document.getElementById('infoButton').addEventListener('click', infoButtonHasBeenClicked);

// document.getElementById('buyAmuletButton').addEventListener('click', buyAmuletButtonHasBeenClicked);

document.getElementById('advanceGameStateButton').addEventListener('click', 
    advanceGameStateButtonHasBeenClicked);

// End of eventlisteners

console.clear();


async function actionButtonHasBeenClicked() {
    let actionButton = document.getElementById('actionButton'); 
    if (!actionButton.classList.contains('inactiveButton')) { // ! not
        switch(actionButton.textContent) {
            case 'Skan':
                if (currentUser.coordinator && gameState === 'shareEndInfo') {
                    document.getElementById('canvasQrShow').style.display = 'none';
                }
                setActionButton('Stop Skan', 'obs');
                scanQRcode();
                break;
            case 'Stop Skan':
                setActionButton('Skan', 'active');
                await timer(500); // Stopping a scan right after initiation confuses the scanner...
                stopScan();
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
                case 'Heal':
                    setInfoButton('Stop Healing', 'obs');
                    heal();
                    break;
                case 'Stop Healing':
                    stopHealing();
                    setInfoButton('Heal', 'active');
                    break;
            }
    }
}
   

function advanceGameStateButtonHasBeenClicked(event) {
    // let advanceGameStateButton = document.getElementById('advanceGameStateButton');
    clearQrCanvas();
    if (coordinator && gameState === 'shareRoleInfo') {
        stopScan();
        
        setActionButton('Skan', 'hidden');
        setAdvanceGameStateButton('Videre', 'active');

        participantList.push([id, gameMode]); // Add the coordinators id and gameMode
        
        let packet = new NiffDataPacket('p');
        endRoundAt = (new Date(new Date().valueOf() + gameTime)).valueOf();  // endRoundAt needs to be set here as a global variable
        packet.era = endRoundAt;
        // packet.participantList = participantList;
        // packet.participantListOriginalLength = participantList.length;
        
        let gameData = JSON.stringify(packet);
        
        generateQRcode(gameData).append(canvasQrShow);
        canvasQrShow.style.display = 'block';

        showTextDiv.innerHTML = '<h2> Lad de andre deltagere skanne denne QR kode </h2> Og tryk så på <em>Videre</em>';

        gameState = 'shareStartInfo';
        
    } else if (!coordinator && gameState === 'shareRoleInfo') {
        clearQrCanvas();

        showTextDiv.innerHTML = '<h2> Skan tovholderens QR kode </h2>';
        
        setActionButton('Skan', 'active');
        setAdvanceGameStateButton('Videre', 'hidden');
        gameState = 'shareStartInfo';
        
    } else if (coordinator && gameState === 'shareStartInfo') {
        clearQrCanvas()
        
        showTextDiv.innerHTML = '';
        
        setAdvanceGameStateButton('Videre', 'hidden');
        firstTradeInterval();
        
    } else if (gameState === 'firstTradeInterval') {
        beginRound();
        
    } else if (coordinator && gameState === 'shareEndInfo') {
        let packet = new NiffDataPacket('f');
        packet.fm = currentUser.globalMana.toString();
        packet.pl = currentUser.playerList.filter(item => item[0] !== currentUser.id); // (p)articipant(l)ist
        let QRcontent = JSON.stringify(packet);

        generateQRcode(QRcontent).append(canvasQrShow);
        canvasQrShow.style.display = 'block';

        // generateQRcode(QRcontent).append(document.getElementById('canvasQrShow'));
        // document.getElementById('canvasQrShow').style.display = 'block';

        showText('<h3> For at sprede den indsamlede mana skal I nu bygge Kraftens Tårn </h3> <br>' + 
            'Din tavle er i bunden af tårnet indtil alle har modtaget manaen første gang <br>' + 
            'Derefter kommer den øverste tavle i bunden, og du trykker Skan ligesom alle andre'
        );

        setActionButton('Skan', 'active');
        setAdvanceGameStateButton('Videre', 'hidden');
        
    } else if (!coordinator && gameState === 'shareEndInfo') {
        gameState = 'towerOfPower';
        setAdvanceGameStateButton('Videre', 'hidden');
        clearQrCanvas();
        clearEndGameInfo();
        
        showText('<h3> For at sprede den indsamlede mana skal I nu bygge Kraftens Tårn </h3> <br>' +
            'Hold jeres tavler over hinanden med koordinatorens nederst og tryk "Skan" <br>' + 
            'Når den øverste tavle har modtaget manaen flyttes den til bunden af tårnet');
            
        setActionButton('Skan', 'active');
        setAdvanceGameStateButton('Videre', 'hidden');

        // TODO: Implement a QR code being shown after the coordinators finalScore QR has been scanned

        // if (currentUser.coordinator) {
        //     generateQRcode("Thy shalst be healed!").append(document.getElementById("canvasQrShow"));
        //     document.getElementById('canvasQrShow').style.display = 'block';
        // }
        
    } else if (gameState === 'gameEnded') {
        window.location.reload();
    } else if (gameState === 'towerOfPower') {
        // ToDo: Implement
        
    } else {
        console.log('AdvanceGameStateButton clicked outside gameflow')
    }
}


function showText(innerHtmlMessage, show) {  // String, bool
    showTextDiv.innerHTML = '';
    let paragraph = document.createElement("p");
    paragraph.innerHTML = innerHtmlMessage;
    showTextDiv.appendChild(paragraph);
    showTextDiv.hidden = show;
}


function firstTradeInterval() {
    gameState = 'firstTradeInterval';
    location.hash = '#firstTradeInterval';

    setAdvanceGameStateButton('Videre', 'active');
    setActionButton('Skan', 'hidden');
    textNode = document.getElementById('firstTradeInfo');
    textNode.hidden = false;
    let paragraph = document.createElement("p");
    let textContent = document.createTextNode('I de verdener der åbnes portaler til, ' + 
        'kan der være magiske væsener der angriber dig\n');
    paragraph.appendChild(textContent);
    textNode.appendChild(paragraph);
        
    if (!participantList.includes('M2T2G2')) {  // Ingen jæger
            if (participantList.includes('M1T1G1')) {  // Healer
                if (gameMode === 'M1T1G1') {  // If you are the healer, skip buying amulets (It is a T1 and not necessary)
                    beginRound();
                } else {
                    attackProbability *= 10;
                    let paragraph = document.createElement("p");
                    let textContent = document.createTextNode('Der er en healer på holdet. Find dem og ' +
                        'skan deres tavle, hvis du bliver angrebet\n');
                    paragraph.appendChild(textContent);
                    textNode.appendChild(paragraph);
                }
                    
            } else {
                let paragraph1 = document.createElement("p");
                let textContent1 = document.createTextNode('Hvis du bliver angrebet, kan du blive healet ved at ' +
                    'skanne 0 flere gange\n');
                paragraph1.appendChild(textContent1);
                textNode.appendChild(paragraph1);
            
                let paragraph2 = document.createElement("p");
                paragraph2.setAttribute('id', 'buyAmuletElement')
                let textContent2 = document.createTextNode('Hvis du ikke kan lide tanken om at blive angrebet, ' +
                    'kan du bruge lidt mana på at købe en amulet \u{1FAAC} der beskytter mod magiske væsener');
                paragraph2.appendChild(textContent2);
                let button1 = document.createElement('button');
                button1.setAttribute('id', 'buyAmuletButton');
                button1.innerText = ' Køb amulet \u{1FAAC} mod monstre for ' + manaPrice + ' mana ';
                paragraph2.appendChild(button1);
                textNode.appendChild(paragraph2);
                // document.getElementById('buyAmuletButton').hidden = false;
                document.getElementById('buyAmuletButton').addEventListener('click', buyAmuletButtonHasBeenClicked);
                
                let paragraph3 = document.createElement('p');
                paragraph3.setAttribute('id', 'buyBoosterElement');
                let textContent3 = document.createTextNode('Du kan også købe en amulet \u2728 så dine ritualer ' + 
                    'samler mere mana ');
                paragraph3.appendChild(textContent3);
                let button2 = document.createElement('button');
                button2.setAttribute('id', 'buyBoosterButton');
                button2.innerText = ' Køb en amulet \u2728 der giver større manaudbytte for ' + boosterPrice + ' mana ';
                paragraph3.appendChild(button2);
                textNode.appendChild(paragraph3);
                document.getElementById('buyBoosterButton').addEventListener('click', buyBoosterButtonHasBeenClicked);
            }
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


function buyAmuletButtonHasBeenClicked() {
    localMana -= manaPrice;
    amulet = true;
    // document.getElementById('buyAmuletButton').hidden = true;
    
    let textNode = document.getElementById('firstTradeInfo');
    // textNode.removeChild(textNode.lastChild);
    // textNode.removeChild(textNode.children[2]);
    textNode.removeChild(document.getElementById('buyAmuletElement'));
    
    let textNode1 = document.getElementById('firstTradeResult');
    if (!booster) {
        let hr = document.createElement('hr');
        textNode1.appendChild(hr);
    }
    let paragraph = document.createElement("p");
    let textContent = document.createTextNode('\u2022 Du har købt en amulet \u{1FAAC} der beskytter mod ' +
        'magiske væsener');
    paragraph.appendChild(textContent);
    textNode1.appendChild(paragraph);
}
    
    
function buyBoosterButtonHasBeenClicked() {
    localMana -= boosterPrice;
    booster = true;
    // document.getElementById('buyBoosterButton').hidden = true;
    
    let textNode = document.getElementById('firstTradeInfo');
    // textNode.removeChild(textNode.children[3]);
    textNode.removeChild(document.getElementById('buyBoosterElement'));
    
    let textNode1 = document.getElementById('firstTradeResult');
    if (!amulet) {
        let hr = document.createElement('hr');
        textNode1.appendChild(hr);
    }
    let paragraph = document.createElement("p");
    let textContent = document.createTextNode('\u2022 Du har købt en amulet \u2728 der giver større ' +
        'manaudbytte');
    paragraph.appendChild(textContent);
    textNode1.appendChild(paragraph);
}


function setUpFunction() {
    document.getElementById('page').style.height = window.innerHeight - 30 + 'px';
    document.getElementById('gameMode').style.height = window.innerHeight - 200 + 'px'; 
    document.getElementById('canvasQrShow').style.left = '' + -sizeFactor * winWidth / 2 + 'px';
    document.getElementById('canvasClockface').style.left = '' + -sizeFactor * winWidth / 2 + 'px';
    document.getElementById('canvasClockfaceOverlay').style.left = '' + -sizeFactor * winWidth / 2 + 'px';

    document.getElementById('solo').checked = false;
    document.getElementById('coordinator').checked = false;

    location.hash = '#intro';
}


// ToDO: Change the non-functioning config parameter or incorporate the following line:
// document.getElementsByTagName('video')[0].style.width = "" + sizeFactor * winWidth + "px";


function scanQRcode() {
    html5Qrcode.start({facingMode: "environment"}, config, (decodedText, decodedResult) => {
        console.log('We have got ' + decodedText);
        stopScan();
        useQRcode(decodedText);
    }, (errorMessage) => {
        console.log('Camera says ' + errorMessage);
        // if (document.getElementsByTagName('video')[0]) {
        //     document.getElementsByTagName('video')[0].style.width = "" + sizeFactor * winWidth + "px";  // Ugly hack!
        //     document.getElementsByTagName('video')[0].style.height = "" + sizeFactor * winHeight + "px";  // Ugly hack!
        // }
    }).catch((err) => {
        console.log('Camera failed to start');
    });
}

function stopScan() {
    if (html5Qrcode.getState() === 2) {  // 1 is not-scanning, 2 is scanning
        html5Qrcode.stop().then((ignore) => {
            setActionButton('Skan', 'active');
            // document.getElementById('cancelScanButton').hidden = true;
            console.log('QR scanning stopped');
        }).catch((err) => {
            console.log('QR scanning did not stop for some reason');
        });

        setActionButton('Skan', 'hidden');
    }
}

function setActionButton(text, state) {
    let actionButton = document.getElementById('actionButton');
    if (text != '') {
        actionButton.textContent = text;
    }

    toggleButton(actionButton, state);
}


function setInfoButton(text, state, colour) {
    let infoButton = document.getElementById('infoButton');
    if (text != '') {
        infoButton.textContent = text;
    }

    toggleButton(infoButton, state, colour);
}


function setAdvanceGameStateButton(text, state) {
    let advanceGameStateButton = document.getElementById('advanceGameStateButton');
    if (text != '') {
        advanceGameStateButton.textContent = text;
    }

    toggleButton(advanceGameStateButton, state);
}


function toggleButton(button, state, colour) {
    button.removeAttribute('class');

    if (state === 'active') {
        button.hidden = false;
        button.classList.add('activeButton');
        button.removeAttribute('disabled');
        
    } else if (state === 'inactive') {
        button.hidden = false;
        button.classList.add('inactiveButton');
        button.setAttribute('disabled', true);
        
    } else if (state === 'hidden') {
        button.hidden = true;
        
    } else if (state === 'obs') {
        button.hidden = false;
        
        button.classList.add('obsButton');
    } else {
        console.log('Wrong state statement for toggleButton');
    }

    if (['yellow', 'red', 'green'].includes(colour)) {
        button.classList.add(colour);
    }
}



let healingDrainTimer = '';

function heal() {
    if (9 < currentUser.localMana || 9 < currentUser.globalMana) {
        stopStopHealingTimeOut = setTimeout(stopHealing, 5000);
        document.getElementById('canvasQrShow').style.display = 'block';
        setInfoButton('Stop Healing', 'obs');
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
        let oldText = showTextDiv.innerHTML;
        showTextDiv.hidden = false;
        showTextDiv.innerHTML = '<h1> Beklager, der er ikke mere mana <br><br> Skaf ny mana, før du kan heale andre <br> <br> (Skan QR koden \'0\') &#x1F642; </h1>';  // Smiley :-)
        setTimeout(() => {showTextDiv.innerHTML = oldText; showTextDiv.hidden = true}, 3000);
    }
}

function stopHealing() {
    document.getElementById('canvasQrShow').style.display = 'none';
    clearInterval(healingDrainTimer);
    clearInterval(stopStopHealingTimeOut);
    setInfoButton('Heal', 'active');
}


async function updateManaCounters(newMana) {
    if (newMana) {
        let sign  = '';
        let showAddingManaP = document.getElementById('showAddingMana');
        if (0 <= newMana) {sign = '+';}
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


async function updateGlobalManaCounters(newMana) {
    if (newMana) {
        let sign  = '';
        let showAddingManaP = document.getElementById('showAddingMana');
        if (0 <= newMana) {sign = '+';}
        showAddingManaP.innerText = sign + newMana;
        showAddingManaP.classList.add('triggerAnimationGlobal');
        await timer(1600);
        showAddingManaP.classList.remove('triggerAnimationGlobal');
        showAddingManaP.innerText = '';
    }
    document.getElementById('localManaCounter').innerHTML = 
    '<span>Nyhøstet Mana</span> <span class="score">' + currentUser.localMana + '</span>';
    document.getElementById('globalManaCounter').innerHTML = 
    '<span>Samlet Mana</span> <span class="score">' + currentUser.globalMana + '</span>';
}


async function poolMana() {
    let sign  = '';
    // Local mana
    let showAddingManaP = document.getElementById('showAddingMana');
    if (0 <= currentUser.localMana) {sign = '+';}
    showAddingManaP.innerText = sign + currentUser.localMana;
    showAddingManaP.classList.add('triggerAnimationLocalPool');
    await timer(1600);
    showAddingManaP.classList.remove('triggerAnimationLocalPool');
    showAddingManaP.innerText = '';
    
    document.getElementById('localManaCounter').innerHTML = 
    '<span>Nyhøstet Mana</span> <span class="score"> 0 </span>';
    
    // Global mana
    if (0 <= currentUser.globalMana) {sign = '+';}
    showAddingManaP.innerText = sign + currentUser.globalMana;
    showAddingManaP.classList.add('triggerAnimationGlobalPool');
    await timer(1600);
    showAddingManaP.classList.remove('triggerAnimationGlobalPool');
    showAddingManaP.innerText = '';
    
    document.getElementById('globalManaCounter').innerHTML = 
    '<span>Samlet Mana</span> <span class="score"> 0 </span>';
}


// async function poolGlobalMana() {
//     let sign  = '+';
//     let showAddingManaP = document.getElementById('showAddingMana');
//     if (0 <= currentUser.globalMana) {sign = '+';}
//     showAddingManaP.innerText = sign + currentUser.globalMana;
//     showAddingManaP.classList.add('triggerAnimationGlobalPool');
//     await timer(1600);
//     showAddingManaP.classList.remove('triggerAnimationGlobalPool');
//     showAddingManaP.innerText = '';
    
//     document.getElementById('globalManaCounter').innerHTML = 
//     '<span>Samlet Mana</span> <span class="score"> 0 </span>';
// }


function attackChance() {
    if (!currentUser.amulet && isVictim === 0 && Math.random() < attackProbability) {
        isVictim = 5;  // Requires 5 healing to be well. A healer can do it in one go. Scanning "0" five times works too
        document.getElementById('page').style.background = 'rgba(255, 0, 0, .36)';
        messageDiv.hidden = false;
        showTextDiv.hidden = true;
        if (currentUser.healerParticipates) {
            messageDiv.innerHTML = '<p>Du er blevet angrebet! <br> Skynd dig at blive healet ved at finde Healeren </p>'
        } else {
            messageDiv.innerHTML = '<p>Du er blevet angrebet! <br> Skynd dig at blive healet ved at scanne 0 flere gange </p>'
        }
        whileAttackedTimer = setInterval(whileAttacked, 1000);
    }
}


function whileAttacked() {
    currentUser.localMana -= attackedCost;
    updateManaCounters();  // ToDo: what happens when running out of mana? Should the red background deepen/flash before reaching 0? And the player die if doing nothing?
    
    if (isVictim === 0) {
        clearInterval(whileAttackedTimer);
    }
}

function soloChecboxHasBeenChecked() {
    if (document.getElementById('solo').checked) {
        document.getElementById('coordinator').checked = false;
        document.getElementById('timeChooseDiv').hidden = false;
        document.getElementById('timeChooseDiv')[1].checked = true;
        coordinator = false;
        document.getElementById('coordinator').disabled = true;
        document.getElementById('coordinatorSpan').style.color = 'grey';
    } else {
        document.getElementById('timeChooseDiv').hidden = true;
        document.getElementById('coordinator').disabled = false;
        document.getElementById('coordinatorSpan').style.color = 'black';
    }
}


function coordinatorChecboxHasBeenChecked() {
    if (document.getElementById('coordinator').checked) {
        document.getElementById('timeChooseDiv').hidden = false;
        document.getElementById('timeChooseDiv')[1].checked = true;
        document.getElementById('solo').disabled = true;
        document.getElementById('soloSpan').style.color = 'grey';
    } else {
        document.getElementById('timeChooseDiv').hidden = true;
        document.getElementById('solo').disabled = false;
        document.getElementById('soloSpan').style.color = 'black';
    }
}


async function startButtonHasBeenClicked(event) {
    // if (event.target.id === 'normal') {
    //     localMana = 0;
    // // } else if (event.target.id === 'buyAmulet') {
    // //     localMana = -200;
    // //     amulet = true;
    // } else if (event.target.id === 'coordinator') {
    //     coordinator = true;
    // }
    if (document.getElementById('coordinator').checked) {
        coordinator = true;
        gameTime = 60000 * Number(document.querySelector('input[name="timeChooser"]:checked').value);
    } else if (document.getElementById('solo').checked) {
        solo = true;  // TODO: Implement solo-mode
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
            id = 1000000;
            showTextDiv.innerHTML = '<h2> Skan de andre deltageres QR koder </h2> Og tryk så på <em>Videre</em>';
            setActionButton('Skan', 'active');
            setAdvanceGameStateButton('Videre', 'inactive');
    
            gameState = 'shareRoleInfo';
            location.hash = '#gameMode';
        } else if (!solo) {
            id = Math.floor(Math.random() * 1000000);
            let QRcontent = JSON.stringify([id, gameMode]);
            
            generateQRcode(QRcontent).append(canvasQrShow);
            canvasQrShow.style.display = 'block';
            
            showTextDiv.innerHTML = '<h2> Lad tovholderen skanne din QR kode </h2> Og tryk så på <em>Videre</em>';
            setActionButton('Skan', 'hidden');
    
            gameState = 'shareRoleInfo';
            location.hash = '#gameMode';
            setAdvanceGameStateButton('Videre', 'active');
        } else {
            clearQrCanvas()
        
            showTextDiv.innerHTML = '';
            
            setAdvanceGameStateButton('Videre', 'hidden');

            endRoundAt = (new Date(new Date().valueOf() + gameTime)).valueOf();
            location.hash = '#firstTradeInterval';
            firstTradeInterval();
        }
    }
}


function isRoundOver() {
    let now = new Date();
    if (endRoundAt < now) {
        endGame();
    } else {
        let progressValue = (endRoundAt - now) / gameTime * 100;
        // document.getElementById('progressBar').setAttribute("value", "20");
        document.getElementById('progressBar').setAttribute("value", progressValue);
        if (progressValue < 30) {
            document.getElementById('progressBar').style.setProperty('--progressBarColour', 'gold');
            if (progressValue < 15) {
                document.getElementById('progressBar').style.setProperty('--progressBarColour', 'red');
            }
        }
    }
}


function beginRound() {
    gameState = 'firstRound';
    location.hash = '#gameMode'; // Adjust layout to game mode
    
    document.getElementById('progressBar').style.width = 0.9 * winWidth + 'px';
    document.getElementById('progressBar').setAttribute("max", "100");
    document.getElementById('progressBar').setAttribute("value", "100");
    document.getElementById('progressBar').style.setProperty('--progressBarColour', 'green')
    document.getElementById('progressBarContainer').hidden = false;
    isRoundOverTimer = setInterval(isRoundOver, 1000);

    setAdvanceGameStateButton('Videre', 'hidden');
    document.getElementById('firstTradeInfo').innerHTML = '';
    document.getElementById('firstTradeResult').innerHTML = '';
    document.getElementById('showTextDiv').innerHTML = '';
    document.getElementById('firstTradeInterval').hidden = true;
    
    document.getElementById('globalManaCounter').style.visibility = 'visible';
    document.getElementById('localManaCounter').style.visibility = 'visible';
    document.getElementById('QrContainer').hidden = false;
    
    // If healer --> sligthly more risk of monsters
    let gameModeClass = gameModes[gameMode];
    currentUser = new gameModeClass();
    currentUser.id = id;
    currentUser.globalMana = globalMana;
    currentUser.localMana = localMana;
    currentUser.playerList = participantList;
    currentUser.coordinator = coordinator;
    
    if (amulet) {
        document.getElementById('amulet').hidden = false;
        currentUser.amulet = amulet;
    }
    if (booster) {
        document.getElementById('booster').hidden = false;
        currentUser.booster = booster;
    }

    updateManaCounters();


    attackTimer = setInterval(attackChance, 10000);
}


function endGame() {
    clearInterval(isRoundOverTimer);
    clearInterval(attackTimer);
    document.getElementById('progressBarContainer').hidden = true;
    document.getElementById('booster').hidden = true;
    document.getElementById('amulet').hidden = true;
    document.getElementById('infoButton').hidden = true;
    document.getElementById('canvasStack').style.display = 'none';
    
    gameState = 'shareEndInfo';
    location.hash = '#gameMode'; // Needs to use the same display options as gameMode
    
    clearQrCanvas()
    
    if (coordinator) {
        showTextDiv.innerHTML = '<h2> Skan de andre deltageres QR koder </h2> Og tryk så på <em>Videre</em>';
        setActionButton('Skan', 'active');
        setAdvanceGameStateButton('Videre', 'inactive');  // ToDo: Add functionality to advancing the game state
    } else if (!solo) {
        document.getElementById('showTextDiv').hidden = true;  // Turn off old messages. Something of a hack...
        setAdvanceGameStateButton('Videre', 'active');
        setActionButton('Skan', 'hidden');
        if (currentUser.localMana == 0) {
            currentUser.localMana = 10;
        }

        let packet = new NiffDataPacket('s');
        // packet.id = currentUser.id;
        // packet.participantList = currentUser.playerList;
        // packet.participantListOriginalLength = currentUser.playerList.length;
        packet.sc = (Number(currentUser.globalMana) + Number(currentUser.localMana)).toString();  // (sc)ore
        let QRcontent = JSON.stringify(packet);
        poolMana();

        generateQRcode(QRcontent).append(canvasQrShow);
        canvasQrShow.style.display = 'block';

        textNode = document.getElementById('endGameInfo');
        textNode.hidden = false;
        let paragraph = document.createElement("p");
        paragraph.innerHTML = 'Lad koordinatoren skanne din tavle for at ' + 
            'samle holdets mana\n - og tryk så <em>Videre</em>';
        textNode.appendChild(paragraph);
    } else {
        textNode = document.getElementById('showTextDiv');
        textNode.innerHTML = '';
        textNode.hidden = false;
        let paragraph = document.createElement("p");
        paragraph.innerHTML = 'Skan 0 flere gange for at forstærke manaen og sende den ud over hele Niff';
        textNode.appendChild(paragraph);
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
    // setActionButton('Skan', 'active');
    if (currentUser.showedPattern) {
        currentUser.localMana -= showPatternAgainCost;
        updateManaCounters(-showPatternAgainCost);
    } else {
        currentUser.showedPattern = true;
    }
    setInfoButton('Vis Mønster', 'active', 'yellow');
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


// ToDo: Add functionality to advancegamestate after game ends for normal players
// ToDo: Add functionality to advancegamestate after game ends for coordinators
// ToDo: Make test routine for endgame

function useQRcode(QrNumber) {
    let deStringify = () => {try {return JSON.parse(QrNumber);} catch {return QrNumber; }};
    QrNumber = deStringify();
    if (-1 < QrNumber && QrNumber < 13) {
        currentUser.applyQrCode(QrNumber);
    } else if (isVictim !== 0 && -1 < QrNumber && QrNumber < 13) {
        showTextDiv.hidden = true;
        messageDiv.innerHTML = '<p> Du er skadet og skal heales før du kan andet <br> Find en Healer eller scan 0 flere gange </p>'
    
    } else if (QrNumber === 'center' && currentUser.gameMode === 'M1T1G1') { // The healer can scan 0 for mana
        currentUser.applyQrCode(QrNumber);

    } else if (isVictim !== 0  && QrNumber === 'center') {  // Non-healers can scan 0 five times to get healed
        isVictim -= 1;  // Heal a little
        if (isVictim < 0.00001) {
            isVictim = 0;
            messageDiv.innerHTML = '';
            messageDiv.hidden = true;
            showTextDiv.hidden = false;
        }
        document.getElementById('page').style.background = 'rgba(255, 0, 0, '+ isVictim / 14 + ')';
        messageDiv.innerHTML = '<p> ' + healMsgs[isVictim] + ' <br> Scan 0 igen</p>' 
        
    } else if (isVictim !== 0  && QrNumber === 'Thy shalst be healed!') {
        isVictim = 0;  // Heal fully
        document.getElementById('page').style.background = 'white';
        messageDiv.innerHTML = '';
        messageDiv.hidden = true;
        showTextDiv.hidden = false;
        
    } else if (coordinator && /M\dT\dG\d/.test(QrNumber[1])) {  // If game ID is scanned it implies that you are the coordinator...
        participantList.push(QrNumber);
        setAdvanceGameStateButton('Videre', 'active');
        
    } else if (QrNumber.pt == 'p') {
        // participantList = QrNumber.participantList;
        endRoundAt = (new Date(QrNumber.era)).valueOf();
        firstTradeInterval();

    } else if (coordinator && QrNumber.pt === 's') {
        // TODO: Need a visual clue for adding coordinator mana to pool?
        currentUser.globalMana += currentUser.localMana;  // Add coordinators mana to pool.
        currentUser.localMana = 0;

        updateGlobalManaCounters(QrNumber.sc);   // (sc)ore
        currentUser.globalMana += Number(QrNumber.sc);

        // participantList = participantList.filter(item => item[0] !== QrNumber.id);  // This kills the coordinators participantlist, but it is backed up in currentUser.playerList

        setAdvanceGameStateButton('Videre', 'active');

    } else if (QrNumber.pt == 'f') {
        // Share the final mana
        honk();

        if (0 < QrNumber.pl.length) {  // First a round spreading the final score  // (p)articipant(l)ist
            currentUser.globalMana = QrNumber.fm;
            currentUser.localMana = 0;  // TODO: Move this to when the useres share their mana?
            QrNumber.pl = QrNumber.pl.filter(item => item[0] !== currentUser.id); // (p)articipant(l)ist
            clearQrCanvas();
            
            if ( QrNumber.pl.length === 0) {  // (p)articipant(l)ist
                // QrNumber.gameOver = true;
                endGameAt = (new Date(new Date().valueOf() + Math.random() * 45000 + 30000)).valueOf();  // endGameAt is a global variable that needs to be set
                QrNumber.era = endGameAt;  // The NiffDataPacket's endRoundAt (era) is reused as endGameAt here. Bad practice?
            }

            let QRcontent = JSON.stringify(QrNumber);

            generateQRcode(QRcontent).append(canvasQrShow);
            canvasQrShow.style.display = 'block';

            // generateQRcode(QRcontent).append(document.getElementById("canvasQrShow"));

        } else {
            clearQrCanvas();
            let QRcontent = JSON.stringify(QrNumber);

            generateQRcode(QRcontent).append(canvasQrShow);
            canvasQrShow.style.display = 'block';

            // generateQRcode(QRcontent).append(document.getElementById("canvasQrShow"));
            // document.getElementById('canvasQrShow').style.display = 'block';
            // ToDo: Play higher rising tone with each sharing
            endGameAt = (new Date(QrNumber.era)).valueOf();
            isGameOverTimer = setInterval(showEndScreen, 1000);
        }

    } else if (solo  && QrNumber === 'center') {
        soloEndScans -= 1;
        if (soloEndScans < 1) {
            showEndScreen();
        }

    } else {
        showMessage('<p> Denne QR kode er dårlig magi! <br> Scan en anden </p>', 3000);
    }
}

async function honk() {
    let sound = new Audio('qr-codes/elephant-triumph-sfx-293300.mp3');
    sound.play();
    // navigator.vibrate(200);  // Just to test it. Will not work in Firefox :-/ TODO: Seems to not work in Chrome
}


function chime() {
    let sound = new Audio('qr-codes/chime-hall-reverb-soft-2_99bpm_G_minor.wav');
    sound.play();
    // navigator.vibrate(200);  // Just to test it. Will not work in Firefox :-/ TODO: Seems to not work in Chrome
}


function showEndScreen() {
    let now = new Date();
    if ((endGameAt < now) || solo) {
        stopScan();
        clearQrCanvas();
        setActionButton('Skan', 'hidden');
        setInfoButton('', 'hidden')
        setAdvanceGameStateButton('Videre', 'active');
        showText('<h3> Manaen er spredt! </h3> <br> <p> Game over </p>', false);  // False --> .hidden = false
        gameState = 'gameEnded';
        clearInterval(isGameOverTimer);
        chime();
    }
}


function showMessage(text, time) {
    messageDiv.innerHTML = text;
    messageDiv.hidden = false;
    showTextDiv.hidden = true;
    
    // Then remove message after 'time' seconds
    msgTimeOut = setTimeout(function () {
        messageDiv.innerHTML = '';
        messageDiv.hidden = true;
        showTextDiv.hidden = false;
    }, time);
}


function clearEndGameInfo() {
    let endGameInfo = document.getElementById('endGameInfo');
    if (endGameInfo.firstChild) {
        endGameInfo.innerHTML = '';
    }
}


function clearQrCanvas() {
    if (canvasQrShow.firstChild) {
        canvasQrShow.removeChild(canvasQrShow.firstChild);
    }
    canvasQrShow.style.display = 'none';
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

    console.log('Generated QR code: ' + text);

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

// For debugging purposes:
function scanCoordinator() {
    let packet = new NiffDataPacket('p');
    // packet.participantList = [[12345, 'M2T2G1'], [56789, 'M3T2G1'], [98765, 'M3T1G2'], [54321, 'M3T1G1']];
    packet.era = (new Date(new Date().valueOf() + gameTime)).valueOf();
    useQRcode(JSON.stringify(packet));
}

function scanSeveralParticipants() {
    useQRcode([12345, 'M2T2G1'])
    useQRcode([56789, 'M3T2G1'])
    useQRcode([98765, 'M3T1G2'])
    useQRcode([54321, 'M3T1G1'])
}

// Rainbow 
// document.getElementsByTagName('body')[0].style.background = 'rgb(' + [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)].join(',') + ')';

function coordinatorScansAllAtTheEnd() {
    let packet = new NiffDataPacket('s');
    // for (var i=0; i<currentUser.playerList.length; i++) {
    //     packet.id = currentUser.playerList[i][0];
    //     packet.score = (Math.floor(1000*Math.random())).toString();
    // }
    packet.sc = 5000;
    useQRcode(JSON.stringify(packet));
}

function reload() {
    window.location.reload();
}

function videre() {
    document.getElementById('advanceGameStateButton').click();
}