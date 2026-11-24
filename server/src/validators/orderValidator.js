const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "معرّف غير صحيح");

exports.createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: objectId,
        quantity: z
          .number({ invalid_type_error: "الكمية لازم تكون رقم" })
          .int("الكمية لازم رقم صحيح")
          .min(1, "الكمية 1 على الأقل")
          .max(100, "الكمية كبيرة جدًا"),
      }),
    )
    .min(1, "الطلب لازم يحتوي على صنف واحد على الأقل")
    .max(50, "عدد الأصناف كبير جدًا"),
  shippingAddress: z.object({
    name: z.string().trim().min(2, "الاسم حرفين على الأقل"),
    phone: z
      .string()
      .trim()
      .regex(/^01[0125][0-9]{8}$/, "رقم التليفون لازم يكون رقم مصري صحيح"),
    address: z.string().trim().min(5, "العنوان قصير جدًا"),
  }),
  notes: z.string().trim().max(500, "الملاحظات طويلة جدًا").optional(),
});
