
// Map exception source locations to typescript
import {install} from 'source-map-support';
install()

import {ApiRouter} from './app/ApiRouter';
import cors from 'cors';

//Install express server
const express = require('express');
const app = express();

app.use(express.json());
app.use(cors())


let a = new ApiRouter();
a.createApp(app);

// Start the app on the provided port
let port = process.env.PORT || 9090;

app.listen(port, () => {
    console.log("Application server started on port " + port);
});
