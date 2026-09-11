#!/bin/sh
openssl req -new -x509 -days 365 -extensions v3_ca -keyout /certs/ca.key -out /certs/ca.crt -subj "/C=US/ST=CA/L=SF/O=FoodSaaS/OU=Dev/CN=FoodSaaSCA" -nodes
openssl genrsa -out /certs/server.key 2048
openssl req -new -key /certs/server.key -out /certs/server.csr -subj "/C=US/ST=CA/L=SF/O=FoodSaaS/OU=Dev/CN=mosquitto"
openssl x509 -req -in /certs/server.csr -CA /certs/ca.crt -CAkey /certs/ca.key -CAcreateserial -out /certs/server.crt -days 365
