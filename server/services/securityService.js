const mongoose = require("mongoose");

exports.getSecurityStatus = async () => {
  return {
    authentication: "healthy",
    authorization: "healthy",
    database: mongoose.connection.readyState === 1 ? "healthy" : "warning",
    activeSessions: 0,
    failedLogins: 0,
    twoFactorEnabled: 0,
    blockedUsers: 0,
    threatLevel: "low",
    securityScore: 92
  };
};

exports.getSecurityEvents = async () => {
  return [
    {
      type: "login",
      message: "Security monitoring initialized",
      severity: "info",
      createdAt: new Date()
    }
  ];
};
