# Logon API

## POST /__api__/logon

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


## DELETE /__api__/logon

###INPUT
SHOULD set cookie in header

### OUTPUT

* status 200

## POST /__api__/logon/register

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

## GET /__api__/menu?page=1
## GET /__api__/menu/q/\<vender_name\>?page=1
## GET /__api__/menu/q/\<vender_name\>/\<dish_name\>?page=1

### OUTPUT

~~~
[
    {_id : id, vender: xxx, dish : yyy, rate : {result : 4.5, times: 23}},
    ...,
    ...
]
~~~

## PUT /__api__/menu/q/\<vender_name\>/\<dish_name\>/rate

* NEED LOGIN

### INPUT

~~~
{rate : 4}
~~~

### OUTPUT
* status 200


## POST /__api__/menu

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

## DELETE /__api__/menu

* NEED LOGIN and ADMIN

### INPUT

~~~
{
    dish_list : [id1,id2,id3]
}
~~~

### OUTPUT

* status 200.

### GET /__api__/menu/vender

#### OUTPUT

~~~
[
    vender1,
    vender2,
    ...
]
~~~

#Order API

## POST /__api__/order

## Remove DELETE     

## modify PUT


# TODO
POST notification