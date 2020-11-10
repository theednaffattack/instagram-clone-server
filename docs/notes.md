# Notes

## Docker API Process

### Build and push to Docker Registry

build: `docker build -t theednaffattack/pg-server:production .`

push: `docker push theednaffattack/pg-server`

combined: `docker build -t theednaffattack/pg-server:production . && docker push theednaffattack/pg-server`

## Docker Postgres Process

### Build locally

`docker build -t theednaffattack/pg-db:init .`

### Run locally

`docker run --rm pg-db`

`docker run -rm <GREP ID> -e POSTGRES_DB=instagram_clone -e POSTGRES_USER=fg_system -e POSTGRES_PASSWORD=fg_system`

Example:
`docker run -e POSTGRES_DB=instagram_clone -e POSTGRES_USER=fg_system -e POSTGRES_PASSWORD=fg_system b4e197db2b0a`

### Build and push to Docker Registry

build: `docker build -t theednaffattack/pg-db:init .`

push: `docker push theednaffattack/pg-db`

combined: `docker build -t theednaffattack/pg-db:init . && docker push theednaffattack/pg-db`

### Build and Run locally

`docker build -t theednaffattack/pg-db:init . && docker run --rm`

### Pull down built images from Docker Registry (from prod server)

docker-compose pull && docker-compose up

### Find images

`docker images | grep "pg-db"`
