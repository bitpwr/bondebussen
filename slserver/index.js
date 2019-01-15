const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const sl = require('./src/sl.js')

const app = express();

// get real ip if passed by nginx
morgan.token('remote-ip', function (req) {
    return req.headers['x-real-ip'] || req.headers['x-forwarded-for'] ||
           req.connection.remoteAddress;
});

app.use(morgan('dev'));
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).json({ name: "bondebussen" });
});

app.get('/time', (req, res) => {
    time = new Date().toISOString();
    console.log(time);
    res.status(200).json({ time: time });
});

app.get('/departures/:id', async (req, res) => {
    console.log("get deps: " + req.params.id);
    var stop = req.params.id
    data = await sl.departures(stop);
    console.log(data);
    res.status(200).json(data);
});


const port = process.env.BB_SERVER_PORT || 3333;
server = app.listen(port, function() {
    console.log(`listening on ${port}`);
})

/*
      if there is an error thrown in getUserFromDb, asyncMiddleware
      will pass it to next() and express will handle the error;

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
};

const asyncMiddleware = require('./utils/asyncMiddleware');

router.get('/users/:id', asyncMiddleware(async (req, res, next) => {
   const user = await getUserFromDb({ id: req.params.id })
   res.json(user);
}));

router.post('/users', asyncMiddleware(async (req, res, next) => {
 const user = await makeNewUser(req.body);
 res.json(user)
}))
*/