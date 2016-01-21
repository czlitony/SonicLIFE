# SonicLIFE

## Installation

If you check out the project for the firest time, then you need to install all the dependencies.

Clone the project and cd to the folder and run:

~~~
npm install
~~~

## Run the app

~~~
DEBUG=SonicLIFE npm start
~~~

Then you can access with localhost:3000

## Debug

~~~
DEBUG=express:* npm start
~~~
=======
## Logon API

### POST /logon

#### INPUT

~~~
{
    'username' : 'xxxxx',
    'password' : 'ppppp'
}
~~~

#### OUTPUT

* status 200
~~~
{
    'session_id' : 'yyyyy'
}
~~~

#### test

~~~
curl -X POST -H "content-type: application/json" http://localhost:3000/logon -d '{"username":"ab", "password":"cd"}'
~~~

### DELETE /logon/<sessiond_id>

~~~
curl -X DELETE http://localhost:3000/logon/<session-id>
~~~

#### OUTPUT

* status 200

