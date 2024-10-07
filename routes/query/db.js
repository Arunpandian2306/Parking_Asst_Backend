const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017"; 
const dbName = "Carparking";

const connectToMongo = async () => {
    const client = new MongoClient(uri); 

    try {
        await client.connect(); 
        console.log("Connected to MongoDB!");
        return client.db(dbName);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error; 
    }
};

module.exports = connectToMongo;
