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

function check_data (data) {
    // body...
    console.log(data);
}

var targets = new Set(),
    username = "admin",
    password = "password";

targets.add(["logon admin", "/__api__/logon", "POST", api.logonID, {'username':username, "password":password}, 'application/json; charset=utf-8', undefined]);
targets.add(["add menu", "/__api__/menu", "POST", api.logonID, {'vender':"vender1", "dish":"dish1"}, 'application/json; charset=utf-8', check_data]);
targets.add(["add menu", "/__api__/menu", "POST", api.logonID, {'vender':"vender1", "dish":"dish2"}, 'application/json; charset=utf-8', undefined]);
targets.add(["add menu", "/__api__/menu", "POST", api.logonID, {'vender':"vender2", "dish":"dish1"}, 'application/json; charset=utf-8', undefined]);
targets.add(["add menu", "/__api__/menu", "POST", api.logonID, {'vender':"vender2", "dish":"dish2"}, 'application/json; charset=utf-8', undefined]);
targets.add(["add rate", "/__api__/menu/q/vender2/dish1/rate", "PUT", api.logonID, {'rate' : 2}, 'text/plain; charset=utf-8', undefined]);


targets.add(["all menu", "/__api__/menu", "GET", api.logonID, undefined, 'application/json; charset=utf-8', check_menu_resp]);
targets.add(["by vender", "/__api__/menu/q/vender1", "GET", api.logonID, undefined, 'application/json; charset=utf-8', check_menu_resp]);
targets.add(["by vender and dish_name", "/__api__/menu/q/vender1/dish1", "GET", api.logonID, undefined, 'application/json; charset=utf-8', check_menu_resp]);

api.test_all(targets);