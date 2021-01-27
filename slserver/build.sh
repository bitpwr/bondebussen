#!/usr/bin/env bash
set -o nounset -o xtrace

readonly script_dir="$(realpath "${BASH_SOURCE[0]%/*}")"
readonly name="bb_server"

# Remove old container
buildah rmi ${name}

set -o errexit

node_version="$(<"${script_dir}/node-version")"
readonly node_version

# Create container
readonly from="node:${node_version}-alpine"
ctr=$(buildah from --pull ${from})
readonly ctr

# Cleanup at exit
trap 'buildah rm ${ctr}' EXIT

# Copy files into container
buildah config --workingdir /usr/src/app/ $ctr
buildah copy ${ctr} "${script_dir}"/package*.json .
buildah copy ${ctr} "${script_dir}"/index.js .
buildah run ${ctr} mkdir src
buildah copy ${ctr} "${script_dir}"/src/* ./src

# Install node modules
buildah run ${ctr} npm install --only=production

buildah config --author="PM" \
    --env IMAGE_NAME="${name}" \
    --env LANG="se_SV.UTF-8" \
    --env LC_ALL="se_SV.UTF-8" \
    --env TZ="Europe/Stockholm" \
    --label name="${name}" \
    --port 3100 \
    ${ctr}

# Start node
buildah config --cmd 'node index.js' ${ctr}

# Commit and tag the image
buildah commit ${ctr} ${name}
