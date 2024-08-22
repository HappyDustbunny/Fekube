const pi = Math.PI;
const kv3h = Math.sqrt(3)/2;
// Initialize QR-code reader
const html5Qrcode = new Html5Qrcode("reader");
const config = {fps: 10, qrbox: {width: 300, height: 300}};

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

let lastScan = 0;     // Used for T1M3G1
let clockFaceCoor = { // Used for T1M3G1
    0: [0.0, 0.0],
    1: [0.5, kv3h],
    2: [kv3h, 0.5],
    3: [1.0, 0.0],
    4: [kv3h, -0.5],
    5: [0.5, -kv3h],
    6: [0.0, -1.0],
    7: [-0.5, -kv3h],
    8: [-kv3h, -0.5],
    9: [-1.0, 0.0],
    10: [-kv3h, 0.5],
    11: [-0.5, kv3h],
    12: [0.0, 1.0]
} ;

class niffUser {
    constructor(gameMode, goalArray) {
        this.gameMode = gameMode;
        this.globalMana = globalMana;
        this.localMana = 0;
        this.goalArray = goalArray;
        this.currentGoalNumber = 0; 
        this.currentGoal = goalArray[this.currentGoalNumber];
    }
    
    updateGoal () {
        if (this.currentGoalNumber < this.goalArray.length - 1) {
            this.currentGoalNumber += 1;
            this.currentGoal = this.goalArray[this.currentGoalNumber];
        }
    }
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

document.getElementById('cancelScanButton').addEventListener('click', stopScan);
document.getElementById('healButton').addEventListener('click', heal);
// End of eventlisteners

console.clear();

function setUpFunction() {
    document.getElementById('page').style.height = window.innerHeight - 30 + 'px';
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
    setTimeout(stopHealing, 5000);
    document.getElementById('canvasQrShow').hidden = false;
    document.getElementById('healButton').hidden = true;
    healingDrainTimer = setInterval(whileHealing, 1000);
}


function whileHealing() {
    globalMana -= 10;
    updateManaCounters();
    // Todo: What happens if global mana is depleated? Should the Healer be able to top up global mana by scanning 0?
}

function stopHealing() {
    document.getElementById('canvasQrShow').hidden = true;
    clearInterval(healingDrainTimer);
    document.getElementById('healButton').hidden = false;
}


function updateManaCounters() {
    document.getElementById('localManaCounter').innerHTML = 
    '<span>Nyhøstet Mana</span> <span class="score">' + currentUser.localMana + '</span>';
    document.getElementById('globalManaCounter').innerHTML = 
    '<span>Samlet Mana</span> <span class="score">' + globalMana + '</span>';
}


let attackTimer = setInterval(attackChance, 10000);
let whileAttackedTimer = '';


function attackChance() {
    if (isVictim === 0 && Math.random() < 0.001) {
        isVictim = 5;
        document.getElementById('page').style.background = 'rgba(255, 0, 0, .36)';
        messageDiv.hidden = false;
        messageDiv.innerHTML = '<p>Du er blevet angrebet! <br> Skynd dig at blive healet ved at finde Healeren eller scanne 0 flere gange</p>'
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


function gameModeHasBeenClicked(event) {
    gameMode = event.target.id; // Id in the format T1M3G1 for Thinking level 1, Movement level 3 and Game 1
    console.log(gameMode);
    
    if (gameMode !== '' && gameMode !== 'selectGameModeContainer') {
        // Adjust layout to game mode
        document.getElementById('selectGameModeContainer').hidden = true;
        document.getElementById('globalManaCounter').style.visibility = 'visible';
        document.getElementById('localManaCounter').style.visibility = 'visible';
        document.getElementById('QrContainer').hidden = false;
        document.getElementById('navigationContainer').style.visibility = 'visible';
        
        // Set up instructions for game modes that needs them
        switch(gameMode) {
            case 'T1M1G1': {  // Healer
                generateQRcode("Thy shalst be healed!").append(document.getElementById("canvasQrShow"));
                // ToDo: Add explaning text?
                document.getElementById('healButton').hidden = false;
                document.getElementById('uglyHackSpacer').hidden = false
                clearInterval(attackTimer);  // Makes sure the Healer is not attacked
                currentUser = new niffUser(gameMode, []);
                break;    
            }
            case 'T1M3G2': {
                let arrayLen = 20;
                let startNum = 0;
                let tempArray = Array.from({length: arrayLen},()=> startNum += Math.ceil(Math.random()*6) + 2);  // Avoid the same number twice and neighboring numbers by stepping 2 to 8 steps forward. The next function brings the numbers back into 1-12
                mod12 = (number) => number%12 + 1; // Plus 1 to avoid 12%12 = 0
                goalArray = tempArray.map(mod12);
                
                currentUser = new niffUser(gameMode, goalArray);
                
                drawClockfaceOverlay(currentUser.currentGoal);
                break;
            }
            default:
                currentUser = new niffUser(gameMode, []);
        }
    }
    updateManaCounters();
}


function useQRcode(QrNumber) {
    if (isVictim !== 0  && QrNumber === 'center' || QrNumber === 'Thy shalst be healed!') {
        if (QrNumber === 'Thy shalst be healed') {
            isVictim = 0;
            document.getElementById('page').style.background = 'white';
            messageDiv.innerHTML = '';
            messageDiv.hidden = true;
        } else {
            isVictim -= 1;
            if (isVictim < 0.00001) {
                isVictim = 0;
                messageDiv.innerHTML = '';
                messageDiv.hidden = true;
            }
            document.getElementById('page').style.background = 'rgba(255, 0, 0, '+ isVictim / 14 + ')';
            messageDiv.innerHTML = '<p> ' + healMsgs[isVictim] + ' <br> Scan 0 igen</p>'
        }
    } else if (isVictim !== 0 && -1 < QrNumber && QrNumber < 13) {
        messageDiv.innerHTML = '<p> Du er skadet og skal heales før du kan andet <br> Find en Healer eller scan 0 flere gange </p>'
    } else if (-1 < QrNumber && QrNumber < 13) {
        switch(gameMode) {
            case 'T1M1G1': {
                currentUser.localMana += 10;
                updateManaCounters()  // Todo: Remove the Healers scan-button for 10 seconds after each scan?
                break;
            }
            case 'T1M3G1': {  // Scan løs
                let newDelta = 0;
                if (lastScan === 0) {
                    newDelta = QrNumber;
                } else {
                    newDelta = Math.round(10 * ((clockFaceCoor[QrNumber][0] - clockFaceCoor[lastScan][0]) * (clockFaceCoor[QrNumber][0] - clockFaceCoor[lastScan][0]) + (clockFaceCoor[QrNumber][1] - clockFaceCoor[lastScan][1]) * (clockFaceCoor[QrNumber][1] - clockFaceCoor[lastScan][1])));
                }
                currentUser.localMana += Number(newDelta);
                updateManaCounters();
                lastScan = QrNumber;
                break;    
            }
            case 'T1M3G2': {  // Følg det viste mønster
                if (Number(QrNumber) === currentUser.currentGoal) {
                    currentUser.localMana += 50;
                    updateManaCounters();
                    currentUser.updateGoal();
                    drawClockfaceOverlay(currentUser.currentGoal);
                }
            break;    
            }
            case 'T2M3G1': {  // Følg mønster efter tal
                break;    
            }
            case 'T3M3G1': {  // Vikl ud
                break;    
            }
            case 'T1M3G1': {
                break;    
            }
            case 'T1M3G1': {
                break;    
            }
        }
    } else {
        messageDiv.innerHTML = '<p> Denne QR kode er dårlig magi! <br> Scan en anden </p>';
        messageDiv.hidden = false;

        // Then remove message after 2 sec
        msgTimeOut = setTimeout(function () {
            messageDiv.innerHTML = '';
            messageDiv.hidden = true;
        }, 2000);
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

// Draw clockface    TODO: Make colour gradients instead of arcs
function drawClockface() {
    // Find and show Clockface
    let canvasClockface = document.getElementById("canvasClockface");
    canvasClockface.hidden = false;
    let drawArea = canvasClockface.getContext("2d");
    canvasClockface.width = 300;
    canvasClockface.height = 300;

    let r = 10;
    let offset = 3;
    drawArea.strokeStyle = "blue";
    drawArea.beginPath();
    for (const [i, coor] of Object.entries(clockFaceCoor)) {
        let xc = Math.floor(130 * coor[0] + 150);
        let yc = Math.floor(-130 * coor[1] + 150);  // Minus 130 to flip coordinate system to programmer style with y-axis downwards
        drawArea.moveTo(xc + r, yc);  // Add radius to avoid drawing a horizontal radius
        drawArea.arc(xc, yc, r, 0, 2*pi);
        drawArea.stroke();
        if (9 < Number(i)) {offset = 7}
        drawArea.fillText(i, xc - offset, yc + 3);
    }
}

function drawClockfaceOverlay(number) {
    drawClockface();
    // Find and show ClockfaceOverlay
    let canvasClockfaceOverlay = document.getElementById("canvasClockfaceOverlay");
    canvasClockfaceOverlay.hidden = false;
    let drawArea = canvasClockfaceOverlay.getContext("2d");
    canvasClockfaceOverlay.width = 300;
    canvasClockfaceOverlay.height = 300;

    let r = 10;
    let offset = 3;
    if (number) {
        let xc = Math.floor(130 * clockFaceCoor[number][0] + 150);
        let yc = Math.floor(-130 * clockFaceCoor[number][1] + 150);
        const radgrad3 = drawArea.createRadialGradient(xc - 4, yc - 4, 1, xc, yc, r); // Red sphere
        radgrad3.addColorStop(0, "rgba(255, 0,0,.3)");
        radgrad3.addColorStop(0.5, "rgb(255, 0,0)");
        radgrad3.addColorStop(0.9, "rgb(255, 0,0)");
        radgrad3.addColorStop(1, "rgba(255, 0, 0, 0)");
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


function drawArcOnOverlay(C, R, v1, v2) {
    drawClockface();
    // Find and show ClockfaceOverlay
    let canvasClockfaceOverlay = document.getElementById("canvasClockfaceOverlay");
    canvasClockfaceOverlay.hidden = false;
    let drawArea = canvasClockfaceOverlay.getContext("2d");
    canvasClockfaceOverlay.width = 300;
    canvasClockfaceOverlay.height = 300;

    drawArea.beginPath();
    drawArea.arc(C[0], C[1], R, v1, v2);
    drawArea.stroke();
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


function getCenterAndAngles(A, B, R) {  // Return the center and the two angles necessarty for drawing an arc defined by its endpoints A[xa, ya] and B[xb, yb] and radius R
    let distAB = dist(A, B);
    let distABtoC = Math.sqrt(R * R - (distAB/2) * (distAB/2));
    let AB = vecAB(A, B);
    let hatAB = hatVector(AB);
    let M = midPoint(A, B);  // Also the vector from (0, 0) to M
    let C = subtractVector(M, scalarMult(unitVector(hatAB), distABtoC));
    let CA = vecAB(C, A);
    let CB = vecAB(C, B);
    let i = [1, 0];  // Unit vector along x-axis
    angleACB = Math.acos(dotProd(CA, CB)/(vectorLength(CA)*vectorLength(CB))); // Angle spanned by the arc
    angleBCO = Math.acos(dotProd(CB, i)/(vectorLength(CB)*vectorLength(i)));  // The angle between the x-axis and the first vector
    return [C, angleBCO, angleACB];
}

// DRAWING ABOVE

// QR-code generator
function generateQRcode(text) {
    let responseQRcode = new QRCodeStyling({
        width: 300,
        height: 300,
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
