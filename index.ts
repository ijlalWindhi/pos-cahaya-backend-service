import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { routerUser } from "./routes";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.use("/users", routerUser);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
