import mongoose from "mongoose";

const connectDB = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URL);
    console.log('connected to DB')
  } catch (err) {
    console.log("error connectiong to db", err);
  }
}
export default connectDB;