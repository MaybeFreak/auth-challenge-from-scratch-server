const jwt = require("jsonwebtoken");
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

const jwtSecret = process.env.JWT_SECRET;

const getAllMovies = async (req, res) => {
  const movies = await prisma.movie.findMany();

  res.json({ data: movies });
};

const createMovie = async (req, res) => {
  const { title, description, runtimeMins } = req.body;
  const sendToken = req.headers.authorization.split(" ")[1];
  if (!title || !description || !runtimeMins) {
    return res.status(400).json({ error: "missing input field" });
  }

  try {
    const token = jwt.verify(sendToken, jwtSecret);
    // todo verify the token
  } catch (e) {
    return res.status(401).json({ error: "Invalid token provided." });
  }

  const data = {
    data: {
      title: title,
      description: description,
      runtimeMins: runtimeMins,
    },
  };

  try {
    const createdMovie = await prisma.movie.create(data);
    res.status(201).json({ movie: createdMovie });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return res
          .status(409)
          .json({ error: `Movie with title: ${title} already exists` });
      }
      console.log(e);
    }
  }
};

module.exports = {
  getAllMovies,
  createMovie,
};
