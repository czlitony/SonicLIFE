var log4js = require('log4js');  

log4js.configure({  
    appenders: [  
        {  
            type: 'console',  
            category: "console"  
        }, //控制台输出
        {  
            type: "dateFile",  
            filename: 'logs/log.log',  
            pattern: "_yyyy-MM-dd",  
            alwaysIncludePattern: false,  
            category: 'dateFileLog'  
        }//日期文件格式  
    ],  
    
    replaceConsole: true,   //替换console.log  
    
    levels:{  
        dateFileLog: 'DEBUG'  
    }  
});  
  
var dateFileLog = log4js.getLogger('dateFileLog');  
  
exports.logger = dateFileLog;  
  
exports.use = function(app) {  
    //app.use(log4js.connectLogger(dateFileLog, {level:'auto', format:':method :url'}));  
    app.use(log4js.connectLogger(dateFileLog, {level:'debug', format:':method :url'}));  
}  