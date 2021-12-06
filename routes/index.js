require('dotenv').config();
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash');
const speech = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const uploadDir = multer({ storage: multer.diskStorage(
    {
        destination: path.resolve(__dirname, '..', 'public', 'assets'),
        filename: function ( req, file, cb ) {
            cb( null, Date.now() + '_' + file.originalname );
        }
    }
) });

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', {
    title: 'Demo Extract Media | Speed To Text',
    transcript: 'plan text extracted will display here'
  });
});

/**
 * upload media to server
 */
router.post('/upload', uploadDir.single('media'), (req, res, next) => {
  let filePath = _.get(req, 'file.path', '');
    /*
    file: {
      fieldname: 'media',
      originalname: 'test.mp3',
      encoding: '7bit',
      mimetype: 'audio/mpeg',
      destination: '/Users/longnc/Projects/interviews/the-martec/public/assets',
      filename: '1638778378080_test.mp3',
      path: '/Users/longnc/Projects/interviews/the-martec/public/assets/1638778378080_test.mp3',
      size: 1817248
    },
     */
  if (filePath.substr(-3, 3) === 'mp4') {
      // convert mp4 to mp3 then start transcript
      const mp3 = path.resolve(__dirname, '..', 'public', 'assets', Date.now() + '_' + 'mp4-convert.mp3');
      ffmpeg(filePath)
          .videoCodec('libx264')
          .audioCodec('libmp3lame')
          .duration('00:00:45')
          .on('error', err => {
              console.log('An error occurred: ' + err.message);
          })
          .on('end', () => {
              console.log('Processing finished !');
              fs.unlinkSync(filePath);
              handleSpeed(mp3, res);
          })
          .save(mp3);
  } else {
      handleSpeed(filePath, res);
  }
})
/**
 * handle speed to text
 * @param filePath
 * @param res
 */
const handleSpeed = (filePath, res) => {
    const speechClient = new speech.SpeechClient();
    console.log('filePath => ', filePath);
    const file = fs.readFileSync(filePath);
    const request = {
        audio: {
            content: file.toString('base64')
        },
        config: {
            encoding: 'MP3',
            sampleRateHertz: 24000,
            languageCode: 'en-US',
            enableAutomaticPunctuation: true,
            model: 'default'
        }
    };
    speechClient
        .recognize(request)
        .then((data) => {
            const results = _.get(data[0], 'results', []);
            const transcription = results
                .map(result => {
                    return result.alternatives[0].transcript
                })
                .join('\n');
            console.log(`Transcription: ${transcription}`);
            fs.unlinkSync(filePath);
            res.render('index', {
                title: 'Demo Extract Media | Speed To Text',
                transcript: transcription
            });
        })
        .catch(err => {
            console.error('ERROR:', err);
            res.render('index', {
                title: 'Demo Extract Media | Speed To Text',
                transcript: err
            });
        });
}

module.exports = router;
