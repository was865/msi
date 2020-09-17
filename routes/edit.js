var express = require('express');
var router = express.Router();
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
})


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


/* GET home page. */
router.get('/:id', function(req, res, next) {

  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }

 
  getStatus();
  getKyakusaki();
  getShanai();

  new Userdata()
    .where('id','=', req.params.id)
    .fetch()
    .then((collection) => {
      var d1 = moment(new Date(collection.attributes.updated_at));
        d1.locale('ja');
        d1.tz('Asia/Tokyo');
      var dstr = d1.fromNow();
      var data = {
        title: '行先情報',
        subtitle: '編集...',
        login: req.session.login,
        greeting:'前回のアップデート: ' + dstr,
        content: collection.attributes ,
        datastatus: datastatus,
        datakyakusaki: datakyakusaki,
        datashanai: datashanai
      };
      res.render('edit', data);
    }).catch((err) => { 
      res.status(500).json({error: true, data: {message: err.message}});
    });

});

router.post('/:id', function(req, res, next) {

  getStatus();
  getKyakusaki();
  getShanai();
    
  if (req.body.status == '' ||  req.body.status == '在席' || req.body.status == '帰宅')　{
    req.body.ikisaki = '／' ;
    req.body.time = '／' ;
  } else if (req.body.status == '出張' || req.body.status == '研修' || req.body.status == 'その他') {
    req.body.ikisaki = '／' ;
  }else if (req.body.status == '休暇') {
    req.body.time = '／' ;
  }

  var rec = {
    name: req.body.name,
    information: req.body.information,
    status: req.body.status,
    ikisaki: req.body.ikisaki,
    time: req.body.time,
    memo: req.body.memo
  }
  console.log('更新レコード' + rec);
 
  new Userdata({id:req.body.id}).save(rec).then((model) => {
    var d2 = new Date(model.attributes.updated_at);
    var dstr = d2.toFormat('YYYY年M月D日 HH24時MI分SS秒');
    var data = {
      title: '行先情報',
      subtitle: '編集済み。',
      greeting: dstr + 'に更新。',
      content: model.attributes,
      datastatus: datastatus,
      datakyakusaki: datakyakusaki,
      datashanai: datashanai,
      login: req.session.login
    };
    res.render('edit', data);
  });
});

router.post('/:id/delete', function(req,res,next) {
  new Userdata().where('id','=', req.body.id)
    .fetch()
    .then((record)=>{
      record.destroy();
    })
    .then((result)=>{
      res.redirect('/');
    });
  });

module.exports = router;
