
const mongoose = require("mongoose");

const connection = async () => {
    try {
        const dbConnect = await mongoose.connect(process.env.MONGODB_URL);
        if(dbConnect) {
            console.log("Database Connected Successfully...");
        }
    } catch (error) {
        console.log("Connection Error!!");
    }
}

module.exports = connection;