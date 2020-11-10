FROM postgres:12-alpine

# Copy in the load-extensions script
# COPY load-extensions.sh /docker-entrypoint-initdb.d/
COPY ./schema.sql /docker-entrypoint-initdb.d/



# Add the certs and change permissions
COPY secret/server.crt /var/lib/postgresql/server.crt
COPY secret/server.key /var/lib/postgresql/server.key
COPY secret/chain.pem /var/lib/postgresql/chain.pem

# RUN chown 0:70 /var/lib/postgresql/server.key
# RUN chmod 600 /var/lib/postgresql/server.key
RUN chown 70:70 /var/lib/postgresql/server.key && \
    chmod 600 /var/lib/postgresql/server.key

# RUN chmod 600 /var/lib/postgresql/server.key
# RUN chown postgres:postgres /var/lib/postgresql/server.key