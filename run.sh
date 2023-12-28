#!/usr/bin/env bash

docker run \
    -it \
    --rm \
    --name bondebussen \
    -v "$(pwd)/.env:/app/.env:ro" \
    -p 8080:8080 \
    bondebussen
