#!/bin/bash

docker run --rm -it --env-file ./env -p 3101:3100 slapi /bin/bash

