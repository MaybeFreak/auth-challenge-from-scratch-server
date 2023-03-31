const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv");

const jwtSecret = process.env.JWT_SECRET;

const register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing input field" });
  }

  const data = {
    data: {
      username: username,
      password: bcrypt.hashSync(password, 15),
    },
  };

  try {
    const createdUser = await prisma.user.create(data);
    res.status(201).json({
      user: { userId: createdUser.id, username: createdUser.username },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return res.status(409).json({ error: "username is already taken" });
      }
      res.status(500).json({ error: e.code + e.message });
    }
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing input field" });
  }

  const data = {
    where: {
      username: username,
    },
  };

  const foundUser = await prisma.user.findUniqueOrThrow(data);

  if (!foundUser) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const passwordsMatch = bcrypt.compareSync(password, foundUser.password);

  if (!passwordsMatch) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const token = jwt.sign(username, jwtSecret);

  res.json({ token });
};

module.exports = {
  register,
  login,
};
