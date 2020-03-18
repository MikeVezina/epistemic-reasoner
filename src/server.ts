import {ApiRouter} from './ApiRouter';

//Install express server
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

let a = new ApiRouter();
a.createApp(app);

console.log("Hello")
// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
