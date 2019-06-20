## postgres tutorial

http://www.postgresqltutorial.com/

## Learn PostgreSQL Tutorial - Full Course for Beginners

https://www.youtube.com/watch?v=qw--VYLpxG4

## psql commands

\du show all users

\q exit

\l list all databases and users

\c change user/database

example: "\c template1, \c postgres postgres"

\dx show installed extensions

\df describe functions

\dt show tables

LOGIN COMMANDS

psql -d mydb -U myuser
psql -h myhost -d mydb -U myuser

psql -h localhost -d instagram_clone -U eddie
psql -h localhost -d instagram_clone -U eddienaff

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE <table name> CASCADE
example:
DROP TABLE product CASCADE
