#! /bin/bash
# yarn build:server
docker build  --shm-size 1G -t theednaffattack/ic-server:production .
docker push theednaffattack/ic-server:production
ssh root@143.198.125.13 "docker pull theednaffattack/ic-server:production && docker tag theednaffattack/ic-server:production dokku/ic-server:latest && dokku tags ic-server && dokku tags:deploy ic-server latest"
