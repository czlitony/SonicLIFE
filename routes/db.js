var MongoClient = require('mongodb').MongoClient

// Connection URL
var url = 'mongodb://localhost:27017/sonicwall';
var option = {'server': {'poolSize':5} };

DataBase = function(){
    /*    
    If we call insert or other function too early, it will
    lead to a db not function issue, because this is a non-block
    call, so when insert invoked, the connection is not ready yet.
    */
    MongoClient.connect(url, option, function(err, database) {
        console.log("Connected correctly to server");
        this.db = database;
        this.db.createCollection('user');
        this.db.createCollection('menu');
    }.bind(this));
}

DataBase.prototype.insert = function(collection, obj) {
    if(this.db === undefined){
        this.reconnect();
    }
    return this.db.collection(collection).insert(obj);
};

DataBase.prototype.reconnect = function() {
    MongoClient.connect(url, option, function(err, database) {
        console.log("Reconnected correctly to server");
        this.db = database;
    }.bind(this));
}

DataBase.prototype.close = function(){
    this.db.close();
}

DataBase.prototype.find = function(collection, target){
    if(this.db === undefined){
        this.reconnect();
    }
    return this.db.collection(collection).find(target);
}

DataBase.prototype.findDistinct = function(collection, key, query){
     if(this.db === undefined){
        this.reconnect();
    }
    return this.db.collection(collection).distinct(key, query);
}

DataBase.prototype.findOneAndUpdate = function(collection, filter, update, option){
     if(this.db === undefined){
        this.reconnect();
    }
    return this.db.collection(collection).findOneAndUpdate(filter, update, option);
}

DataBase.prototype.update = function(collection, selector, document, options){
     if(this.db === undefined){
        this.reconnect();
    }
    return this.db.collection(collection).update(selector, document, options);
}

DataBase.prototype.remove = function(collection, selector, options){
     if(this.db === undefined){
        this.reconnect();
    }
    return this.db.collection(collection).remove(selector, options);
}

var dataBase = new DataBase();

module.exports = dataBase;
// Use connect method to connect to the Server

// function test() {
//     dataBase.insert({'username':'abc', 'password':'abb'});
// }

// setTimeout(test, 1000);