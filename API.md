# Logon API

## POST /\_\_api\_\_/logon

### INPUT

~~~
{
    'username' : 'xxxxx',
    'password' : 'ppppp'
}
~~~

### OUTPUT

* status 200
* set-cookie: connect.sid=1233456789

~~~
{
  "authenticated": true,
  "role": "admin",
  "username": "admin"
}
~~~


## DELETE /\_\_api\_\_/logon

###INPUT
SHOULD set cookie in header

### OUTPUT

* status 200

## POST /\_\_api\_\_/logon/register

### INPUT
~~~
{
    'username' : 'xxxxx',
    'password' : 'ppppp'
}
~~~

### OUTPUT

* status 200


# Menu API

## GET /\_\_api\_\_/menu?page=1
## GET /\_\_api\_\_/menu/q/\<vender_name\>?page=1
## GET /\_\_api\_\_/menu/q/\<vender_name\>/\<dish_name\>?page=1

### OUTPUT

~~~
[
    {_id : id, vender: xxx, dish : yyy, rate : {result : 4.5, times: 23}},
    ...,
    ...
]
~~~

## PUT /\_\_api\_\_/menu/q/\<vender_name\>/\<dish_name\>/rate

* NEED LOGIN

### INPUT

~~~
{rate : 4}
~~~

### OUTPUT
* status 200


## POST /\_\_api\_\_/menu

* NEED LOGIN and ADMIN

### INPUT

~~~   
{
    vender: xxx, 
    dish : yyy
}
~~~

### OUTPUT

* status 200.

~~~
{  
    "_id":"56a48821fa521c194dd931e2",
    "vender":"new",
    "dish":"yuxiangrous",
    "rate":{"result":3.125,"times":8}
}
~~~

## DELETE /\_\_api\_\_/menu

* NEED LOGIN and ADMIN

### INPUT

~~~
{
    dish_list : [id1,id2,id3]
}
~~~

### OUTPUT

* status 200.

### GET /\_\_api\_\_/menu/vender

### OUTPUT

~~~
[
    vender1,
    vender2,
    ...
]
~~~

#rule API

## POST /\_\_api\_\_/rule

###INPUT

* NEED ADMIN AND LOGON
* day [1-7] represent from monday to sunday.
Pharse 1

~~~
{
    menu : vender_name,
    type : lunch,
    day : 1
}
~~~

Pharse 2

~~~
{
  "menu": [
    {
      "name": "menu name",
      "dishes": [
        "id1",
        "id2",
        ....
      ]
    }
  ],
  "type": "lunch",
  "day": 1
}
~~~

###OUTPUT

* status 200

~~~
[
  {
    "_id": "571a3698899fcd2d11116a4a",
    "type": "lunch",
    "day": 1,
    "menu": "guolan"
  },
  {
    "_id": "571a39237125e9f711681695",
    "menu": "guolan",
    "day": 2,
    "type": "lunch"
  }
]
~~~

## DELETE /\_\_api\_\_/rule

* NEED ADMIN AND LOGON

### INPUT

~~~
{
    rule_list : [id1,id2,id3]
}
~~~

### OUTPUT

* status 200

## PUT /\_\_api\_\_/rule

* NEED ADMIN AND LOGON

### INPUT
ALL the element is optional.
~~~
{
    rule_id : id,
    menu : vender_name,
    type : lunch,
    day : 1
}
~~~

### OUTPUT

* status 200

# Schedule API

## GET /\_\_api\_\_/schedule

### OUTPUT

~~~
{
  "_id": "572238f609777fe25387f4ae",
  "time": "2016-04-28T16:23:18.907Z",
  "day": 5,
  "type": "breakfast",
  "menu": [
    {
      "_id": "571a3223cbdf9e7f0f547f0a",
      "vender": "guolan",
      "dish": "dish1",
      "rate": {
        "times": 0,
        "result": 0
      }
    },
    {
      "_id": "571a39237125e9f711681694",
      "vender": "guolan",
      "dish": "dish2",
      "rate": {
        "times": 0,
        "result": 0
      }
    }
  ]
}
~~~


# Comment API

## GET /\_\_api\_\_/comment/\<dish_id\>?page=1

### OUTPUT

~~~
[
    {
        "_id":"56c7317077eee0e37fcfd4aa",
        "dish_id":"56bedfa50b7045cc5e9e8033",
        "comment":"god good",
        "datetime":"2016-02-19T15:14:56.010Z",
        "username":"admin"
    },
    .....
]
~~~

## POST /\_\_api\_\_/comment

* NEED LOGON

## INPUT

~~~
{
    "comment":"god good",
    "dish_id":"56bedfa50b7045cc5e9e8033"
}
~~~

## OUTPUT

~~~

{
    "dish_id":"56bedfa50b7045cc5e9e8033",
    "comment":"god good",
    "datetime":"2016-02-19T15:15:54.109Z",
    "username":"admin",
    "_id":"56c731aa953278168064f0e0"
}

~~~

#Order API

## GET /\_\_api\_\_/order?paga=1&from=[starttime]&to=[endtime]

* NEED LOGON

## POST /\_\_api\_\_/order

* NEED LOGON

###INPUT

~~~
{
    dish_id : string,
    type : string
}
~~~

###OUTPUT

~~~
{
    "dish_id":"56bedc9e4f85e44b5ea56e05",
    "username":"admin",
    "datetime":"2016-02-20T15:32:51.024Z",
    "expired":false,
    "type":"supper",
    "dish":"dish2",
    "vender":"vender1",
    "_id":"56c8872397ff4e1f8fb60af3"
}
~~~

## Remove DELETE     

## modify PUT


# TODO
POST notification
