const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// CORS — add your frontend Azure URL here
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local development
      "https://yellow-moss-0f7d27800.4.azurestaticapps.net", // your Azure frontend URL
    ],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));

app.get("/", (req, res) => res.json({ message: "QuickFix API running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
