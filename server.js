var express = require('express');
var app = express();
const PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
    res.send('TODO API Root');
});

app.listen(PORT, function () {
    console.log('Express listening on Port: ' + PORT);
});