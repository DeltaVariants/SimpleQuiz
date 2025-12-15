import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("Kết nối với DB thành công");
  } catch (error) {
    console.log("Fail to connect to DB: ", error);
    process.exit(1);
  }
};
