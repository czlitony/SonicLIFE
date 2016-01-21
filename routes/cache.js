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

module.exports = Cache;