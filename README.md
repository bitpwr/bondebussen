# Bondebussen

Web site showing current departures for public transports in Stockholm, based on next.js, react and MUI.
The initial goal was to show bus departures from Bondevägen in Järfälla only, hence the name `bondebussen`.

Try it out at [bondebussen.se](https://bondebussen.se).

## Prerequisites

Keys to access the SL api must be added to a `.env` file.
Use the `env` file as a template.

## Setup

Install dependencies

```sh
npm install
```

## Development

Run the development server

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production

Use `build.sh` to create a standalone docker image and run it with `run.sh`.

## Statistics

Station searches and realtime updates can be sent to `InfluxDb` if relevant information
is put into the `.env` file.
