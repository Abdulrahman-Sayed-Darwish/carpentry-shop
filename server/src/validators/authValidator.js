const { z } = require("zod");

exports.loginSchema = z.object({
  username: z.string().trim().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "الباسورد مطلوب"),
});
