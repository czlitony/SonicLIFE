var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');  
// var session = require('express-session');

//This is just used for test, we will replace it with Redis or mongo
GLOBAL_CACHE = {};

router.use(function(req, res, next){
    
    //input check
    console.log(req.method);
    if(req.method == 'POST'){
        console.log("get a post request");
    }else if(req.method == 'GET'){
        console.log("get a get request");
    }
    next();
});


router.post('/', function(req, res, next) {
  result = {
    'session_id' : uuid.v1()
  }
  GLOBAL_CACHE[result['session_id']] = {'state': true };
  console.log(GLOBAL_CACHE);
  res.json(result);

});

router.get('/:id', function(req, res, next){
    
    id = req.params.id;
    req['test_my'] = "abc";
    if(id === undefined){
        console.log('create a new session');
        
    }else{
        console.log('restore my session');
        console.log(req.params.id);
        if (req.params.id in GLOBAL_CACHE){
            req["state"] = GLOBAL_CACHE[req.params.id]['state'];
        }else{
            console.log("can't restore a session");
        }
    }
    
    next();
}, function(req, res, next) {
    console.log(req.params.id);
    //res.send(req.params.id);
    res.send(req['state']);
})

module.exports = router;