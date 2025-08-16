import dotenv from "dotenv";
dotenv.config();
import connectDB from "../server/src/config/db.js";
import app from "../server/src/app.js";

const PORT = process.env.PORT || 5000;
await connectDB();

app.listen(PORT, () => console.log(`StudyBuddy (primary) backend running on http://localhost:${PORT}`));
