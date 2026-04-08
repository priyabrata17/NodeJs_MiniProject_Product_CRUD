// import modules
require("dotenv").config();
const express = require("express");
const path = require("path");
const dbConnect = require("./app/config/dbConnection");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const swaggerjsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

//execting required files
const app = express();
dbConnect();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//parse data
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));

//Swagger Docs
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Product CRUD Api",
      version: "1.0.0",
      description:
        "Backend api with nodejs for user authentication and product crud operation.",
    },
    servers: [
      {
        url: "https://nodejs-miniproject-product-crud.onrender.com/api",
        description: "Render Server",
      },
      {
        url: "http://localhost:8080/api",
        description: "Local Server",
      },
    ],
    components: {
      securitySchemes: {
        xAccessToken: {
          type: "apiKey",
          in: "header",
          name: "x-access-token",
        },
      },
    },

    security: [
      {
        xAccessToken: [],
      },
    ],
  },
  apis: [path.join(__dirname, "app/router/*.js")],
};
const specs = swaggerjsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

//Testing
app.get("/", (req, res) => {
  res.send("API is running...");
});

//using routes
const userRoute = require("./app/router/userRouter");
app.use("/api", userRoute);
const productRoute = require("./app/router/productRouter");
app.use("/api", productRoute);

// Debug error logger
app.use((err, req, res, next) => {
  console.error("🔥🔥🔥 FULL ERROR 🔥🔥🔥:");
  console.error(err);
  console.error(err.stack);
  next(err);
});

//final handle error
const handleErrors = require("./app/middleware/handleErrors");
app.use(handleErrors);

//creating server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server stared at ${PORT}`);
});
