require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

(async () => {
  try {
    const { ADMIN_USERNAME, ADMIN_PASSWORD, MONGODB_URI } = process.env;

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      console.error("ضيف ADMIN_USERNAME و ADMIN_PASSWORD في ملف .env");
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);

    const exists = await User.findOne({ username: ADMIN_USERNAME });
    if (exists) {
      console.log("الأدمن موجود قبل كده");
    } else {
      await User.create({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        role: "admin",
      });
      console.log("تم إنشاء حساب الأدمن");
    }
  } catch (err) {
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
