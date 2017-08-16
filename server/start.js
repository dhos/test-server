/*

 ES6 by default! Using http://babeljs.io

 Our actual application code begins inside of
 server/main.js, but the process should be started
 from this file in order to enable ES6 translation.

 There is no boilerplate ES6 code in our application
 so if you choose not to use any ES6 features, you can
 start your application from main.js.

*/
'use strict';
require('babel-register');

var chalk = require('chalk');
var db = require('./db');

var server = require('http').createServer();

var createApplication = function() {
    var app = require('./app')(db);
    server.on('request', app); // Attach the Express application.
    // require('./io')(server); // Attach socket.io.
};

var startServer = function() {

    var PORT = process.env.PORT || 1337;

    server.listen(PORT, function() {
        console.log(chalk.blue('Server started on port', chalk.magenta(PORT)));
    });

};

db.sync().then(createApplication).then(startServer).catch(function(err) {
    console.error(chalk.red(err.stack));
});