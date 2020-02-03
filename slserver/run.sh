#!/bin/bash

docker run -d --rm --env-file ./env -p 3100:3100 slapi 

