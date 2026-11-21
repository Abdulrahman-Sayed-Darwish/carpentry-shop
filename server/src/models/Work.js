const mongoose = require("mongoose");

const workSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
  },
  { timestamps: true },
);

workSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("Work", workSchema);
