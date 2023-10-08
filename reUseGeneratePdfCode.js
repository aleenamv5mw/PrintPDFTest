const fs = require('fs')
const {getToken} = require("./getToken");
const {extractDistributionID, extractPrintPdfId, mediacFileRetrieve } = require('./validation')
const PDFDocument = require('pdf-lib').PDFDocument


async function reUseGeneratePdfCode(id,date,companyId,pdfName) {
    try{
            let tokens = await getToken();
            let token = tokens[0]
            //Fetch correct distribution data
            let distribution_Id = await extractDistributionID(id,token,companyId,date)
            if(!distribution_Id) return [false,"Unable to find the specified distribution."];

            //Extract print articles from distribution data
            let printIds = await extractPrintPdfId(distribution_Id,token);
            if (!printIds || printIds.length === 0) return [false,"No print articles found"];

            //Retrieve PDF document from Mediac server
            let mediacFileRetrieveResults = await mediacFileRetrieve([...new Set(printIds)])
            if (mediacFileRetrieveResults.length === 0) return [false,"Unable to retrieve print articles from the server"];

            //Merge all the PDF documents
            const mergedPdf = await PDFDocument.create();
            for (const pdfBytes of mediacFileRetrieveResults) {
                try {
                    const pdf = await PDFDocument.load(pdfBytes);
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => {
                        try {
                            mergedPdf.addPage(page);
                        } catch (e) {
                            console.log(`Unable to merge print articles - error: ${e}`)
                            return [false,"Loading failed, please try again later."]
                        }
                    })
                } catch (e) {
                    console.log(`Unable to open downloaded print articles - error: ${e}`)
                    return [false,"Unable to open downloaded print articles, please try again later."];
                }

            }

            //Create a PDF file in current directory
            try {
                const buf = await mergedPdf.save();       
                let fd = fs.openSync(pdfName, 'w')
                if(fd){
                        if(fs.writeSync(fd, buf)){
                                fs.closeSync(fd)
                                console.log('wrote the file successfully to cwd');
                                return tokens;
                        } else { 
                            console.log('Unable to write files to CWD')
                            return [false,"Loading failed, please try again later."];
                        }
                    } else {
                        console.log('Unable to write files to CWD')
                        return [false,"Loading failed, please try again later."];
                    }
                } catch (e) {
                    console.log(`Unable to save merged file - ${e}`)
                    return [false,"Loading failed, please try again later."];
                }
        }catch(e){
            console.log(`Failure at generate pdf module - ${e}`)
            return [false,"Loading failed, please try again later."];
        }

}

exports.reUseGeneratePdfCode = reUseGeneratePdfCode;






























