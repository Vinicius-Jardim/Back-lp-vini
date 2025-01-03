export class WishlistController {
  constructor(wishlistService) {
    this.wishlistService = wishlistService;
  }

  addToWishlist = async (req, res) => {
    try {
      const data = {
        userId: req.user,
        itemId: req.params.itemId,
        note: req.body.note || "",
      };
      const wishlist = await this.wishlistService.addToWishlist(data);
      res.status(200).json(wishlist);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  removeFromWishlist = async (req, res) => {
    try {
      const data = {
        userId: req.user,
        itemId: req.params.itemId,
      };
      const response = await this.wishlistService.removeFromWishlist(data);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  viewWishlist = async (req, res) => {
    try {
      const response = await this.wishlistService.viewWishlist(req.user);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  clearWishlist = async (req, res) => {
    try {
      const response = await this.wishlistService.clearWishlist(req.user);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  viewAllWishlist = async (req, res) => {
    try {
      const data = {
        limit: req.query.limit,
        page: req.query.page,
        itemProperty: req.query.itemProperty,
      };
      const response = await this.wishlistService.viewAllWishlist(data);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}
