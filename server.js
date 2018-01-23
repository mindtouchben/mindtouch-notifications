const express = require('express');
const request = require('request');

var mysql = require('mysql');
var bodyParser = require('body-parser');

const port = process.env.PORT || 3000; 

var app = express();

var connection = mysql.createConnection({
    host     : 'mindtouch-notification.cf2e9ubr6tb7.us-east-1.rds.amazonaws.com',
    user     : process.env.SQL_USERNAME,
    password : process.env.SQL_PASSWORD,
    database : 'mt-notifcations'
});

connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);
});

app.use(bodyParser.json({limit: '50mb'}));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://benr-demo.mindtouch.us');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var subscriptions = require('./routes/subscriptions');
var notify = require('./routes/notify');

app.get('/', (req, res) => {

});

app.use('/@api/subscriptions', subscriptions(connection));
app.use('/@api/notify', notify(connection));

app.listen(port, ()=> {
    console.log(`Server is up on port ${port}`);
});
