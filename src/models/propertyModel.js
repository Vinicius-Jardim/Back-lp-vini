import mongoose from "mongoose";

export const type = {
  HOUSE: "Moradia",
  APARTMENT: "Apartamento",
  LAND: "Terreno",
};

export const condition = {
  HOUSEANDAPARTMENT: [
    "Nova Construção",
    "Recentemente Renovada",
    "Construção Antiga",
  ],
  LAND: ["Agrícola", "Urbano", "Rural"],
};

const PropertySchema = new mongoose.Schema({
  type: { type: String, enum: Object.values(type), required: true }, // house, apartment, land
  street: { type: String, required: true },
  size: { type: Number, required: true },
  condition: { type: String, required: true },
  bedrooms: {
    type: Number,
    required: function () {
      return this.type === type.HOUSE || this.type === type.APARTMENT;
    },
  }, // House or Apartment
  bathrooms: {
    type: Number,
    required: function () {
      return this.type === type.HOUSE || this.type === type.APARTMENT;
    },
  }, // House or Apartment
  floors: {
    type: Number,
    required: function () {
      return this.type === type.HOUSE || this.type === type.APARTMENT;
    },
  }, // House
  garageSize: {
    type: Number,
    required: function () {
      return this.type === type.HOUSE || this.type === type.APARTMENT;
    },
  }, // House
  doorNumber: { type: String, required: true },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  parish: { type: String, required: true },
  city: { type: String, required: true },
  price: { 
    type: Number, 
    required: true,
    get: function(num) {
      return (num/1).toFixed(2);
    },
    set: function(num) {
      return parseFloat(num);
    }
  },
  description: { type: String, required: true },
  fotos: [{ type: String }],
  videos: [{ type: String }],
  plants: [{ type: String }],
  mapLocation: { type: String, required: true },
  features: {
    airConditioning: { type: Boolean, default: false },
    builtInCabinets: { type: Boolean, default: false },
    elevator: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    garden: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
  },
  customFeatures: [{ type: String }],
  dateAdded: { type: Date, default: Date.now },
  status: { type: String, required: true }, //Boleano ou string ???
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

export const Property = mongoose.model("Property", PropertySchema);
