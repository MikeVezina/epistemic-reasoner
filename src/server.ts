import {ApiRouter} from './ApiRouter';

//Install express server
const express = require('express');
const app = express();

app.use(express.json());

let a = new ApiRouter();
a.createApp(app);

// Start the app on the provided port
let port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log("Application server started on port " + port);
});
