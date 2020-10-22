var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var moment = require('moment-timezone');
var datautils = require('date-utils');
const { response } = require('express');
const { get } = require('./login');

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

var contactdata = Bookshelf.Model.extend({
  tableName: 'contact',
});

var departmentdata = Bookshelf.Model.extend({
  tableName: 'department_list',
});

var datadepartment;
function getDepartment(){
  new departmentdata().fetchAll().then((collection) => {
    datadepartment = collection.toArray();
  }).catch((err) => { 
    response.status(500).json({error: true, data: {message: err.message}});
  }); 
  
  return datadepartment;
}

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

var datacontact;
function getMsg(){

  new contactdata().where('id','=', 1)
    .fetch()
    .then((record) => {
      datacontact = record.attributes.msg;
    });

  return datacontact;

}

//SQL router.GETはここから
var db = new sqlite3.Database('ikisaki.sqlite3')
router.get('/', function(req, res, next) {

  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }

  getStatus();
  getKyakusaki();
  getShanai();
  getMsg();
  getDepartment();

  var usertabledata = new Array();
  var login = req.session.login;

  var sql = 'SELECT * , CASE WHEN department = "' + login.department + '" THEN "AA" ELSE department END as sort1, CASE WHEN name = "' + login.name + '" THEN "00" ELSE name END as sort2 FROM users ORDER BY sort1,sort2 ASC;';
  Bookshelf.knex.raw(sql).then((collection) => { 

    collection.forEach(element => {
      console.log("element : " + element);
      var d1 = moment(new Date(element.updated_at));
          d1.locale('ja');
          d1.tz('Asia/Tokyo');
      var dstr = d1.fromNow();

      usertabledata.push({
        id: element.id,
        name: element.name,
        information: element.information,
        department: element.department,
        status: element.status,
        ikisaki: element.ikisaki,
        time: element.time,
        memo: element.memo,
        email: element.email,
        updateTime : dstr
      });

  });

  var data = {
    title: '行先情報一覧',
    finding : '名前または部署名などを入力',
    login: req.session.login,
    usertabledata: usertabledata,
    datastatus: datastatus,
    datakyakusaki: datakyakusaki,
    datashanai: datashanai,
    msg: datacontact,
    datadepartment: datadepartment
  };

  res.render('index', data);   
  
  });

  // new Userdata().where({id: 0})
  //   .fetch()
  //   .then((collection) => {         

  //     db.serialize(()=> {
    
  //       var sql = 'SELECT * , CASE WHEN department = "' + login.department + '" THEN "AA" ELSE department END as sort1, CASE WHEN name = "' + login.name + '" THEN "00" ELSE name END as sort2 FROM users ORDER BY sort1,sort2 ASC;';

  //       db.all(sql, [], (err, rows)=> {
  //         console.log('db.all(sql, [], (err, rows)開始');
  //         console.log("sql: " + sql);
  //         if (!err) {
    
  //           rows.forEach(element => {
    
  //               var d1 = moment(new Date(element.updated_at));
  //                   d1.locale('ja');
  //                   d1.tz('Asia/Tokyo');
  //               var dstr = d1.fromNow();
    
  //               usertabledata.push({
  //                 id: element.id,
  //                 name: element.name,
  //                 information: element.information,
  //                 department: element.department,
  //                 status: element.status,
  //                 ikisaki: element.ikisaki,
  //                 time: element.time,
  //                 memo: element.memo,
  //                 email: element.email,
  //                 updateTime : dstr
  //               });
    
  //           });
    
  //           var data = {
  //             title: '行先情報一覧',
  //             finding : '名前または部署名などを入力',
  //             login: req.session.login,
  //             usertabledata: usertabledata,
  //             datastatus: datastatus,
  //             datakyakusaki: datakyakusaki,
  //             datashanai: datashanai,
  //             msg: datacontact,
  //             datadepartment: datadepartment
  //           };
    
  //           res.render('index', data);
    
  //         }
          
  //       })
  //     });

  //   });

});

//SQL router.getはここまで


//Bookshelf router.getはここから
// router.get('/', function(req, res, next) {

//   if (req.session.login == null) {
//     res.redirect('/login');
//     return;
//   }

//   getStatus();
//   getKyakusaki();
//   getShanai();
//   getMsg();
//   getDepartment();

//   var usertabledata = new Array();

//   new Userdata().orderBy('department','ASC')
//     .fetchAll()
//     .then((collection) => {
//         var content = collection.toArray();
//         console.log('datacontact' + datacontact);
//         console.log('datadepartment' + datadepartment);
        
//         content.forEach(element => {

//             var d1 = moment(new Date(element.attributes.updated_at));
//                 d1.locale('ja');
//                 d1.tz('Asia/Tokyo');
//             var dstr = d1.fromNow();

//             usertabledata.push({
//                 id: element.attributes.id,
//                 name: element.attributes.name,
//                 information: element.attributes.information,
//                 department: element.attributes.department,
//                 status: element.attributes.status,
//                 ikisaki: element.attributes.ikisaki,
//                 time: element.attributes.time,
//                 memo: element.attributes.memo,
//                 email: element.attributes.email,
//                 updateTime : dstr
//             });
//         });

//         var data = {
//             title: '行先情報一覧',
//             finding : '名前または部署名などを入力',
//             login: req.session.login,
//             usertabledata: usertabledata,
//             datastatus: datastatus,
//             datakyakusaki: datakyakusaki,
//             datashanai: datashanai,
//             msg: datacontact,
//             datadepartment: datadepartment
//         };
//         res.render('index', data);
//     }).catch((err) => { 
//     res.status(500).json({error: true, data: {message: err.message}});
//     });

// });
//Bookshelf router.getはここまで

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
  getMsg();
  getDepartment();

  var usertabledata = new Array();
  var find_content = req.body.find;
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
                email: element.attributes.email,
                updateTime : dstr
            });  

        });

        var data = {
          title: '“' + find_content + '”の検索結果',
          finding : '状態、行先、メモ内容などでも検索可能',
          usertabledata: usertabledata,
          datastatus: datastatus,
          datakyakusaki: datakyakusaki,
          datashanai: datashanai,
          login: req.session.login,
          msg:datacontact,
          datadepartment: datadepartment
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
    admin: 0,
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

  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }

  var rec = {
    department: req.body.department,
    admin: req.body.newadmin_check_body,
    name: req.body.name,
    information: req.body.information,
    email: req.body.email,
    password: req.body.password
  }

  new Userdata(rec).save().then((model) => {
    res.redirect('/');
  });

});

// test SQL
//客先変更
router.post('/newkyakusaki', (req,res,next) => {

  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }

  console.log(req.body);
  db.serialize(()=> {
    var cnt = req.body.cnt;
    console.log("更新回数は：「 " + cnt + "+1 」回");

    for (var i=0; i<=cnt; i++ ) {
      var kyakusaki = req.body.kyakusaki[i];
      var id = req.body.id[i];
      console.log("変更先ID: 「" + id + "」、変更後：「" + kyakusaki + "」");

      if (kyakusaki.length == 0) {
        db.run('DELETE FROM kyakusaki_list WHERE id = ' + id);
        console.log("インデックス「" + i + "」の項目削除実行しました。");
      } else {
        var q = 'UPDATE kyakusaki_list SET kyakusaki = ?  WHERE id = ?';
        db.run(q, kyakusaki, id);
        console.log("インデックス:「" + i + "」の項目を更新しました。");
      }
    }
    // 客先新規
    if (req.body.newkyakusaki == undefined || req.body.newkyakusaki.length == 0) {
      res.redirect('/');
      console.log("追加項目無し、リダイレクト。");
      return false;
    }

    console.log("新項目数は：「" + req.body.newkyakusaki.length + "」");
    if (Array.isArray(req.body.newkyakusaki)) {
      for (var n=0; n<req.body.newkyakusaki.length; n++) {
        var newkyakusaki = req.body.newkyakusaki[n];
        console.log("req.body.newkyakusaki[" + n + "]：" + req.body.newkyakusaki[n]);
        if (newkyakusaki.length == 0) {
          console.log("該当項目は空であるため、追加しません。");
        } else {
          db.run('INSERT INTO kyakusaki_list (kyakusaki) values (?)',newkyakusaki);
          console.log("追加した項目：" + newkyakusaki);
        }
      }
      console.log("配列追加完了したのでリダイレクト。");
      res.redirect('/');
      return false;
    } else {
      var newkyakusaki = req.body.newkyakusaki;
      db.run('INSERT INTO kyakusaki_list (kyakusaki) values (?)',newkyakusaki);
      console.log("単項目：「" + newkyakusaki + "」の追加完了したのでリダイレクト。");
      res.redirect('/');
      return false;
    }
  })
  
})

//部署変更
router.post('/newdepartment', (req,res,next) => {

  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }

  console.log(req.body);
  db.serialize(()=> {
    var cnt = req.body.cnt;
    console.log("更新回数は：「 " + cnt + "+1 」回");

    for (var i=0; i<=cnt; i++ ) {
      var department = req.body.department[i];
      var id = req.body.id[i];
      console.log("変更先ID: 「" + id + "」、変更後：「" + department + "」");

      if (department.length == 0) {
        db.run('DELETE FROM department_list WHERE id = ' + id);
        console.log("インデックス「" + i + "」の項目削除実行しました。");
      } else {
        var q = 'UPDATE department_list SET department = ?  WHERE id = ?';
        db.run(q, department, id);
        console.log("インデックス:「" + i + "」の項目を更新しました。");
      }
    }
    // 客先新規
    if (req.body.newdepartment == undefined || req.body.newdepartment.length == 0) {
      res.redirect('/');
      console.log("追加項目無し、リダイレクト。");
      return false;
    }

    console.log("新項目数は：「" + req.body.newdepartment.length + "」");
    if (Array.isArray(req.body.newdepartment)) {
      for (var n=0; n<req.body.newdepartment.length; n++) {
        var newdepartment = req.body.newdepartment[n];
        console.log("req.body.newdepartment[" + n + "]：" + req.body.newdepartment[n]);
        if (newdepartment.length == 0) {
          console.log("該当項目は空であるため、追加しません。");
        } else {
          db.run('INSERT INTO department_list (department) values (?)',newdepartment);
          console.log("追加した項目：" + newdepartment);
        }
      }
      console.log("配列追加完了したのでリダイレクト。");
      res.redirect('/');
      return false;
    } else {
      var newdepartment = req.body.newdepartment;
      db.run('INSERT INTO department_list (department) values (?)',newdepartment);
      console.log("単項目：「" + newdepartment + "」の追加完了したのでリダイレクト。");
      res.redirect('/');
      return false;
    }
  })
  
})

//社内ポジション変更
router.post('/newshanai', (req,res,next) => {

  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }
  console.log(req.body);
  db.serialize(()=> {
    var cnt_shanai = req.body.cnt_shanai;
    console.log("更新回数は：「" + cnt_shanai + "+1」");

    for (var i=0; i<=cnt_shanai; i++ ) {
      var shanai = req.body.shanai[i];
      var id = req.body.id[i];
      console.log("変更先ID: 「" + id + "」、変更後：「" + shanai + "」");

      if (shanai.length == 0) {
        db.run('DELETE FROM shanai_list WHERE id = ' + id);
        console.log("インデックス「" + i + "」の項目削除実行しました。");
      } else {
        var q = 'UPDATE shanai_list SET shanai = ?  WHERE id = ?';
        db.run(q, shanai, id);
        console.log("インデックス:「" + i + "」の項目を更新しました。");
      }
    }
    // 社内ポジション新規
    if (req.body.newshanai == undefined || req.body.newshanai.length == 0) {
      console.log("追加項目無し、リダイレクトする。");
      res.redirect('/');
      return false;
    }
    console.log("新項目数は：「" + req.body.newshanai.length + "」");
    if (Array.isArray(req.body.newshanai)) {
      for (var n=0; n<req.body.newshanai.length; n++) {
        var newshanai = req.body.newshanai[n];
        console.log("req.body.newshanai[" + n + "]：" + req.body.newshanai[n]);
        if (newshanai.length == 0) {
          console.log("該当項目は空であるため、追加しません。");
        } else {
          db.run('INSERT INTO shanai_list (shanai) values (?)',newshanai);
          console.log("追加した項目：" + newshanai);
        }
      }
      console.log("配列追加完了したのでリダイレクト。");
      res.redirect('/');
      return false;
    } else {
      var newshanai = req.body.newshanai;
      db.run('INSERT INTO shanai_list (shanai) values (?)',newshanai);
      console.log("単項目：「" + newshanai + "」の追加完了したのでリダイレクト。");
      res.redirect('/');
      return false;
    }
  })
  
})
// test over

//BUGあり　不採用
// router.post('/newkyakusaki', (req,res,next) => {

//   console.log(req.body);

//   var cnt = req.body.cnt;
//   console.log("インデックスは" + cnt);
//   for (var i=0; i<=cnt; i++) {
//     if (("" + req.body.kyakusaki[i]).length == 0) {
//       new kyakusakidata().where('id','=', req.body.id[i])
//       .fetch()
//       .then((record)=>{
//         record.destroy();
//         console.log(i + "の項目削除実行しました。");
//         res.datakyakusaki = getKyakusaki();
//       });
//     } else {
//       var update = {
//         kyakusaki: req.body.kyakusaki[i]
//       }
//       new kyakusakidata({id: req.body.id[i]})
//         .save(update ,{patch: true})
//         .then((result) => {
//           console.log(i + "の項目を更新しました。");
          
//       });
//     }
//   }
  
//   if ( ("" + req.body.newkyakusaki).length == 0 ) {
//     res.redirect('/');
//     console.log("追加項目は空なのでリダイレクトしました。");
//   } else { 
//     var rec = {
//       kyakusaki: req.body.newkyakusaki
//     }
//     new kyakusakidata(rec).save().then((model) => {
//       res.redirect('/');
//       console.log("追加項目を追加し、リダイレクトしました。");
//     });
//   }
    
// });

router.post('/newuserinfo', (req,res,next) => {

  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }
  console.log(req.body);

  var rec = {
    name: req.body.userinfo_name,
    department:  req.body.userinfo_department,
    information: req.body.userinfo_information,
    email: req.body.userinfo_email,
    password: req.body.userinfo_newpassword
  }
  new Userdata({id: req.session.login.id})
    .save(rec ,{patch: true})
    .then((result) => {
      console.log(req.session.login.name + "の基本情報を更新しました：" + req.body.userinfo_name + "; " + req.body.userinfo_department + "; " + req.body.userinfo_information + "; " + req.body.userinfo_newpassword + "; result.attributes.name：" + result.attributes.name);
      res.redirect('/logout');
      console.log("更新完了；ログアウト。");
  });

});

//まとめ編集
router.post('/editing', (req,res,next) => {
  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }
  console.log(req.body);

  for (var i=0; i<req.body.editing_id.length; i++ ){

    if (req.body.ikisaki == undefined || req.body.ikisaki.length == 0){
      req.body.ikisaki = '／';
    }
    if (req.body.time == undefined || req.body.time.length == 0){
      req.body.time = '／';
    }

    var rec = {
      status: req.body.status,
      ikisaki: req.body.ikisaki,
      time: req.body.time,
      memo: req.body.memo
    }
    new Userdata({id: req.body.editing_id[i]})
    .save(rec ,{patch: true})
    .then((result) => {
      console.log('更新しました。');
    });
  }
  res.redirect('/');
  
});

router.get('/logout', function(req, res){
  req.session.login = null;
  res.redirect('/login');
});

router.post('/contact', (req,res,next) => {
  if (req.session.login == null) {
    res.redirect('/login');
    return;
  }

  console.log("req.body = " + req.body.msg);
  var rec = {
    msg: req.body.msg,
  }
  new contactdata({id: 1})
  .save(rec ,{patch: true})
  .then((result) => {
    console.log('更新しました。');
  });
  
  res.redirect('/');
  });

module.exports = router;