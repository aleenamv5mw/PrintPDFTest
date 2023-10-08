const axios = require("axios");
const {latestNewsletter, mediacFileRetrieve, cleanPdf } = require('./validation')
const {uploadFile,checkFileExists} = require("./s3");
const fs = require('fs')
const PDFDocument = require('pdf-lib').PDFDocument


async function generatePDF(companyId,id,date){
    const cleanPdfResult = await cleanPdf();
    let latestNewsletterPatternResult;
    if (Math.floor(new Date().getTime() / 1000) - date > 604800) return console.log({Message : "Link expired (Auto)"});
    let pdfName = id+'-'+date+'.pdf';
    let fileExistsResults = await checkFileExists(pdfName)

    if (!fileExistsResults) {
            latestNewsletterPatternResult = await latestNewsletter(companyId, id, date)
            console.log({Mes: "normal process"})
            if (!latestNewsletterPatternResult) return console.log("Loading failed, please try again later (Auto).");
            console.log({Message: "Loading, please wait.."});
            let mediacFileRetrieveResults = await mediacFileRetrieve(latestNewsletterPatternResult)
            if (mediacFileRetrieveResults.length === 0) return console.log({Message: "There is no print articles"})

        const mergedPdf = await PDFDocument.create();
        for (const pdfBytes of mediacFileRetrieveResults) {
            try {
                const pdf = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => {
                    try {
                        mergedPdf.addPage(page);
                    } catch (e) {
                        console.log("Error In Merging page")
                    }
                })
            } catch (e) {
                console.log("Error In Loading Bytes")
            }

        }
        try {
            const buf = await mergedPdf.save();        // Uint8Array
            fs.open(pdfName, 'w', function (err, fd) {
                try {
                    fs.write(fd, buf, 0, buf.length, null, function (err) {
                        try {

                            fs.close(fd, async function () {
                                console.log('wrote the file successfully');
                                const result = await uploadFile('./' + pdfName + '', pdfName)
                                fs.unlinkSync('./' + pdfName);
                                console.log("done")
                            });
                        } catch (e) {
                            console.log("Failed to Close")
                        }
                    });
                } catch (e) {
                    console.log("Failed to Write")
                }
            })
        } catch (e) {
            console.log("Failed to Open")
        }


    }
}
exports.generatePDF = generatePDF;


