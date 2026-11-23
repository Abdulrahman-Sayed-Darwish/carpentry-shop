const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "معرّف غير صحيح");

exports.createProductSchema = z.object({
  name: z.string().trim().min(2, "الاسم لازم حرفين على الأقل"),
  description: z.string().trim().optional(),
  category: objectId,
  images: z.array(z.string().url("رابط صورة غير صحيح")).optional(),
  price: z
    .number({ invalid_type_error: "السعر لازم يكون رقم" })
    .min(0, "السعر مينفعش يكون بالسالب"),
  stock: z
    .number()
    .int("المخزون لازم رقم صحيح")
    .min(0, "المخزون مينفعش يكون بالسالب")
    .optional(),
  sku: z.string().trim().min(2, "الكود حرفين على الأقل").optional(),
  dimensions: z
    .object({
      length: z.number().min(0).optional(),
      width: z.number().min(0).optional(),
      height: z.number().min(0).optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

exports.updateProductSchema = exports.createProductSchema.partial();
