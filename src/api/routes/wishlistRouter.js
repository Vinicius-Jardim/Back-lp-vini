import { Router } from "express";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { WishlistController } from "../../controllers/wishlistController.js";
import { WishlistService } from "../../services/controllers/wishlistService.js";
import authorize from "../../middlewares/authorize.js";
import { WishlistValidator } from "../../validators/wishlistValidator.js";
import { checkUserExists } from "../../middlewares/checkUser.js";
import { roles } from "../../models/usersModel.js";

const router = Router();
const wishlistService = new WishlistService();
const wishlistController = new WishlistController(wishlistService);

// ========================== Wishlist Routes ==========================

// Adicionar item à wishlist
router.post(
  "/add/:itemId",
  verifyToken,
  checkUserExists,
  authorize(roles.CLIENT),
  WishlistValidator.addToWishlist(),
  wishlistController.addToWishlist
);

// Remover item da wishlist
router.delete(
  "/remove/:itemId",
  verifyToken,
  checkUserExists,
  authorize(roles.CLIENT),
  WishlistValidator.removeFromWishlist(),
  wishlistController.removeFromWishlist
);

// Limpar wishlist
router.delete(
  "/clear",
  verifyToken,
  checkUserExists,
  authorize(roles.CLIENT),
  WishlistValidator.clearWishlist(),
  wishlistController.clearWishlist
);

// Listar wishlist
router.get(
  "/mine",
  verifyToken,
  checkUserExists,
  authorize(roles.CLIENT),
  WishlistValidator.viewWishlist(),
  wishlistController.viewWishlist
);

// ==============================ADMIN ROUTES ================================

// Get All Wishlist
router.get(
  "/all",
  verifyToken,
  checkUserExists,
  authorize(roles.ADMIN),
  WishlistValidator.viewAllWishlist(),
  wishlistController.viewAllWishlist
);
export default router;
