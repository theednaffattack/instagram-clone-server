# Notes

## Docker Process

### Build locally

`docker build -t theednaffattack/pg-server:init .`

### Run locally

`docker run --rm pg-server`

### Build and push to Docker Registry

build: `docker build -t theednaffattack/pg-server:init .`

push: `docker push theednaffattack/pg-server`

combined: `docker build -t theednaffattack/pg-server:init . && docker push theednaffattack/pg-server`

### Build and Run locally

`docker build -t theednaffattack/pg-server:init . && docker run --rm`

### Pull down built images from Docker Registry (from prod server)

docker-compose pull && docker-compose up

### Find images

`docker images | grep "pg-server"`
