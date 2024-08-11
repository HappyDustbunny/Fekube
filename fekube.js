const pi = Math.PI;

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


// QR-code reader
function grabQRcode() {
    const html5Qrcode = new Html5Qrcode("reader");
    const config = {fps: 10, qrbox: {width: 300, height: 300}};
    const qrCodeHasBeenRead = (decodedText, decodedResult) => {
        console.log(`Code matched = ${decodedText}`, decodedResult);
        let readerDiv = document.getElementById('readerDiv');
        let content = document.createTextNode(decodedText);
        readerDiv.appendChild(content);

        html5Qrcode.stop().then((ignore) => {
            console.log('QR scanning stopped');
        }).catch((err) => {
            console.log('QR scanning did not stop for some reason');
        })
    }
    
    return html5Qrcode.start({facingMode: "environment"}, config, qrCodeHasBeenRead);
}

document.getElementById('firstButton').addEventListener('click', function() {
    decodedText = grabQRcode();
    console.log(`Decoded text = ${decodedText}`);
});

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