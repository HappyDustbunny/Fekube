const pi = Math.PI;
const kv3h = Math.sqrt(3)/2;
// Initialize QR-code reader
const html5Qrcode = new Html5Qrcode("reader");
const config = {fps: 10, qrbox: {width: 300, height: 300}};

let gameMode = '';
let globalMana = 0;
let localMana = 0;

let lastScan = 0;     // Used for T1M3G1
let clockFaceCoor = { // Used for T1M3G1
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

// Eventlisteners
document.getElementById('closeIntro1').addEventListener('click', closeIntro);
document.getElementById('closeIntro2').addEventListener('click', closeIntro);

document.getElementById('selectGameModeContainer').addEventListener('click', function(event) { gameModeHasBeenClicked(event); }, true);

document.getElementById('scanButton').addEventListener('click', function() {
    document.getElementById('scanButton').hidden = true;
    document.getElementById('cancelScanButton').hidden = false;
    scanQRcode();
});

document.getElementById('cancelScanButton').addEventListener('click', stopScan);
// End of eventlisteners

console.clear();

function closeIntro() {
    document.getElementById('intro').hidden = true;
    document.getElementById('selectGameModeContainer').hidden = false;
}

function gameModeHasBeenClicked(event) {
    gameMode = event.target.id; // Id in the format T1M3G1 for Thinking level 1, Movement level 3 and Game 1
    console.log(gameMode);
    if (gameMode) {
        document.getElementById('selectGameModeContainer').hidden = true;
        document.getElementById('navigationContainer').style.visibility = 'visible'
        // document.getElementById('scanButton').hidden = false;
        document.getElementById('globalManaCounter').style.visibility = 'visible';
        document.getElementById('localManaCounter').style.visibility = 'visible';
    }
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

function updateLocalManaCounter(localMana) {
    document.getElementById('localManaCounter').textContent = localMana;
}

function useQRcode(QrNumber) {
    switch(gameMode) {
        case 'T1M1G1': {  // Healer
        break;    
        }
        case 'T1M3G1': {  // Scan løs
            let newDelta = 0;
            if (lastScan === 0) {
                newDelta = QrNumber;
            } else {
                newDelta = Math.round(10 * ((clockFaceCoor[QrNumber][0] - clockFaceCoor[lastScan][0]) * (clockFaceCoor[QrNumber][0] - clockFaceCoor[lastScan][0]) + (clockFaceCoor[QrNumber][1] - clockFaceCoor[lastScan][1]) * (clockFaceCoor[QrNumber][1] - clockFaceCoor[lastScan][1])));
            }
            lastScan = QrNumber;
            localMana += Number(newDelta);
            updateLocalManaCounter(localMana);
        break;    
        }
        case 'T1M3G2': {  // Følg det viste mønster
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
}

// const qrCodeHasBeenRead = (decodedText, decodedResult) => {
//     console.log(`Code matched = ${decodedText}`, decodedResult);
//     let readerDiv = document.getElementById('readerDiv');
//     let content = document.createTextNode(decodedText);
//     readerDiv.appendChild(content);
    
//     stopQrReading();
// }

function stopQrReading() {
    html5Qrcode.stop().then((ignore) => {
        console.log('QR scanning stopped');
    }).catch((err) => {
        console.log('QR scanning did not stop for some reason');
    });
}


// Draw clockface
function drawClockface() {
    let canvasClockface = document.getElementById("canvasClockface");
    let drawArea = canvasClockface.getContext("2d");
    canvasClockface.width = 300;
    canvasClockface.height = 300;
    let r = 10;
    drawArea.beginPath();
    drawArea.fillStyle = "red";
    for (let v = 0; v < 2*pi; v += pi/6) {
        let xc = 130 * Math.cos(v) + 150;
        let yc = 130 * Math.sin(v) + 150;
        drawArea.moveTo(xc + r, yc);  // Add radius to avoid drawing a horizontal radius
        drawArea.arc(xc, yc, r, 0, 2*pi);
        drawArea.fill();
    }
    drawArea.moveTo(150 + r, 150);
    drawArea.arc(150, 150, r, 0, 2*pi);
    drawArea.stroke();
}

drawClockface();


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

generateQRcode("blarp").append(document.getElementById("canvasQRShow"));


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
