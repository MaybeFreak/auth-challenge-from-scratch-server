require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRouter = require("./routers/user");
const movieRouter = require("./routers/movie");

app.use("/movie", movieRouter);
app.use("/user", userRouter);

app.get("*", (req, res) => {
  res.json({ ok: true });
});

const port = 4000;
app.listen(port, () => {
  console.log(`\n Server is running on http://localhost:${port} \n`);
});
