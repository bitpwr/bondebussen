'use client';

import { Station } from "./sl-stops";


export function isStationInList(station: Station, list: Station[]): boolean {
    return list.some((s) => s.id === station.id);
  }
