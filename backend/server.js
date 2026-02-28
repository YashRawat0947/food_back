import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();

connectDB();

app.use(express.json());

// explicit header middleware to ensure CORS headers are always included
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://food-front-3k3z.vercel.app",
    "https://food-admin-ochre.vercel.app"
  ];
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,token");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  // preflight request
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// simple CORS middleware as a fallback for any route
app.use(
  cors({
    origin: [
      "https://food-front-delta-one.vercel.app",
      "https://food-admin-ochre.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"]
  })
);

app.options("*", cors());

app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});
//hi
export default app;