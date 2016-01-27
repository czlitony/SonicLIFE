var APITester = require("./client").APITester;

var test = require('unit.js');

var api = new APITester();

function check_register_resp(data){
    test.should(data).be.a.Object;
    test.should(data).have.ownProperty('session_id');
};

function check_logon_resp(data){
    test.should(data).be.a.Object;
    test.should(data).have.ownProperty('session_id');
};

var targets = new Set();
var username = "user2",
    password = "password";

targets.add(["register", "/__api__/logon/register", "POST", {'username':username, "password":password}, undefined]);
targets.add(["logon", "/__api__/logon", "POST", {'username':username, "password":password}, check_logon_resp]);
targets.add(["logout", ["/__api__/logon/", api.logonID, ""], "DELETE", undefined, undefined]);

api.test_all(targets);