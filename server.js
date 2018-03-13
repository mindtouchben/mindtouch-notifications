const express = require('express');
const request = require('request');

var mysql = require('mysql');
var bodyParser = require('body-parser');
var cors = require('cors');

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

app.use(express.static('static'));
app.use(bodyParser.json({limit: '50mb'}));

app.use(cors());

var subscriptions = require('./routes/subscriptions');
var notify = require('./routes/notify');

app.use('/@api/subscriptions', subscriptions(connection));
app.use('/@api/notify', notify(connection));

app.listen(port, ()=> {
    console.log(`Server is up on port ${port}`);
});
