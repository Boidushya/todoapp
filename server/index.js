const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const auth = require("./api/auth");
const todo = require("./api/todo");
const app = express();

// Listener and port

const port = process.env.PORT || 5000;
const { Server } = require('socket.io');
const io = new Server(app.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`);
}),{
	cors: {
		origin: '*',
	}
});

// IO check

io.on('connection', function (socket) {
    console.log('Client-side connection established');
});

// Middlewares
app.set("trust proxy", 1);
app.use(morgan("dev"));
app.use(helmet());
app.use(
	cors({
		origin: "*",
	})
);
app.use(express.json());
app.use((req,_,next)=>{
    req.io = io;
    next();
});
app.use("/api/todo", todo);
app.use("/api/auth", auth);

// Base Route

app.get("/", (req, res) => {
	res.json({
		message: "🔐",
		user: req.user,
	});
});

// Error Handling

const notFound = (req, res, next) => {
	res.status(404);
	const error = new Error(`Not Found = ${req.originalUrl}`);
	next(error);
};

const errorHandler = (err, req, res, next) => {
	res.status(res.statusCode || 500);
	res.json({
		message: err.message,
		stack: err.stack,
	});
};

app.use(notFound);
app.use(errorHandler);
