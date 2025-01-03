import mongoose from "mongoose";

// Esquema para os itens da wishlist
const WishListItemSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  }, // Referência ao ID da propriedade
  note: { type: String, default: "" }, // Nota do usuário
});

// Esquema para a wishlist
const WishlistSchema = new mongoose.Schema({
  items: [WishListItemSchema],
  total: { type: Number, default: 0 },
});

const Wishlist = mongoose.model("Wishlist", WishlistSchema);

export { Wishlist };
