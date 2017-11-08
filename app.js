const express = require('express')
const conf = require('./config.json')
var request = require('requestretry')
var path = require('path')
var hbs = require('express-handlebars')
var favicon = require('serve-favicon')
var morgan = require('morgan')

var app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout',
                       layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// setup logging
// get real ip if passed by nginx
morgan.token('remote-ip', function (req) {
    return req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
});

const logformat = ':date[iso] :remote-ip :method :url :status :res[content-length] :response-time ms :user-agent'
app.use(morgan(logformat, {
    skip: function (req, res) {
        return res.statusCode < 400
    }, stream: process.stderr
}));

app.use(morgan(logformat, {
    skip: function (req, res) {
        return res.statusCode >= 400
    }, stream: process.stdout
}));

// setup realtimedepartures request options
var requestOpts = {
    uri: 'http://api.sl.se/api2/realtimedeparturesV4.json',
    method: 'GET',
    qs: {
        key: conf.key,
        siteid: 5812,
        timewindow: 60,
        bus: true,
        metro: false,
        train: false,
        tram: false,
        ship: false
    },
    json: true,
    maxAttempts: 3,
    retryDelay: 100,
    retryStrategy: request.RetryStrategies.HTTPOrNetworkError
}

function timeformat(date) {
    function z(n) { return (n<10?'0':'') + n; }
    return z(date.getHours()) + ':' + z(date.getMinutes());
}

function convertSlRealtime(data) {
    var out = { title: "Bondebussen | Busstider i Järfälla",
                gtag: conf.gtag };

    var date = new Date(data.ResponseData.LatestUpdate);
    out.checktime = date.toLocaleTimeString();

    out.stops = [];

    var buses = data.ResponseData.Buses
    for (var i=0; i < buses.length; ++i)
    {
        var date1 = new Date(buses[i].TimeTabledDateTime);
        var date2 = new Date(buses[i].ExpectedDateTime);

        var time1 = timeformat(date1);
        var time2 = timeformat(date2);

        var bus = { number: buses[i].LineNumber, destination: buses[i].Destination,
             time: time1, timeExpected: time2 };

        if (buses[i].DisplayTime != time2) {
            bus.display = buses[i].DisplayTime;
        }

        if (time1 != time2) {
            bus.delayed = true
        }

        var stop = buses[i].StopPointNumber;

        var found = false;
        for (var j = 0; j < out.stops.length; ++j) {
            var s = out.stops[j];
            if (s.stop == stop) {
                found = true;
                s.buses.push(bus);
                // check if destination exists
                var destFound = false;
                for (var x = 0; x < s.destinations.length; ++x) {
                    if (s.destinations[x] == bus.destination) {
                        destFound = true;
                        break;
                    }
                }
                if (!destFound) {
                    s.destinations.push(bus.destination);
                }
                break;
            }
        }

        if (!found) {
            var s = {stop: stop, destinations: [bus.destination], buses: []};
            s.buses.push(bus);
            out.stops.push(s);
            
            if (!out.name) {
                out.name = buses[i].StopAreaName
            }
        }
    }

    // create stop destination texts
    for (var i = 0; i < out.stops.length; ++i) {
        out.stops[i].destinationText = out.stops[i].destinations.join(", ");
    }

    return out;
}

app.get('/', function (req, res) {
    requestOpts.qs.siteid = 5812;
    request(requestOpts, function(err, response, data) {
        if (!err && response.statusCode == 200) {
            // we get a json object directly

            if (data.StatusCode != 0)
            {
                console.log("Statuscode: " + data.StatusCode + ", " + data.Message);
                res.render('error', { message: data.Message });
                return;
            }

            out = convertSlRealtime(data);
            
            if (out.stops.length == 0) {
                res.render('error', {message: 'Det går inga bussar den närmsta timmen eller så finns inte hållplatsen'});
            }
            else {
                res.render('buses', out)
            }
        }
        else {
            console.log("Error: " + err.message);
            if (response) {
                console.log("StatusCode: " + response.statusCode)
            }
            res.render('error', { message: 'Sorry, no response from SL. Please refresh your page and try again.' });
        }
    })
})

app.get('/stop/:id', function(req, res) {
    console.log("Get busses at stop " + req.params.id)
    opts = requestOpts;
    opts.qs.siteid = req.params.id;
    request(requestOpts, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            // check sl error
            out = convertSlRealtime(body);
            res.render('buses', out)
        }
    });
})

app.get('/about', function (req, res) {
    res.render('about', { title: "Bondebussen | Varför ännu en sida med busstider",
                          gtag: conf.gtag
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found: ' + req.path);
    err.status = 404;
    next(err);
  });

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        title: "Bondevägen | Nu blev det fel",
        message: err.message,
        error: {}
    });
});

var server = app.listen(conf.port, function () {
  console.log('Bondebussen listening on port %s!', server.address().port)
})
