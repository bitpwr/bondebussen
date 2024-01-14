#!/usr/bin/env bash

set -eu

readonly img=bondebussen
readonly ctr=bonderunner

if docker ps | grep -q ${ctr} ; then
    echo "stop running container '${ctr}'"
    docker stop "${ctr}"
    docker rm "${ctr}"
fi

docker run \
    -d \
    --name "${ctr}" \
    --restart unless-stopped \
    -v "$(pwd)/.env:/app/.env:ro" \
    -p 8080:8080 \
    "${img}"
