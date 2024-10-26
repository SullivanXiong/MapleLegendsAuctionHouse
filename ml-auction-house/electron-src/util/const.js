const isDev = process.env.ENV === "DEV";
const PORT = process.env.ELECTRON_PORT ? parseInt(process.env.ELECTRON_PORT) : 7002;
const REACT_PORT = process.env.REACT_PORT ? parseInt(process.env.REACT_PORT) : 7003;
const LOCALHOST_URL = `http://localhost:${REACT_PORT}`;

module.exports = {
  isDev,
  PORT,
  LOCALHOST_URL,
};
