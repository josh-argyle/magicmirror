#!/bin/bash

set -e

docker cp mm:/opt/magic_mirror/package.json /mnt/c/data/repo/foreign/MagicMirror/
docker cp mm:/opt/magic_mirror/package-lock.json /mnt/c/data/repo/foreign/MagicMirror/
