const compression = require('compression');
const express = require('express');
const app = express();

app.use(compression());

app.use(express.static('public'));
app.use(express.static('node_modules'));


const devPort = '5000';
app.listen(process.env.PORT || devPort, function(){
  console.log("listening on port "+devPort+". Find the path")
});