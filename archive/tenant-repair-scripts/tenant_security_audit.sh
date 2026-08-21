#!/bin/bash

echo "===================================="
echo "TENANT SECURITY AUDIT"
echo "===================================="

cd server

echo ""
echo "Controllers missing tenantFilter:"
echo "--------------------------------"

grep -R "Model.find(" controllers services \
| grep -v "tenantFilter" \
| grep -v "findOne" \
| grep -v "findById"


echo ""
echo "Collections without tenantId:"
echo "--------------------------------"

grep -R "mongoose.model" models


echo ""
echo "Tenant middleware:"
echo "--------------------------------"

grep -R "tenant" middleware


echo ""
echo "DONE"
