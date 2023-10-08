const express = require('express');
const app = express();
const fs = require("fs");
const {checkFileExists} = require("./s3");
const {uploadFile} = require("./s3");
const {cleanPdf } = require('./validation')
const {reUseGeneratePdfCode} = require('./reUseGeneratePdfCode')
const {updateToken} = require('./updateToken')
const helmet = require("helmet");
const nocache = require("nocache");
app.use(helmet());
app.use(nocache());
app.set('etag', false);
require('dotenv').config()

app.get('/',async(req, res)=>{
    try{
            if(!req.query.company_id || !req.query.id || !req.query.date) res.send({Message : "Please pass the required details!"});
            const companyId = req.query.company_id;
            const id = req.query.id;
            const date = req.query.date;
            await cleanPdf();
            if (Math.floor(new Date().getTime() / 1000) - date > 604800) return res.send({Message : "Link expired"});
            let pdfName = id+'-'+date+'.pdf';
            let fileExistsResults = await checkFileExists(pdfName)
            if (fileExistsResults) {
                if(!fileExistsResults.Body) return res.send({Message : "Something went wrong."});
                console.log("PDF found on S3, fetching the same")
                res.contentType("application/pdf");
                return res.send(fileExistsResults.Body);
            } else {
                console.log("File unavailable in S3, creating a new one.")
                let result = await reUseGeneratePdfCode(id,date,companyId,pdfName)
                if(!result[0]) 
                    return res.send({Message : result[1]});
                res.contentType("application/pdf")
                res.send(fs.readFileSync('./' + pdfName));
                let upload_response = await uploadFile('./' + pdfName + '', pdfName)
                fs.unlinkSync('./' + pdfName);
                if(upload_response)
                    console.log("File successfully uploaded to S3")
                if(result[1]) await updateToken(result[0]);                          
 }
        }catch(e){
                console.log("Something went wrong\n\n" + e)
                return res.send({Message : "Something went wrong."});
        }
})

let index = 0;
app.get('/date', async (req, res)=>{        
    try{
            await cleanPdf();
            if(req.query.company_id && req.query.id) {
                res.header('Content-Type: text/xml');
                const output = `<root><date>`+Math.floor(new Date().getTime() / 1000)+`</date></root>`;
                res.send(output)
                var date = output.replace(/[^0-9]/g,'');
                setTimeout(async () => {
                    try{
                        let pdfName = req.query.id+'-'+date+'.pdf';
                        console.log("PDF generation function invoked")
                        let result = await reUseGeneratePdfCode(req.query.id,date,req.query.company_id,pdfName)
                        if(!result) return console.log({Message : "Auto PDF generation failed."});
                        //Upload file to S3 bucket
                        await uploadFile('./' + pdfName + '', pdfName)
                        //Unlink the file from current directory
                        fs.unlinkSync('./' + pdfName);
                        console.log("Message : File successfully uploaded to S3")
                        if(result[1]) await updateToken(result[0]);   
                        
    }catch (e) {
                        return console.log("Something went wrong in NL")
                    }
                }, 20000)
            }else{
                res.header('Content-Type: text/xml');
                const output = `<root><date>`+Math.floor(new Date().getTime() / 1000)+`</date></root>`;
                return res.send(output)
            }
        }catch(e){
            return console.log("Something went wrong in NL")
        }
})


app.get('/health',async (req, res)=> {
    console.log("I am on a server")
    return res.send({Message_: "All set for 2023"})
});



var port = process.env.PORT || 3005;
app.listen(port, (req,res) => {
  console.log("I am on a server")
})








