let sharp = require('sharp');
const AWS = require('aws-sdk');
const assert = require('assert');
const s3 = new AWS.S3();
const resize = require('../resizer.js').resize;

global.process.env = {
  ImageBucket: "start-small-image-dev",
};


describe('Resizer', () => {
  it('reszing', (done)=>{
    var event = {
      pathParameters: {
        size: "w100h100",
        image: '3adfd350-92e6-11e7-b0ea-ddee63351151-cdv_photo_002.jpg'
      }
    };
    resize(event, null, (context, res) => {
      try {
        // let data = JSON.parse(res.body);
        assert.equal(res.statusCode, 200);
        done();
      } catch (err) {
        done(err);
      }
    })
  })
});
