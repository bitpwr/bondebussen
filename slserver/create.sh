#!/usr/bin/env bash
set -o nounset -o errexit -o xtrace

readonly image="bbapi"
readonly container=${image}-daemon

podman rm --ignore ${container}

podman create --name ${container} \
    -p 3100:3100 \
    -e TZ="Europe/Stockholm" \
    -e LANG="en_US.UTF-8" \
    -e LC_ALL="en_US.UTF-8" \
    --env-file ./env \
    ${image}

podman generate systemd \
    --container-prefix ${image} \
    --restart-policy always \
    --time 1 \
    ${container} \
    > ${container}.service

