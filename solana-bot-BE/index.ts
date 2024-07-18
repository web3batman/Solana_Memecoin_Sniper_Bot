import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from 'path';

import { ORIGIN_URL, PORT,  connectMongoDB,  init } from "./config";
import http from "http";
import { WalletRouter } from "./routes";
import { Server } from "socket.io";
import { socketProvider } from "./sockets";

// Load environment variables from .env file
dotenv.config();

// Connect to the MongoDB database
connectMongoDB();

// Create an instance of the Express application
const app = express();
const server = http.createServer(app);

console.log(ORIGIN_URL)

const io = new Server(server, {
  cors: {
    origin: [ORIGIN_URL],
    methods: ['GET', 'POST'],
  },
});

// Set up Cross-Origin Resource Sharing (CORS) options
app.use(cors({
  origin: [ORIGIN_URL],
  methods: ['GET', 'POST'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, './public')));

// Parse incoming JSON requests using body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


// Define routes for different API endpoints
app.use("/api/wallet", WalletRouter);

// Define a route to check if the backend server is running
app.get("/", async (req: any, res: any) => {
  res.send("Backend Server is Running now!");
});

// Start the Express server to listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Socket 
socketProvider(io);

// Initialize
init()