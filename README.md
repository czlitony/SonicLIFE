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
	dish : string,
	rate : { times:123, result:4.6 }
}
~~~

### comments

~~~
{
	datetime : int,
	comment : string,
	user : DBRef(user),
	dish : DBRef(menu)
}
~~~

### order

~~~
{
	user : DBRef,
	datetime : string,
	dish : DBRef
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