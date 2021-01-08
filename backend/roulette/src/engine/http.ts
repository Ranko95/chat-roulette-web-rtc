import { Application } from "express";
import cors from "cors";

export function runServer(app: Application) {
  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  app.use("/health", (req, res) => {
    res.status(200).send({});
  }); 
}
