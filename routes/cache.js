function Cache(){
    this.cache = {};
};

Cache.prototype.save = function(key, obj) {
    this.cache[key] = obj;
}

Cache.prototype.restore = function(key) {
    try{
        return this.cache[key];
    }catch(e){
        return null;
    }
}

Cache.prototype.hasUser = function(username){
    key = Object.keys(this.cache);
    var found = false;
    var ptr = null;
    key.forEach(function(item){
        if(this.cache[item]['username'] == username){
            found = true;
            ptr = item;
            return;
        }
    },this);

    //This is dangerous, because if forEach callback doesn't wait, or run slower
    //, then found will be a wrong result.
    if(found){
        return ptr;
    }

    return null;
}

Cache.prototype.delete = function(key) {
    // body...
    delete this.cache[key];
};

Cache.prototype.dump = function() {
    // body...
    console.log(this.cache);
};

Cache.prototype.hasKey = function(key) {
    return this.cache.hasOwnProperty(key);
}

//Singleton
var cache = new Cache();
module.exports.cache = cache;