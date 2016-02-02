'use strict';

var logger = require('./log').logger;

class Cache{
    constructor(){
        this.cache = {};
    }

    save(key, obj) {
        this.cache[key] = obj;
    }
    
    restore(key) {
        try{
            return this.cache[key];
        }catch(e){
            return null;
        }
    }

    hasUser(username){
        let key = Object.keys(this.cache),
            found = false,
            ptr = null;
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

    delete(key) {
        // body...
        delete this.cache[key];
    }

    dump() {
        // body...
        console.log(this.cache);
        logger.debug(this.cache);
    };

    hasKey(key) {
        return this.cache.hasOwnProperty(key);
    }

}

//Singleton
var cache = new Cache();
module.exports.cache = cache;