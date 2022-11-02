require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongo = require('mongodb');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const shortid = require('shortid')

// Basic Configuration
const port = process.env.PORT || 3000;

// Set up mongoose
let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// body-parser to Parse POST Requests
app.use(bodyParser.urlencoded({extended: false}))

// Create a Model
let urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
})

// Create and Save URL */
let URL = mongoose.model('URL', urlSchema);


app.post('/api/shorturl', async function(req, res) {
  // get input and generate id
  const url = req.body.url
  const short_id = shortid.generate()

  //check if input is valid
  if (!validUrl.isWebUri(url)) {
   res.json({ error: 'invalid url' })
  }
  else {
    try {
      // check if it is already in database
      let findOneByUrl = await URL.findOne({original_url: url})
      // if it's already in database, display URL info
      if ( findOneByUrl ) {
        res.json( {original_url: findOneByUrl.original_url, short_url: findOneByUrl.short_url})
      }
      else {
        // if not in database, create new url and save
        findOneByUrl = new URL({original_url: url, short_url: short_id});
        await findOneByUrl.save()
        res.json( {original_url: findOneByUrl.original_url , short_url: findOneByUrl.short_url })
      }
    }
    catch (err) {
      console.error(err);
      res.json('Server error...')
    }
  }
})

app.get('/api/shorturl/:short_url', async function(req, res) {
  // get short_url in url params  
  let short_url = req.params.short_url
  try {
    // check if it is already in database
    const findOneByCode = await URL.findOne({short_url: short_url})
    if (findOneByCode) {
      res.redirect(findOneByCode.original_url)
    }
    // if not in database
    else {
      res.json('No URL found')
    }
  }
  catch (err) {
      console.error(err);
      res.json('Server error')
  }
})
  
  
  


  
