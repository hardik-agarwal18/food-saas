#!/bin/sh
openssl req -new -x509 -days 365 -extensions v3_ca -keyout ./ca.key -out ./ca.crt -subj "/C=US/ST=CA/L=SF/O=FoodSaaS/OU=Dev/CN=FoodSaaSCA" -nodes
openssl genrsa -out ./server.key 2048
openssl req -new -key ./server.key -out ./server.csr -subj "/C=US/ST=CA/L=SF/O=FoodSaaS/OU=Dev/CN=mosquitto"
openssl x509 -req -in ./server.csr -CA ./ca.crt -CAkey ./ca.key -CAcreateserial -out ./server.crt -days 365
