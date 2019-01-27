'use strict';

const axios = require('axios')

const realtimeUrl = 'http://api.sl.se/api2/realtimedeparturesV4.json';
const stationSearchUrl = 'http://api.sl.se/api2/typeahead.json';

function realtimeOptions(siteid, minutes) {
    let params = {
        key: process.env.BB_REALTIME_KEY,
        siteid: siteid,
        timewindow: minutes,
        bus: true,
        metro: true,
        train: true,
        tram: true,
        ship: false
    };

    return params;
}

function searchOptions(station, count) {
    let params = {
        key: process.env.BB_SEARCH_KEY,
        searchstring: station,
        stationsonly: true,
        maxresults: count
    };

    return params;
}


function timeformat(date) {
    function z(n) { return (n < 10 ? '0' : '') + n; }
    return z(date.getHours()) + ':' + z(date.getMinutes());
}

function parseDeparture(stops, slData) {
    var date1 = new Date(slData.TimeTabledDateTime);
    var date2 = new Date(slData.ExpectedDateTime);

    var time1 = timeformat(date1);
    var time2 = timeformat(date2);

    var departure = {
        number: slData.LineNumber, destination: slData.Destination,
        time: time1, timeExpected: time2
    };

    if (slData.DisplayTime != time2) {
        departure.display = slData.DisplayTime;
    }

    if (time1 != time2) {
        departure.delayed = Math.round((date2 - date1) / (1000 * 60));
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
        var s = { stop: stop, destinations: [departure.destination], departures: [departure] };
        stops.push(s);

    }

    return slData.StopAreaName;
};

function convertSlRealtime(data) {
    var out = { title: "Busstider i Stockholm",
                gtag: "conf.gtag" };

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
        if (!out.metroStation) {
            out.metroStation = station
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

async function departures(siteid) {
    try {
        let res = await axios.get(realtimeUrl, { params: realtimeOptions(siteid, 35)});
        console.log(res.data)
        let out = convertSlRealtime(res.data);

        return out;
    }
    catch (error) {
        console.error(error);
        // return error;
    }
}

async function search(station) {
    try {
        let res = await axios.get(stationSearchUrl, { params: searchOptions(station, 10)});
        var data = res.data;
        console.log(data)

        var stops = [];
        if (data.StatusCode != 0)
        {
            console.log("Statuscode: " + data.StatusCode + ", " + data.Message);
            // res.render('error', { message: data.Message });
        }
        else {
            for (var i = 0; i < data.ResponseData.length; ++i) {
                stops.push({name: data.ResponseData[i].Name,
                            id: data.ResponseData[i].SiteId})
            }
        }

        return stops;
    }
    catch (error) {
        console.error(error);
        // return error;
    }
}


module.exports = {
    departures: departures,
    search: search
};