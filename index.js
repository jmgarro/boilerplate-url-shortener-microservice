require('dotenv').config();
let bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use("/public", express.static(__dirname + '/public'));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
let urlDatabase = {};
let id = 1;

function isValidHttpUrl(url) {
  try {
    const parsed = new URL(url);
    console.log(parsed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (err) {
    return false;
  }
}

// POST handler
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  console.log(originalUrl);
  if (!isValidHttpUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Optional DNS check (not strictly required by FCC now)
  const hostname = urlParser.parse(originalUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const shortUrl = id++;
      urlDatabase[shortUrl] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    }
  });
});

// GET handler
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
