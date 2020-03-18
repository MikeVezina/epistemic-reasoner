//Install express server
const express = require('express');
const path = require('path');
const app = express();

let api = require(__dirname + '/out-tsc/app/ApiRouter');

app.use(express.json());

api.ApiRouter.prototype.createApp(app);


// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/hintikkasworld'));



app.get('/*', function(req,res) {

    res.sendFile(path.join(__dirname+'/dist/hintikkasworld/index.html'));
});


console.log("Hello")
// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
