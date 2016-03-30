var lib = require('ldap-verifyuser');

// CN=Matthew (Shen) Gao,OU=Users,OU=Engineering,OU=SV Domain Users,DC=sv,DC=us,DC=sonicwall,DC=com

var config = {
  server: 'ldap://10.102.1.51',
  adrdn: 'sv\\',
  adquery: 'DC=sv,DC=us,DC=sonicwall,DC=com',
  debug: false
},
username = 'shgao',
password = '#gs198667'

function authenticate(username, password){
  lib.verifyUser(config, username, password, function(err, data){
    if(err) {
      console.error('error', err);
    } else {
      console.log('valid?', data.valid);
      console.log('locked?', data.locked);
      console.log('raw data available?', data.raw ? true : false);
      console.log(data);
    }
    process.exit(data.status);
  });
}