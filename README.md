# Mock JSONServer with JWT Authentication

A Fake REST API using json-server with JWT authentication. 
Implemented End-points: login,register

## Install
```bash
$ npm install
$ npm start
```

## Register and Login
 
Use the following endpoints to login 
 
```
POST http://localhost:8000/auth/login
POST http://localhost:8000/auth/register
```
with the following data 

```json
{
  "email": "admin@admin.com",
  "password":"root"
}
```

On success you will get the user info and accessToken: 
 
```json
{
  "id": 1,
  "email": "admin@admin.com",
  "access_token":"<ACCESS_TOKEN>"
}
```

401 and error message will be returned on failure 

## Accessing data

You should send this header with any API request:

```text
Authorization: Bearer <ACCESS_TOKEN>
```
