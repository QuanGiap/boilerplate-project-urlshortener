require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
mongoose.connect(process.env.MONGODB_URL);
app.use(bodyParser.urlencoded({extended:true}))
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

const urlSchema = mongoose.Schema({
  url:{
    type:String,
    index:true,
  },
  shortUrl:{
    type:Number,
    index:true,
  },
})

const urlModel = new mongoose.model('URLShortener',urlSchema);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async function(req, res) {
  const {url=""} = req.body;
  console.log(url);
  if(!url||!isValidUrl(url)) return res.json({ error: 'invalid url' });
  const urlCheck = await urlModel.findOne({url});
  if(urlCheck){
    return res.json({original_url : url, short_url : urlCheck.shortUrl})
  }
  const count = await urlModel.find().count();
  await urlModel.create({url,shortUrl:count});
  res.json({original_url : url, short_url : count})
});

app.get('/api/shorturl/:short_url', async function(req, res) {
  const short_url = Number(req.params.short_url);
  const urlCheck = await urlModel.findOne({shortUrl:short_url});
  console.log(urlCheck);
  if(!urlCheck) return res.sendStatus(404);
  return res.redirect(urlCheck.url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
function isValidUrl(string) {
  try {
    const newUrl = new URL(string);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
}