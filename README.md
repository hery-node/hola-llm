# Hola-LLM

A web console for Large Language Model. It provides end-to-end LLM training and inference solutions.  
It is build upon hola-web and hola-server frameworks.

### Server project

This is nodejs server project developed using hola-server.  
It uses express as Node.js web application framework and uses mongodb as data storage.

### Web project

This is vue web project developed using hola-web.  
It uses vuetify (A Material Design Framework for Vue.js) as web UI framework.  
It also provide vue components to work with hola-server.

### How to run the project

- Start up the server project  
  Please install nodejs and mongodb according to the their install guide. After that:  
  Open a terminal and run below commands:

```
cd server
npm install
node main.js
```

- Start up the web project  
  Open a terminal and run below commands:

```
cd web
npm install
npm run serve
```

- Launch the brower and access the url: http://localhost:8080/

We provide two users: one is admin with admin role to manage users and another is demo as normal user role. All of them password is pwd4llm

Below is the screen shot for HOLA-LLM

![screenshot for HOLA-LLM](screen.png?raw=true "Screen Shot for the HOLA-LLM")
