const express = require('express')
const conf = require('./config.json')
var request = require('request')
var path = require('path')
var hbs = require('express-handlebars')

const app = express();
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout',
                       layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var requestOpts = {
    uri: 'http://api.sl.se/api2/realtimedeparturesV4.json?key=' + conf.key + '&siteid=5812&timewindow=60',
}

app.get('/', function (req, res) {
    request(requestOpts, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var data = JSON.parse(body);
            var date = new Date(data.ResponseData.LatestUpdate);
            var str = ''

            var buses = data.ResponseData.Buses
            var busList = []
            for (var i=0; i < buses.length; ++i)
            {
                var date1 = new Date(buses[i].TimeTabledDateTime);
                var date2 = new Date(buses[i].ExpectedDateTime);

                var bus = { number: buses[i].LineNumber, destination: buses[i].Destination,
                     time: date1.toLocaleTimeString(), display: buses[i].DisplayTime };
                
                if (date2.getTime() != date1.getTime()) {
                    bus.timeExpected = date2.toLocaleTimeString();
                }

                busList.push(bus)
            }
            res.render('busses', { title: "Bondebussen", checktime: date.toLocaleTimeString(),
                                   buses: busList})
        }
          else {
            console.log("Error: " + err.message);
            res.send('Sorry, an error ocurred')
        }
    })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found: ' + req.path);
    err.status = 404;
    next(err);
  });

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(conf.port, function () {
  console.log('Bondebussen listening on port %s!', server.address().port)
})
