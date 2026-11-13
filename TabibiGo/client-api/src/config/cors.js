const cors = require("cors");

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

module.exports = cors(corsOptions);

