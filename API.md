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
    "authenticated":true,
    "role":"admin",
    "username":"admin"
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

#schedule API

## POST /\_\_api\_\_/schedule

###INPUT

* NEED ADMIN AND LOGON
* day [1-7] represent from monday to sunday.
~~~
[
    {
        dish_id : "abcdefa",
        day : 1
    },
    ...
    ...
]
~~~

###OUTPUT

* status 200

~~~
[
    {
        dish_id : "abcdefa",
        day : 1
    },
    ...
    ...
]
~~~

## DELETE /\_\_api\_\_/schedule

* NEED ADMIN AND LOGON

### INPUT

~~~
{
    schedule_list : [id1,id2,id3]
}
~~~

### OUTPUT

* status 200

## PUT /\_\_api\_\_/schedule

* NEED ADMIN AND LOGON

### INPUT

~~~
{
    _id : string,
    dish_id : string,
    day : int[1-7]
}
~~~

### OUTPUT

* status 200

#Order API

## POST /\_\_api\_\_/order

## Remove DELETE     

## modify PUT


# TODO
POST notification
