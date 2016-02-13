var APITester = require("./client").APITester;

var test = require('unit.js');

var api = new APITester();

function check_logon_resp(data){
    test.should(data).be.a.Object;
    test.should(data).have.ownProperty('authenticated');
    test.should(data).have.ownProperty('role');
    test.should(data).have.ownProperty('username');
};

function check_logon_get_resp(data){
    test.should(data).be.a.Object;
    test.should(data).have.ownProperty('authenticated');
    test.should(data).have.ownProperty('username');
}

var targets = new Set();
var username = "admin",
    password = "password";

targets.add(["register POST", "/__api__/logon/register", "POST", api.logonID, {'username':username, "password":password}, 'text/plain; charset=utf-8', undefined]);
targets.add(["logon POST", "/__api__/logon", "POST", api.logonID, {'username':username, "password":password}, 'application/json; charset=utf-8', check_logon_resp]);
targets.add(["logon GET", "/__api__/logon", "GET", api.logonID, undefined, 'application/json; charset=utf-8', check_logon_get_resp]);
targets.add(["logout DELETE", "/__api__/logon", "DELETE", api.logonID, undefined, 'text/plain; charset=utf-8', undefined]);

api.test_all(targets);