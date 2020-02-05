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
        metro: true,
        train: true,
        tram: true,
        ship: false
    },
    json: true,
    maxAttempts: 3,
    retryDelay: 10,
    retryStrategy: request.RetryStrategies.HTTPOrNetworkError
}

var stopOpts = {
    uri: 'http://api.sl.se/api2/typeahead.json',
    method: 'GET',
    qs: {
        key: conf.keyPlats,
        searchstring: "",
        stationsonly: true,
        maxresults: 20
    },
    json: true,
    maxAttempts: 3,
    retryDelay: 10,
    retryStrategy: request.RetryStrategies.HTTPOrNetworkError
}

function timeformat(date) {
    function z(n) { return (n<10?'0':'') + n; }
    return z(date.getHours()) + ':' + z(date.getMinutes());
}

function parseDeparture(stops, slData) {
    var date1 = new Date(slData.TimeTabledDateTime);
    var date2 = new Date(slData.ExpectedDateTime);

    var time1 = timeformat(date1);
    var time2 = timeformat(date2);

    var departure = { number: slData.LineNumber, destination: slData.Destination,
            time: time1, timeExpected: time2 };

    if (slData.DisplayTime != time2) {
        departure.display = slData.DisplayTime;
    }

    if (time1 != time2) {
        departure.delayed = true
    }

    var stop = slData.StopPointNumber;

    var found = false;
    for (var j = 0; j < stops.length; ++j) {
        var s = stops[j];
        if (s.stop == stop) {
            found = true;
            s.departures.push(departure);
            // check if destination exists
            var destFound = false;
            for (var x = 0; x < s.destinations.length; ++x) {
                if (s.destinations[x] == departure.destination) {
                    destFound = true;
                    break;
                }
            }
            if (!destFound) {
                s.destinations.push(departure.destination);
            }
            break;
        }
    }

    if (!found) {
        var s = {stop: stop, destinations: [departure.destination], departures: [departure]};
        stops.push(s);
  
    }
    
    return slData.StopAreaName;
};

function convertSlRealtime(data) {
    var out = { title: "Busstider i Stockholm",
                gtag: conf.gtag };

    var date = new Date(data.ResponseData.LatestUpdate);
    out.checktime = date.toLocaleTimeString();

    out.busStops = [];
    out.trainStops = [];
    out.tramStops = [];
    out.metroStops = [];

    var buses = data.ResponseData.Buses
    for (var i=0; i < buses.length; ++i)
    {
        var station = parseDeparture(out.busStops, buses[i]);
        if (!out.busStation) {
            out.busStation = station
        }
    }

    var trains = data.ResponseData.Trains
    for (var i=0; i < trains.length; ++i)
    {
        var station = parseDeparture(out.trainStops, trains[i]);
        if (!out.trainStation) {
            out.trainStation = station
        }
    }

    var trams = data.ResponseData.Trams
    for (var i=0; i < trams.length; ++i)
    {
        var station = parseDeparture(out.tramStops, trams[i]);
        if (!out.tramStation) {
            out.tramStation = station
        }
    }

    var metros = data.ResponseData.Metros
    for (var i=0; i < metros.length; ++i)
    {
        var station = parseDeparture(out.metroStops, metros[i]);
        if (!out.metrosStation) {
            out.metrosStation = station
        }
    }

    // create stop destination texts
    for (var i = 0; i < out.busStops.length; ++i) {
        out.busStops[i].destinationText = out.busStops[i].destinations.join(", ");
    }
    
    for (var i = 0; i < out.trainStops.length; ++i) {
        out.trainStops[i].destinationText = out.trainStops[i].destinations.join(", ");
    }
    
    for (var i = 0; i < out.tramStops.length; ++i) {
        out.tramStops[i].destinationText = out.tramStops[i].destinations.join(", ");
    }
    
    for (var i = 0; i < out.metroStops.length; ++i) {
        out.metroStops[i].destinationText = out.metroStops[i].destinations.join(", ");
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
            
            if (out.busStops.length == 0) {
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
    opts = requestOpts;
    opts.qs.siteid = req.params.id;

    request(requestOpts, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            out = convertSlRealtime(body);
            out.title = "Busstider från " + out.name;
            res.render('buses', out);
        }
        else {
            console.log("Error in /stop: " + err.message);
            if (response) {
                console.log("StatusCode: " + response.statusCode)
            }
            res.render('error', { message: 'Sorry, no response from SL. Please refresh your page and try again.' });
        }
    });
})

app.get('/search', (req, res) => {
    if (typeof req.query.stop === 'undefined' ||
        req.query.stop == "") {
        console.log("NO STOP GIVEN")
        stopOpts.qs.searchstring = "";
        res.render('search', {title: "Sök efter hållplats"});
    }
    else {
        stopOpts.qs.searchstring = req.query.stop;

        request(stopOpts, function(err, response, data) {
            if (!err && response.statusCode == 200) {
                if (data.StatusCode != 0)
                {
                    console.log("Statuscode: " + data.StatusCode + ", " + data.Message);
                    res.render('error', { message: data.Message });
                    return;
                }

                var stops = [];
                for (var i = 0; i < data.ResponseData.length; ++i) {
                    s = data.ResponseData[i];
                    stops.push({name: s.Name, id: s.SiteId})
                }

                res.render('search', {title: "Sökresultat för " + req.query.stop, searchstring: req.query.stop, stops});
            }
            else {
            console.log("Error in /search: " + err.message);
            if (response) {
                console.log("StatusCode: " + response.statusCode)
            }
            res.render('error', { message: 'Sorry, no response from SL. Please refresh your page and try again.' });
            }
        });
    }
})

app.get('/about', function (req, res) {
    res.render('about', { title: "Varför ännu en sida med busstider",
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
        title: "Nu blev det fel",
        message: err.message,
        error: {}
    });
});

var server = app.listen(conf.port, function () {
  console.log('Bondebussen listening on port %s!', server.address().port)
})
