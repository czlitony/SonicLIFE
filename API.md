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

### GET /order/<session_id>/menu/<vender_name>

#### OUTPUT

~~~
[
    {_id : id, vender: xxx, dish : yyy, rate : {result : 4.5, times: 23}},
    ...,
    ...
]
~~~

### PUT /order/<session_id>/menu/<vender_name>/<dish_name>/rate

#### INPUT
~~~
{rate : 4}
~~~

### OUTPUT
* status 200

## Admin API

### POST /admin/<session_id>/menu/add

#### INPUT

~~~
[
    {vender: xxx, dish : yyy},
    ...,
    ...
]
~~~

#### OUTPUT
~~~
[{  
    "_id":"56a48821fa521c194dd931e2",
    "vender":"new",
    "dish":"yuxiangrous",
    "rate":{"result":3.125,"times":8}
}]
~~~

* status 200.

#### ERROR

### DELETE /admin/<session_id>/menu/<dish_id>

### OUTPUT

* status 200.

### GET /admin/<session_id>/menu/<vender_name>
redirect to `/order/<session_id>/menu/<vender_name>`

### GET /admin/<session_id>/vender

#### OUTPUT

~~~
[vender1,vender2...]
~~~

### POST /admin/<session_id>/menu/add

~~~
{ vender : xxx, dish : yyy}
~~~

#### OUTPUT

~~~
[{  
    "_id":"56a48821fa521c194dd931e2",
    "vender":"new",
    "dish":"yuxiangrous",
    "rate":{"result":3.125,"times":8}
},
....
]
~~~
