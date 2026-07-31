const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const landlordProfileSchema = new mongoose.Schema(
  {
    legalName: { type: String, trim: true, maxlength: 120 },
    landlordType: {
      type: String,
      enum: ["individual", "company", "partnership"],
    },
    businessName: { type: String, trim: true, maxlength: 120 },
    propertyCount: { type: Number, min: 0, max: 100000 },
    primaryLocations: { type: String, trim: true, maxlength: 250 },
    propertyTypes: {
      type: [String],
      enum: ["apartments", "houses", "hmos", "commercial"],
      default: [],
    },
    managementStyle: {
      type: String,
      enum: ["self-managed", "agency-managed", "hybrid"],
    },
    primaryGoal: {
      type: String,
      enum: ["manage-properties", "review-applicants", "organize-rent"],
    },
    updatedAt: Date,
  },
  { _id: false },
);

const renterProfileSchema = new mongoose.Schema(
  {
    legalName: { type: String, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 30 },
    householdSize: {
      type: String,
      enum: ["one", "two", "three", "four-plus"],
    },
    petStatus: {
      type: String,
      enum: ["none", "one", "multiple"],
    },
    employmentStatus: {
      type: String,
      enum: ["employed", "self-employed", "student", "retired", "other"],
    },
    jobTitle: { type: String, trim: true, maxlength: 120 },
    employer: { type: String, trim: true, maxlength: 120 },
    monthlyBudget: { type: Number, min: 0, max: 1000000 },
    preferredLocations: { type: String, trim: true, maxlength: 250 },
    propertyType: {
      type: String,
      enum: ["apartment", "house", "studio", "shared-home", "flexible"],
    },
    moveInDate: Date,
    updatedAt: Date,
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, maxlength: 128 },
    role: {
      type: String,
      enum: ["renter", "landlord", "admin"],
      default: null,
    },
    landlordProfile: { type: landlordProfileSchema, default: undefined },
    renterProfile: { type: renterProfileSchema, default: undefined },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
