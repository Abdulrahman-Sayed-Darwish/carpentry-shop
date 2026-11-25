const mongoose = require("mongoose");

const customRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    contact: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    productType: { type: String, required: true, trim: true },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    woodType: { type: String, default: "", trim: true },
    designImages: { type: [String], default: [] },
    description: { type: String, default: "", trim: true },
    estimatedPrice: { type: Number, min: 0, default: null },
    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "quoted",
        "in-progress",
        "delivered",
        "cancelled",
      ],
      default: "new",
    },
  },
  { timestamps: true },
);

customRequestSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("CustomRequest", customRequestSchema);
