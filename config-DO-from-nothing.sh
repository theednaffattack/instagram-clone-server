#! /bin/bash
# dokku apps:create ic-server && 
ssh root@143.198.125.13 "dokku plugin:install https://github.com/dokku/dokku-postgres.git && dokku postgres:create ic-db && dokku postgres:link ic-db ic-server"

