import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    // check for any error after mongodb connection
    app.on("error", (err) => {
      console.log("Error befor MongoDB Connection: ", err);
      throw err;
    });

    // listen to the port
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed!!!", err);
  });
