# Common Docker Commands

Local DB Startup

```bash
docker-compose -f docker-compose.local-db.yml up
```

Push Image to dockerHub

Combined build and push

```bash
docker build  --shm-size 1G -t theednaffattack/ic-server:production . && docker push theednaffattack/ic-server:production
```

Dokku tag and deployment (performed from remote server)

```bash
docker pull theednaffattack/ic-server:production
```

```bash
docker tag theednaffattack/ic-server:production dokku/ic-server:latest
```

```bash
dokku tags ic-server
```

```bash
dokku tags:deploy ic-server latest
```

docker pull theednaffattack/ic-server:production && docker tag theednaffattack/ic-server:production dokku/ic-server:latest && dokku tags ic-server && dokku tags:deploy ic-server latest

docker-compose -f docker-compose.db-local-dev.yml up
