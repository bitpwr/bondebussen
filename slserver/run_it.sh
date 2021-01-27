#!/usr/bin/env bash
set -o errexit -o nounset -o xtrace

podman run -it --rm --env-file ./env -p 3100:3100 bb_server /bin/sh
