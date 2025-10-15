#!/bin/bash
# Wrapper for running VICE headlessly with Xvfb

Xvfb :99 -screen 0 1024x768x24 &
export DISPLAY=:99

exec "$@"
