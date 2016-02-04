var APITester = require("./client").APITester;

var test = require('unit.js');

var api = new APITester();

function check_menu_resp(data){
    test.should(data).be.a.Array;
    data.forEach(function(item){
        test.should(item).have.ownProperty('_id');
        test.should(item).have.ownProperty('vender');
        test.should(item).have.ownProperty('dish');
        test.should(item).have.ownProperty('rate');
        
        test.should(item['rate']).have.ownProperty('times');
        test.should(item['rate']).have.ownProperty('result');

    });
};

var targets = new Set(),
    username = "admin",
    password = "password";

targets.add(["logon admin", "/__api__/logon", "POST", {'username':username, "password":password}, undefined]);
targets.add(["add menu", ["/__api__/admin/", api.logonID, "/menu/add"], "POST", {'vender':"vender1", "dish":"dish1"}, undefined]);
targets.add(["add menu", ["/__api__/admin/", api.logonID, "/menu/add"], "POST", {'vender':"vender1", "dish":"dish2"}, undefined]);
targets.add(["add menu", ["/__api__/admin/", api.logonID, "/menu/add"], "POST", {'vender':"vender2", "dish":"dish1"}, undefined]);
targets.add(["add menu", ["/__api__/admin/", api.logonID, "/menu/add"], "POST", {'vender':"vender2", "dish":"dish2"}, undefined]);


targets.add(["all menu", "/__api__/menu", "GET", undefined, check_menu_resp]);
targets.add(["by vender", "/__api__/menu", "GET", undefined, check_menu_resp]);
targets.add(["by vender and dish_name", "/__api__/menu", "GET", undefined, check_menu_resp]);

api.test_all(targets);