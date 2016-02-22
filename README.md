# SonicLIFE
[![Build Status](https://travis-ci.org/SonicWALL-SSLVPN/SonicLIFE.svg?branch=master)](https://travis-ci.org/SonicWALL-SSLVPN/SonicLIFE)
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


## Database schema

### user

~~~
{
	username : string,
	password : md5 string,
	salt : random string,
	role : [admin, user]
}
~~~

### menu

~~~
{
	vendor : string,
	img_uri : string,
	dish : string,
	rate : { times:123, result:4.6 }
}
~~~

### comments

~~~
{
	datetime : int,
	comment : string,
	user : username,
	dish : DBRef(menu)
}
~~~

### order

~~~
{
	username : username,
	datetime : string,
	dish_id : DBRef,
	expired : bool(default is false, mongodb run cron to set it to true everynight)
}
~~~

###schedule

~~~
{
	menu_ref : [string],
	day : int[1-7],
	type : [breakfast|lunch|supper|other]
}
~~~

### survey

~~~
{
	name : string
	items : { 
		question1 : { type : 'bool', literal : string },
		question2 : { type : 'list', literal : string , option: list},
		question3 : { type : 'string', literal : string},
	}
}
~~~

### survey_result

~~~
{
	id : DBRef,
	result_items : {
		question1 : { type : 'bool', answer : bool },
		question2 : { type : 'list', answer : string},
		question3 : { type : 'string', answer : string},
	}
}
~~~
