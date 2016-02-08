var APITester = require("./client").APITester;

var test = require('unit.js');

var api = new APITester();

function check_register_resp(data){
    test.should(data).be.a.Object;
    test.should(data).have.ownProperty('status');
};

function check_logon_resp(data){
    test.should(data).be.a.Object;
    test.should(data).have.ownProperty('session_id');
};

function check_logon_get_resp(data){
    test.should(data).be.a.Object;
    test.should(data).have.ownProperty('authenticated');
    test.should(data).have.ownProperty('username');
}

var targets = new Set();
var username = "user",
    password = "password";

targets.add(["register POST", "/__api__/logon/register", "POST", api.logonID, {'username':username, "password":password}, check_register_resp]);
targets.add(["logon POST", "/__api__/logon", "POST", api.logonID, {'username':username, "password":password}, check_logon_resp]);
targets.add(["logon GET", "/__api__/logon", "GET", api.logonID, undefined, check_logon_get_resp]);
targets.add(["logout DELETE", "/__api__/logon", "DELETE", api.logonID, undefined, undefined]);

api.test_all(targets);