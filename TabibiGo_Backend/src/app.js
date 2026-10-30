const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/database");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {

  res.status(200).json({
    message: "TabibiGo Backend is Running!"
  });

});


const startServer = async () => {

  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

};

startServer();