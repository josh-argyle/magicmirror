#!/bin/bash

sudo chown -R pi:pi $XDG_RUNTIME_DIR
sudo seatd -u pi -g pi &

if [[ "$RANDR_PARAMS" != "" ]]; then
  labwc &
  sleep $RANDR_DELAY
  # remove quotes:
  RANDR_PARAMS="${RANDR_PARAMS%\"}"
  RANDR_PARAMS="${RANDR_PARAMS#\"}"
  echo "executing: wlr-randr $RANDR_PARAMS"
  wlr-randr $RANDR_PARAMS
  wait -n
else
  labwc
fi
