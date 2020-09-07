var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var moment = require('moment-timezone');
var datautils = require('date-utils');
const { response } = require('express');

var knex = require('knex')({
  dialect:'sqlite3',
  connection:{
    filename:'ikisaki.sqlite3'
  },
  useNullAsDefault: true
});

var Bookshelf = require('bookshelf')(knex);

var Userdata = Bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
});

router.get('/', function(req, res, next) {

  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }

    var usertabledata = new Array();

    new Userdata()
    .fetchAll()
    .then((collection) => {
        var content = collection.toArray();

        content.forEach(element => {

            var d1 = moment(new Date(element.attributes.updated_at));
                d1.locale('ja');
                d1.tz('Asia/Tokyo');
            var dstr = d1.fromNow();

            usertabledata.push({
                id: element.attributes.id,
                name : element.attributes.name,
                information : element.attributes.information,
                status : element.attributes.status,
                ikisaki : element.attributes.ikisaki,
                time : element.attributes.time,
                memo : element.attributes.memo,
                updateTime : dstr
            });  
        });

        var data = {
            title: '行先情報一覧',
            usertabledata: usertabledata
        };
        res.render('index', data);
    }).catch((err) => { 
    res.status(500).json({error: true, data: {message: err.message}});
    });

});

module.exports = router;