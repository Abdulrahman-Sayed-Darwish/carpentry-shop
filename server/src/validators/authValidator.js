const { z } = require("zod");

exports.loginSchema = z.object({
  identifier: z.string().trim().min(1, "اسم المستخدم أو الإيميل مطلوب"),
  password: z.string().min(1, "الباسورد مطلوب"),
});

exports.registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "اسم المستخدم 3 حروف على الأقل")
    .regex(/^[a-zA-Z0-9_]+$/, "حروف إنجليزية وأرقام وشرطة سفلية بس"),
  email: z.string().trim().toLowerCase().email("الإيميل غير صحيح"),
  password: z.string().min(8, "الباسورد 8 حروف على الأقل"),
});
