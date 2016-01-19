# SonicLIFE

## Installation
------------------
If you check out the project for the firest time, then you need to install all the dependencies.

Clone the project and cd to the folder and run:

~~~
npm install
~~~

## Run the app

~~~
DEBUG=SonicLIFE npm start
~~~

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
curl -X POST -H "content-type: application/json" http://localhost:3000/logon -d '{"a":"b"}'
~~~

### DELETE /logon/<sessiond_id>

#### OUTPUT

* status 200

