const { z } = require("zod");

const dim = z
  .number()
  .min(0, "المقاس مينفعش يكون بالسالب")
  .max(10000, "المقاس كبير جدًا");

exports.createCustomRequestSchema = z.object({
  contact: z.object({
    name: z.string().trim().min(2, "الاسم حرفين على الأقل"),
    phone: z
      .string()
      .trim()
      .regex(/^01[0125][0-9]{8}$/, "رقم التليفون لازم يكون رقم مصري صحيح"),
  }),
  productType: z.string().trim().min(2, "نوع القطعة مطلوب").max(100),
  dimensions: z
    .object({
      length: dim.optional(),
      width: dim.optional(),
      height: dim.optional(),
    })
    .optional(),
  woodType: z.string().trim().max(100).optional(),
  designImages: z
    .array(z.string().url("رابط صورة غير صحيح"))
    .max(10, "أقصى عدد 10 صور")
    .optional(),
  description: z.string().trim().max(2000, "الوصف طويل جدًا").optional(),
});

exports.updateCustomRequestSchema = z
  .object({
    status: z.enum(
      ["new", "contacted", "quoted", "in-progress", "delivered", "cancelled"],
      { errorMap: () => ({ message: "حالة الطلب غير صحيحة" }) },
    ),
    estimatedPrice: z.number().min(0, "السعر مينفعش يكون بالسالب"),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "لازم تبعت status أو estimatedPrice",
  });
