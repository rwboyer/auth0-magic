var app = new (require('express'))();
var bodyParser = require('body-parser');
var wt = require('webtask-tools');
var sql = require('mysql@2.7.0');
var _ = require('lodash');

var connection = sql.createConnection({
  host: '64.64.1.216',
  user: 'magic_remote',
  password: 'dicnet',
  database: 'magic_coupons'
})

connection.connect();

const RESPONSE = {
  OK : {
    statusCode : 200,
    message: "You have successfully subscribed to the newsletter!",
  },
  DUPLICATE : {
    status : 400,
    message : "You are already subscribed."
  },
  ERROR : {
    statusCode : 400,
    message: "Something went wrong. Please try again."
  },
  UNAUTHORIZED : {
    statusCode : 401,
    message : "You must be logged in to access this resource."
  }
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/subscribers', function(req,res){
  console.log(req.webtaskContext.user);
  console.log(req.webtaskContext.accessToken);
  org_id = req.webtaskContext.user['http://magiccarwashinc.com/group'];
  connection.query("SELECT * FROM coupons WHERE org_id = ?", [org_id], function(err, results, fields){
    console.log(results);
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify(results));
});
/*   
    req.webtaskContext.storage.get(function(err, data){
      if(!err){
        res.writeHead(200, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json'})
        res.end(JSON.stringify(RESPONSE.ERROR))
      }
  });
 */
});

app.post('/subscribe', function(req, res){
  //console.log(req.webtaskContext.user);
  //console.log(req.webtaskContext.body);
  console.log(req.body);
  var email = req.body.email;

  if(email){
    req.webtaskContext.storage.get(function(err, data){
      if(err){
        res.writeHead(400, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.ERROR));
      }
      
      data = data || [];
      
      if(_.indexOf(data, email) == -1){
        data.push(email);
        req.webtaskContext.storage.set(data, function(err){
          if(err){
            res.writeHead(400, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.ERROR));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify(RESPONSE.OK));
          }
        })
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.DUPLICATE));
      }
    })
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify(RESPONSE.ERROR));
  }
})

app.post('/', function (req, res) {
    var body = req.webtaskContext.body;
    if(body.message){
        client.sendMessage({
          to:'+17027854119',
          from: '+17026609897', 
          body: body.message
        }, function(err, responseData) {
          if(!err){
            res.end(JSON.stringify(RESPONSE.OK));
          } else {
            res.end(JSON.stringify(RESPONSE.ERROR));
          }
        });
    } else {
      res.end(JSON.stringify(RESPONSE.ERROR));
    }
});

module.exports = wt.fromExpress(app).auth0({
  exclude : [
    '/subscribe'
  ],
  scope : 'user_metadata',
  loginError: function (error, ctx, req, res, baseUrl) {
        console.log(error);
        res.writeHead(401, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(RESPONSE.UNAUTHORIZED));
    }
});

/*
var _ = require('lodash');

const RESPONSE = {
  OK : {
    status : "ok",
    message: "You have successfully subscribed to the newsletter!",
  },
  DUPLICATE : {
    status : "error",
    message : "You are already subscribed."
  },
  ERROR : {
    status : "error",
    message: "Something went wrong. Please try again."
  }
};

module.exports = function(context, cb){
  var email = context.query.email;

  if(email){
    context.storage.get(function(err, data){
      if(err){
        cb(null, RESPONSE.ERROR);
      }

      data = data || [];
      
      if(_.indexOf(data, email) == -1){
        data.push(email);
        context.storage.set(data, function(err){
          if(err){
            cb(null, RESPONSE.ERROR);
          } else {
            cb(null, RESPONSE.OK);
          }
        })
      } else {
        cb(null, RESPONSE.DUPLICATE);
      }
    })
  } else {
    cb(null, RESPONSE.ERROR)
  }
};
*/