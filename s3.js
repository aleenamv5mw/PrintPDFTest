const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')
require('dotenv').config()

const bucketName = process.env.BUCKET;
const region = process.env.REGION;
const accessKeyId = process.env.ACCESSKEYID;
const secretAccessKey = process.env.SECRETACCESSKEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
})

async function checkFileExists (pdfName) {
  try {
        const params = {Bucket: bucketName, Key: pdfName}
        return await s3.getObject(params).promise();
      } catch (e) {
        console.log("failing in checkFileExists\n"+e)
        return false;
      }
}
exports.checkFileExists = checkFileExists;


async function uploadFile(file,pdfName) {
  try {
        const fileStream = fs.createReadStream(file)
        const uploadParams = {Bucket: bucketName, Body: fileStream, Key: pdfName}
        return await s3.upload(uploadParams).promise()
      } catch(e) { 
        console.log("Error uploading PDF to S3"+e)
        return false 
      }   
}
exports.uploadFile = uploadFile

