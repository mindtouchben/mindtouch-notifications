const express = require('express');

var AWS = require('aws-sdk');
var fs = require('fs');

var router = express.Router();
AWS.config.update({
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET,
    region: 'us-east-1'});

function unquote(str, quoteChar) {
    quoteChar = quoteChar || "'";
    if (str[0] === quoteChar && str[str.length - 1] === quoteChar)
        return str.slice(1, str.length - 1);
    else return str;
    };
  

router.post('/', (req, res) => {
    var pageid = req.body.pageid;
    var pageurl = req.body.pageurl;
    var pageTitle = req.body.pageTitle;
    var lastUpdated = req.body.lastUpdated;
    var updateMessage = req.body.msg != undefined ? req.body.msg : '';

    console.log()

    if (pageid != undefined && pageurl != undefined && pageTitle != undefined) {
        // get all users by email subscribed to the page
        var query = `SELECT * FROM notifications WHERE pageid ='${pageid}' AND pageurl = "?"`;
        console.log(query);
        connection.query(query, [pageTitle], function (error, results, fields) {
            if (error) {
                console.log(error);
            } else {
                if (results.length > 0 && results[0].pageurl == pageurl) {
                    var emails = [];
                    for (var x in results) {
                        console.log('Sending email to:', results[x].email);

                        var template = fs.readFileSync(__dirname + '/../templates/email.html',{encoding:'utf-8'}).toString();

                        template = template.replace('{{username}}', results[x].username);
                        template = template.replace('{{update-date}}', lastUpdated);
                        template = template.replace('{{updateMessage}}', updateMessage);
                        template = template.replace('{{update-link}}', unquote(pageurl, "'"));
                        template = template.replace('{{update-pageTitle}}', unquote(pageTitle, "'"));
                        template = template.replace('{{update-pageTitle}}', unquote(pageTitle, "'"));

                        var params = {
                            Destination: { /* required */
                                ToAddresses: [results[x].email]
                            },
                            Message: { /* required */
                                Body: { /* required */
                                    Html: {
                                        Charset: "UTF-8",
                                        Data: template
                                    },
                                },
                                Subject: {
                                    Charset: 'UTF-8',
                                    Data: 'Test email'
                                }
                            },
                            Source: 'benr@mindtouch.com', /* required */
                            ReplyToAddresses: [
                                'benr@mindtouch.com'
                            ]
                        };   
                        // Create the promise and SES service object
                        var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
    
                        sendPromise.then(
                            function(data) {
                                console.log(data.MessageId);
                                
                                var query = `UPDATE notifications SET lastupdate = '${lastUpdated}' WHERE id = ${results[x].id};`
                                connection.query(query, function (error, results, fields) {
                                    console.log(error, results);
                                });
                            }
                        ).catch(
                            function(err) {
                                console.log(err, err.stack);
                                res.status(400).send()
                            }
                        )
                    }

                    res.send('All emails sent');

                    
                } else {
                    res.status(400).send('No records found');
                }
            }
        })
        

    } else {
        res.status(400).json({
            msg: 'Must supply as pageid and pageurl'
        })
    }
})

module.exports = (conn) => {
    connection = conn;   

    return router;
};