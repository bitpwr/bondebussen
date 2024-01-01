'use server';

import { InfluxDB, Point } from '@influxdata/influxdb-client';

const token = process.env.INFLUXDB_TOKEN;
const url = process.env.INFLUXDB_URL;
const org = process.env.INFLUXDB_ORG;
const bucket = process.env.INFLUXDB_BUCKET;

type Tag = {
  name: string;
  value: string;
};

function send(
  measurement: string,
  field: string,
  value: string | number,
  tag: Tag | null,
  asText: boolean
) {
  if (!token || !url || !org || !bucket) {
    console.log(`Skip influx`);
    return;
  }

  try {
    const client = new InfluxDB({ url, token });
    const writeClient = client.getWriteApi(org, bucket, 'ms');

    let point = new Point(measurement);
    if (tag) {
      point.tag(tag.name, tag.value);
    }

    // does not work ???
    //if (typeof value === 'number') {

    if (asText) {
      point.stringField(field, value);
    } else {
      point.intField(field, value);
    }

    writeClient.writePoint(point);
    writeClient.flush();
  } catch (error: any) {
    console.log(error.message);
  }
}

export async function logSearch(station: string) {
  send('search', 'text', station, null, true);
}

export async function logDeparture(station: string, id: number) {
  send('realtime', 'siteid', id, { name: 'text', value: station }, false);
}
