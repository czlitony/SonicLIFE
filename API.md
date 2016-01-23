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
    'session_id' : "52671630-c120-11e5-87e4-87a53587f70d"
}
~~~
if user has already logon, it will return the same session_id.

#### ERROR

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

#### ERROR

### POST /logon/register
#### INPUT
~~~
{
    'username' : 'xxxxx',
    'password' : 'ppppp'
}
~~~

#### OUTPUT
* status 200

#### ERROR

## Order API

### GET /order/<session_id>/menu/<vender>

#### INPUT

#### OUTPUT

~~~
[
    {_id : id, vender: xxx, dish : yyy, rate : 5},
    ...,
    ...
]
~~~



## Admin API

### POST /admin/<session_id>/menu/<vender>

#### INPUT

~~~
[
    {_id : id, vender: xxx, dish : yyy},
    ...,
    ...
]
~~~

#### OUTPUT

* status 200.

#### ERROR

### DELETE /admin/<session_id>/menu

#### INPUT

~~~
[
    id1,id2,id3.....
]
~~~

### GET /admin/<session_id>/vender

#### OUTPUT

~~~
[ vender1, vender2,.....]
~~~
