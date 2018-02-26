'use strict';

let sharp = require('sharp');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.resize = (event, context, callback) => {
  if (!event.pathParameters 
    || !event.pathParameters.size 
    || !event.pathParameters.image)
    return errorHandler({message: "invalid parameter"}, callback)

  let size = event.pathParameters.size;
  let scaleType = size.charAt(0);
  let srcImage = event.pathParameters.image;
  let dstImage = size + '/' + srcImage;
  let targetWidth = size.match(/w[0-9]+/) ? Number(size.match(/w[0-9]+/)[0].slice(1)) : null;
  let targetHeight = size.match(/h[0-9]+/) ? Number(size.match(/h[0-9]+/)[0].slice(1)) : null;
  let srcObject;

  if(!targetWidth && !targetHeight)
    return errorHandler({message: "invalid parameter"}, callback)
  
  return s3.getObject({
    Bucket: process.env.ImageBucket,
    Key: srcImage
  }).promise()
    .then((response)=>{
      srcObject = response;
      
      return sharp(response.Body)
      .resize(targetWidth, targetHeight)
      .toBuffer()
    })
    .then((data)=>{
      let response = {
        statusCode: 200,
        headers: {
          'Content-Type': srcObject.ContentType
        },
        body: data.toString("base64"),
        isBase64Encoded: true
      };

      callback(null, response);

      return s3.putObject({
        Bucket: process.env.ImageBucket,
        Key: dstImage,
        Body: data,
        ACL: 'public-read',
        ContentType: srcObject.ContentType
      })
        .promise()
    })
    .catch((err)=> {
      console.error(err);
      errorHandler(err, callback);
    })
}

function errorHandler(err, callback){
  return callback(null, {
    statusCode: 400,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(err)
  });
}