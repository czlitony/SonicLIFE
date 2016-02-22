var http = require('http');
var EventEmitter = require('events');
var test = require('unit.js');


function APITester(host, port){
    this.emitter = new EventEmitter();
    this.hostname = host || process.env.AUTH_TEST_APPLIANCE || "localhost";
    this.port = port || 3000;
    this.logonID = {};
};

//mocha need a "done" function to indicate if async callback has successufully complete.
APITester.prototype.invoke = function(path, method, cookie, data, done){

    var options = {
        host: this.hostname,
        port: this.port,
        path: path,
        method: method || "GET",
        rejectUnauthorized: false
    };

    if (data)
    {
        data = JSON.stringify(data,null,'\t');
        options.headers = { 'Content-Type': 'application/json',
                    'Content-Length': data.length };
    }
    
    if(cookie){
        if(cookie.session_id !== undefined){
            // console.log('session_id is:'+cookie.session_id);
            if(options.headers === undefined){
                options.headers = {};
            }
            options.headers['cookie'] = cookie.session_id;
        }
        console.log('request header: '+options.headers.cookie);
    }

    var req = http.request(options, function(response)
    {
        var response_data = '';
        //console.log(response.headers);

        var parse_json = true;
        if(response.headers['content-type'] == 'text/plain; charset=utf-8'){
            parse_json = false;
        }

        response.setEncoding('utf8');

        response.on('data', function (chunk) {
            response_data += chunk;
        });

        response.on('end', function () {


            if(done && typeof done === "function"){
                console.log(response_data);
                this._resp_callback(response.statusCode, 
                    response.headers, 
                    parse_json ? JSON.parse(response_data) : response_data, 
                    done);
            }else{
                this._resp_callback(response.statusCode, 
                    response.headers, 
                    parse_json ? JSON.parse(response_data) : response_data);
            }
            
        }.bind(this));
        //For each of ht call_back function, you have to bind to a this object,
        //In a callback function, it can't find the right object.
    }.bind(this));

    if (data){
        req.write(data);
    }

    req.end();
};

APITester.prototype._set_response = function(status_code, header, data){
    this.result = {};
    this.result.status_code = status_code;
    this.result.ctype = header['content-type'];
    this.result.data = data;
};

APITester.prototype._set_logonID = function(data){
    if(this.logonID !== undefined){
        this.logonID.session_id = data;
        console.log(this.logonID.session_id);
    }
};

APITester.prototype._resp_callback = function(status_code, header, data, done){
    
    this._set_response(status_code, header, data);
    console.log(header);
    if(header['set-cookie'] !== undefined){
        this._set_logonID(header['set-cookie'][0]);
    }
    done();
    // setTimeout(done,1000);
};

var TEST_NAME = 0;
var TEST_URI = 1;
var TEST_METHOD = 2;
var TEST_COOKIE = 3;
var TEST_BODY_DATA = 4;
var TEST_CTYPE = 5;
var TEST_CALLBACK = 6;


APITester.prototype._test_template = function (api, api_list){
    
    var title = "TEST API: " + api_list[TEST_NAME];
    
    //The whole describe block is non-blocking.
    describe(title, function(){

        //This is a async call, so give a "done" function to _resp_callback, so that callback can
        //notify "it" when it finishes.
        before("Start send async request", function(done){

            var url = api_list[TEST_URI];

            if(api_list[TEST_URI] instanceof Array){
                url = api_list[TEST_URI][0] + api_list[TEST_URI][1].session_id + api_list[TEST_URI][2];
            }
            console.log("URL: "+url);
            api.invoke(url, api_list[TEST_METHOD], api_list[TEST_COOKIE], api_list[TEST_BODY_DATA], done);
            api.url = url;
        });

        it("Check status code ", function(){
            test.should(api.result.status_code).be.a.Number;
            test.should(api.result.status_code).be.equal(200);
        });

        it("Check content type", function(){
            test.should(api.result.ctype).be.a.String;
            // test.should(api.result.ctype).be.equal('application/json');
            test.should(api.result.ctype).be.equal(api_list[TEST_CTYPE]);
            test.should(api.result.data).be.json;
        });

        it("Check response data", function(){
            if (api_list[TEST_CALLBACK]){
                api_list[TEST_CALLBACK](api.result.data);
            }
        });

        after("Clean up response", function(){
            //
        });

    });
}

APITester.prototype.test_all = function(target_set){
    target_set.forEach(function(item){
        this._test_template(this, item);
    }, this);
}

exports.APITester = APITester;
