const { z } = require("zod");

exports.createCategorySchema = z.object({
  name: z.string().trim().min(2, "الاسم لازم حرفين على الأقل"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "الـ slug حروف إنجليزية صغيرة وأرقام وشرطة بس"),
  description: z.string().trim().optional(),
  image: z.string().url("رابط الصورة غير صحيح").optional(),
  parentCategory: z.string().optional(),
});
