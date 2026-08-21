#!/bin/bash

echo "======================================"
echo "TENANT QUERY LEAK AUDIT"
echo "======================================"

cd server


echo ""
echo "1. find() queries without tenantId"
echo "--------------------------------"

grep -R "Model.find(" controllers services routes \
| grep -v tenantId \
| grep -v node_modules || true



echo ""
echo "2. findOne queries"
echo "--------------------------------"

grep -R "Model.findOne" controllers services routes \
| grep -v tenantId \
| grep -v node_modules || true



echo ""
echo "3. aggregate pipelines"
echo "--------------------------------"

grep -R "aggregate(" controllers services routes \
| grep -v tenantId \
| grep -v node_modules || true



echo ""
echo "4. Routes using tenant middleware"
echo "--------------------------------"

grep -R "tenantMiddleware" routes



echo ""
echo "5. Models with tenantId count"
echo "--------------------------------"

grep -R "tenantId" models | wc -l


echo ""

echo "======================================"
echo "AUDIT COMPLETE"
echo "======================================"

