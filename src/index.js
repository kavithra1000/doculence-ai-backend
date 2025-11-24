import express from "express";
import cors from "cors";
import ActionRoutes from "./routes/action.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser"
import { connectDB } from "./libs/db.js";


const app = express();
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/actions", ActionRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000: http://localhost:5000/")
    connectDB();
  }
);
