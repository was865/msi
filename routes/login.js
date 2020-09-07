var express = require('express');
const { Result } = require('express-validator');
var router = express.Router();

var knex = require('knex')({
  dialect:'sqlite3',
  connection:{
    filename: 'ikisaki.sqlite3'
  },
  useNullAsDefault: true
});

var Bookshelf = require('bookshelf')(knex);

var Userdata = Bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
});

router.get('/', (req, res, next) => {
    var data = {
        title:'login',
        form:{name:'', password:''},
        content: '<p class="login_info">名前とパスワードを入力してください。</p>'
    }
    res.render('login', data);
});

router.post('/', (req, res, next) => {
    var request = req;
    var response = res;
    req.check('login_nm','名前は必ず入力してください。').notEmpty();
    req.check('password','パスワードは必ず入力してください。').notEmpty();
    req.getValidationResult().then((result) => {
        if (!result.isEmpty()) {
            var content = '<ul class="error login_info">';
            var result_arr = result.array();
            for ( var n in result_arr) {
                content += '<li>' + result_arr[n].msg + '</li>'
            }
            content += '</ul>';
            var data = {
                title: 'Login',
                content: content,
                form: req.body
            }
            response.render('login', data);
        } else {
            var nm = req.body.login_nm;
            var pw = req.body.password;

            Userdata.query({where: {name: nm}, andWhere: {password: pw}})
            .fetch()
            .then((model) => {
                if (model == null) {
                    var data = {
                        title: '再入力',
                        content: '<p class="error login_info">名前またはパスワードが違います。</p>',
                        form: req.body
                    }
                    response.render('login', data);
                } else {
                    request.session.login = model.attributes;
                    var data = {
                        title: 'Login',
                        content:'<p class="login_info">ログインしました！</p>',
                        form: req.body,
                        login:request.session.login
                    }
                    response.redirect('/');
                }
            });
        }
    })
});

module.exports = router;