#!/bin/bash
/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password changeme_in_production
CLIENT_ID=$(/opt/keycloak/bin/kcadm.sh get clients -r recruitment-erp -q clientId=erp-frontend | grep '"id"' | head -n 1 | awk -F'"' '{print $4}')
/opt/keycloak/bin/kcadm.sh update clients/$CLIENT_ID -r recruitment-erp -s directAccessGrantsEnabled=true
