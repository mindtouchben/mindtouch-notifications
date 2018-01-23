const express = require('express');
const _ = require('lodash');

var router = express.Router();

const { validate } = require('email-validator');

router.get('/', (req, res) => {
    var userid = req.query.userid;
    var useremail = req.query.useremail;
    var pageid = req.query.pageid;

    // verify email is valid

    if (userid != undefined && pageid != undefined){
        // get current user subscriptions to specific page
        var query = `SELECT * FROM notifications WHERE userid = '${userid}' AND pageid ='${pageid}' LIMIT 1`;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error);
            } else {
                if (results.length > 0 && results[0].email == useremail) {
                    res.json({
                        results,
                    })
                } else {
                    res.status(400).send('No records found');
                }
            }
        })
    } else if (userid != undefined) {
        // get all of current user subscriptions
        var query = `SELECT * FROM notifications WHERE userid = '${userid}'`;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error);
            } else {
                if (results.length > 0 && results[0].email == useremail) {
                    res.json({
                        results,
                    })
                } else {
                    res.status(400).send('No records found');
                }
            }
        })
    } else if (pageid != undefined) { 
        // return turn or false if someone is subscribed to the page

    } else {
        res.status(400).json({
            msg: 'Must supply an userid or userid and pageid'
        })
    }
});

router.post('/', (req, res) => {
    var userid = req.body.userid;
    var useremail = req.body.useremail;
    var pageid = req.body.pageid;
    var pageurl = req.body.pageurl;

    // verify email is valid
    if (userid != undefined && useremail != undefined && pageid != undefined && pageurl != undefined) {
        // verify subscriptions does not exsist
        var query = `SELECT * FROM notifications WHERE userid = '${userid}' AND pageid ='${pageid}' LIMIT 1`;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error);
            } else {
                if (results.length > 0 && results[0].email == useremail) {
                    res.status(400).send('Record already exsists');
                } else {
                    query = `INSERT INTO notifications (userid, email, pageid, pageurl) 
                        VALUES (${userid}, '${useremail}', ${pageid}, '${pageurl}');`
                        connection.query(query, function (error, results, fields) {
                            if (results.affectedRows > 0) {
                                res.send('Added new record');
                            } else {
                                res.send('Something went wrong');
                            }
                        })
                }
            }
        })
    } else {
        res.json(req.body);
    }
})

router.delete('/', (req, res) => {
    var subID = req.query.id;
    var userid = req.query.userid;

    if (userid != undefined && subID != undefined) {
        // remove data from data store
        var query = `DELETE FROM notifications WHERE userid = ${userid} AND id = '${subID}' LIMIT 1`;
        console.log(query);
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error);
            } else {
                if (results.affectedRows > 0) {
                    res.send('Deleted record');
                } else {
                    res.status(400).send('Something went wrong');
                }
            }
        })
    }

    
})

module.exports = (conn) => {
    connection = conn;   

    return router;
};