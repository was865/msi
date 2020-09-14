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

var statusdata = Bookshelf.Model.extend({
  tableName: 'status_list',
});

var kyakusakidata = Bookshelf.Model.extend({
  tableName: 'kyakusaki_list',
});

var shanaidata = Bookshelf.Model.extend({
  tableName: 'shanai_list',
});

var datastatus;
function getStatus(){
  new statusdata().fetchAll().then((collection) => {
    datastatus = collection.toArray();
  }).catch((err) => { 
    response.status(500).json({error: true, data: {message: err.message}});
  }); 
  
  return datastatus;
}

var datakyakusaki;
function getKyakusaki(){

  new kyakusakidata().fetchAll().then((collection) => {
    datakyakusaki = collection.toArray();
  }).catch((err) => { 
    response.status(500).json({error: true, data: {message: err.message}});
  }); 

  return datakyakusaki;

}

var datashanai;
function getShanai(){

  new shanaidata().fetchAll().then((collection) => {
    datashanai = collection.toArray();
  }).catch((err) => { 
    response.status(500).json({error: true, data: {message: err.message}});
  }); 

  return datashanai;

}

router.get('/', function(req, res, next) {

  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }

  getStatus();
  getKyakusaki();
  getShanai();

    var usertabledata = new Array();

    new Userdata().orderBy('department')
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
                department: element.attributes.department,
                status : element.attributes.status,
                ikisaki : element.attributes.ikisaki,
                time : element.attributes.time,
                memo : element.attributes.memo,
                updateTime : dstr
            });  
        });

        var data = {
            title: '行先情報一覧',
            finding : '名前または部署名などを入力',
            usertabledata: usertabledata,
            datastatus: datastatus,
            datakyakusaki: datakyakusaki,
            datashanai: datashanai
        };
        res.render('index', data);
    }).catch((err) => { 
    res.status(500).json({error: true, data: {message: err.message}});
    });

});

router.post('/', (req,res,next) => {

  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }
  if (req.body.find == '') {
    res.redirect('/');
    return;
  }

  getStatus();
  getKyakusaki();
  getShanai();

  var usertabledata = new Array();

  new Userdata().orderBy('created_at','DESC')
    .query(function(find){
      find.where('department','like','%' + req.body.find +'%')
      .orWhere('name','like','%' + req.body.find +'%')
      .orWhere('status','like','%' + req.body.find +'%')
      .orWhere('ikisaki','like','%' + req.body.find +'%')
      .orWhere('information','like','%' + req.body.find +'%')
      .orWhere('time','like','%' + req.body.find +'%')
      .orWhere('memo','like','%' + req.body.find +'%');
    })
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
                department: element.attributes.department,
                status : element.attributes.status,
                ikisaki : element.attributes.ikisaki,
                time : element.attributes.time,
                memo : element.attributes.memo,
                updateTime : dstr
            });  

        });

        var data = {
          title: '検索結果',
          finding : '状態、行先、メモ内容などでも検索可能',
          usertabledata: usertabledata,
          datastatus: datastatus,
          datakyakusaki: datakyakusaki,
          datashanai: datashanai
      };
      res.render('index', data);
  }).catch((err) => { 
  res.status(500).json({error: true, data: {message: err.message}});
  });

})

router.post('/add', (req,res,next) => {

  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }

  var rec = {
    department: req.body.department,
    name: req.body.name,
    password: 1,
    information: req.body.information,
    status: req.body.status,
    ikisaki: req.body.ikisaki,
    time: req.body.time,
    memo: req.body.memo
  }
  console.log('新規登録レコード' + rec);

  new Userdata(rec).save().then((model) => {
    res.redirect('/');
  });

});

router.post('/newuser', (req,res,next) => {

  var rec = {
    department: req.body.department,
    name: req.body.name,
    password: req.body.password,
  }
  console.log('新規登録ユーザー' + rec);

  new Userdata(rec).save().then((model) => {
    res.redirect('/');
  });

});

router.get('/logout', function(req, res){
  req.session.login = null;
  res.redirect('/login');
});

module.exports = router;