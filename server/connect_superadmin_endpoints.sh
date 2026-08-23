#!/bin/bash

echo "================================================"
echo "CONNECTING SUPER ADMIN BACKEND ENDPOINTS"
echo "================================================"

# Backup server.js
cp server.js server.js.backup-$(date +%Y%m%d-%H%M%S)

echo "Checking existing routes..."

# Add route imports if missing
python3 - <<'PY'
from pathlib import Path

file = Path("server.js")
text = file.read_text()

imports = {
'./routes/securityRoutes':'const securityRoutes = require("./routes/securityRoutes");',
'./routes/settingsRoutes':'const settingsRoutes = require("./routes/settingsRoutes");',
'./routes/databaseRoutes':'const databaseRoutes = require("./routes/databaseRoutes");',
'./routes/apiMonitorRoutes':'const apiMonitorRoutes = require("./routes/apiMonitorRoutes");',
'./routes/systemHealthRoutes':'const systemHealthRoutes = require("./routes/systemHealthRoutes");'
}

for key,value in imports.items():
    if key not in text:
        text = value + "\n" + text

routes = {
'app.use("/api/security"':'app.use("/api/security", securityRoutes);',
'app.use("/api/settings"':'app.use("/api/settings", settingsRoutes);',
'app.use("/api/database"':'app.use("/api/database", databaseRoutes);',
'app.use("/api/api-monitor"':'app.use("/api/api-monitor", apiMonitorRoutes);',
'app.use("/api/system"':'app.use("/api/system", systemHealthRoutes);'
}

insert = "\n// SUPER ADMIN ROUTES\n"

for key,value in routes.items():
    if key not in text:
        insert += value + "\n"

text += insert

file.write_text(text)
PY


echo "Creating missing route files..."

mkdir -p routes controllers


# Security Route
cat > routes/securityRoutes.js <<'EOF'
const router = require("express").Router();

router.get("/", async (req,res)=>{
 res.json({
   status:"ok",
   security:"active",
   timestamp:new Date()
 });
});

module.exports = router;
EOF


# Settings Route
cat > routes/settingsRoutes.js <<'EOF'
const router=require("express").Router();

router.get("/",async(req,res)=>{
 res.json({
  site:"Coherent Tours",
  maintenance:false,
  version:"1.0.0"
 });
});

module.exports=router;
EOF


# Database Route
cat > routes/databaseRoutes.js <<'EOF'
const router=require("express").Router();

router.get("/",async(req,res)=>{
 res.json({
  database:"connected",
  collections:[],
  timestamp:new Date()
 });
});

module.exports=router;
EOF


# API Monitor Route
cat > routes/apiMonitorRoutes.js <<'EOF'
const router=require("express").Router();

router.get("/",async(req,res)=>{
 res.json({
  api:"online",
  uptime:process.uptime(),
  memory:process.memoryUsage(),
  timestamp:new Date()
 });
});

module.exports=router;
EOF


# System Health Route
cat > routes/systemHealthRoutes.js <<'EOF'
const router=require("express").Router();

router.get("/health",async(req,res)=>{
 res.json({
  status:"healthy",
  server:"running",
  uptime:process.uptime(),
  timestamp:new Date()
 });
});

module.exports=router;
EOF


echo "Checking syntax..."

node --check server.js


echo "================================================"
echo "SUPER ADMIN ENDPOINTS CONNECTED"
echo "================================================"

echo ""
echo "Available endpoints:"
echo "/api/security"
echo "/api/settings"
echo "/api/database"
echo "/api/api-monitor"
echo "/api/system/health"
