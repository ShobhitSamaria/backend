import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({path: './.env'});

connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port !-!-!-!-!${process.env.PORT}`);
    });
    console.log("Database connection established successfully !!!!");
})
.catch((error) => {
    console.error("Failed to connect to the database !!!! ", error);
}); 