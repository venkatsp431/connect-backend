import mongoose from "mongoose";

const mongoURL =
  "mongodb+srv://venki31:venki31@cluster0.bsuixgr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default function createConnection() {
  mongoose.connect(mongoURL);
  console.log("Mongo connected Sucessfully");
}
