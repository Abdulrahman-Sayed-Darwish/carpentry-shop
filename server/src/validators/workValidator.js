const { z } = require("zod");

exports.createWorkSchema = z.object({
  title: z.string().trim().min(2, "العنوان لازم حرفين على الأقل"),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "معرّف التصنيف غير صحيح"),
  description: z.string().trim().optional(),
  images: z.array(z.string().url("رابط صورة غير صحيح")).optional(),
});
