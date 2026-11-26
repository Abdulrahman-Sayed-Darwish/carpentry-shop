require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");
const Work = require("./models/Work");
const Product = require("./models/Product");

const IMAGES = {
  kitchens: ["https://placehold.co/600x400?text=Kitchen"],
  bedrooms: ["https://placehold.co/600x400?text=Bedroom"],
  doors: ["https://placehold.co/600x400?text=Door"],
  "living-rooms": ["https://placehold.co/600x400?text=Living+Room"],
};

const categories = [
  {
    name: "مطابخ",
    slug: "kitchens",
    description: "مطابخ خشب بتصميمات مودرن وكلاسيك",
  },
  { name: "غرف نوم", slug: "bedrooms", description: "غرف نوم كاملة" },
  { name: "أبواب", slug: "doors", description: "أبواب خشب طبيعي" },
  { name: "ريسبشن", slug: "living-rooms", description: "أنتريهات وترابيزات" },
];

const works = [
  {
    title: "مطبخ خشب زان",
    category: "kitchens",
    description: "مطبخ كامل بتصميم مودرن",
  },
  {
    title: "مطبخ L بدولاب علوي",
    category: "kitchens",
    description: "مطبخ شكل L مع تخزين إضافي",
  },
  {
    title: "غرفة نوم كلاسيك",
    category: "bedrooms",
    description: "غرفة نوم من خشب الموسكي",
  },
  {
    title: "باب مدخل منقوش",
    category: "doors",
    description: "باب مدخل خشب طبيعي بنقوش",
  },
  {
    title: "أنتريه مودرن",
    category: "living-rooms",
    description: "أنتريه بتصميم عصري",
  },
];

const products = [
  {
    name: "باب خشب زان",
    category: "doors",
    price: 3500,
    stock: 8,
    sku: "DOOR-001",
    description: "باب داخلي خشب زان طبيعي",
    dimensions: { length: 210, width: 90, height: 4 },
  },
  {
    name: "باب مدخل موسكي",
    category: "doors",
    price: 5200,
    stock: 4,
    sku: "DOOR-002",
    description: "باب مدخل بتشطيب فاخر",
    dimensions: { length: 215, width: 100, height: 5 },
  },
  {
    name: "ترابيزة سفرة 6 كراسي",
    category: "living-rooms",
    price: 9800,
    stock: 3,
    sku: "TBL-001",
    description: "ترابيزة سفرة خشب زان مع 6 كراسي",
    dimensions: { length: 180, width: 90, height: 75 },
  },
  {
    name: "سرير مفرد",
    category: "bedrooms",
    price: 4200,
    stock: 6,
    sku: "BED-001",
    description: "سرير مفرد خشب متين",
    dimensions: { length: 200, width: 100, height: 40 },
  },
  {
    name: "دولاب ملابس 3 ضلف",
    category: "bedrooms",
    price: 7500,
    stock: 2,
    sku: "WRD-001",
    description: "دولاب 3 ضلف بمرايا",
    dimensions: { length: 150, width: 55, height: 220 },
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Promise.all([
      Work.deleteMany(),
      Product.deleteMany(),
      Category.deleteMany(),
    ]);

    const created = await Category.insertMany(categories);
    const bySlug = Object.fromEntries(created.map((c) => [c.slug, c._id]));

    await Work.insertMany(
      works.map((w) => ({
        ...w,
        category: bySlug[w.category],
        images: IMAGES[w.category],
      })),
    );

    await Product.insertMany(
      products.map((p) => ({
        ...p,
        category: bySlug[p.category],
        images: IMAGES[p.category],
      })),
    );

    console.log(
      `تم: ${created.length} تصنيفات، ${works.length} أعمال، ${products.length} منتجات`,
    );
  } catch (err) {
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
