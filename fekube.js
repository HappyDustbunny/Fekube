
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

generateQRcode("blarp").append(document.getElementById("canvas"));

// QR-code reader
function onScanSuccess(decodedText, decodedResult) {
    // handle the scanned code as you like, for example:
    console.log(`Code matched = ${decodedText}`, decodedResult);
    let outputDiv = document.getElementById('output');
    let content = document.createTextNode(decodedText);
    outputDiv.appendChild(content);
}

function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    console.warn(`Code scan error = ${error}`);
}


document.getElementById('firstButton').addEventListener('click', function() {
    let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: {width: 250, height: 250} }, /* verbose= */ false);
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
});

// // QR-code generator
// const qrCode = new QRCodeStyling({
//     width: 300,
//     height: 300,
//     type: "svg",
//     data: "abcdefghi jklmnopqr stuvwxyz 1234567890!#¤%&/()=?~^*<>", // Max 256 characters or the QR pixels will be too small. May have to encode information in bits
//     image: "qr-codes/fairy.png",
//     dotsOptions: {
//         color: "#000",
//         type: "square"
//     },
//     backgroundOptions: {
//         color: "#fff",
//     },
//     imageOptions: {
//         crossOrigin: "anonymous",
//         margin: 20
//     }
// });

// qrCode.append(document.getElementById("canvas"));