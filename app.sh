#!/bin/sh

cd /home/pi/RPiWall.Server
sh update_source.sh

cd /home/pi/RPiWall.Server/node

/home/pi/n/bin/node app.js