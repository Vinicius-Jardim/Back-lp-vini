import { User, roles } from "../../models/usersModel.js";
import { Property } from "../../models/propertyModel.js";
import { Wishlist } from "../../models/wishlistModel.js";

export class WishlistService {
  // Método para remover item da wishlist
  async removeFromWishlist(data) {
    try {
      const propertyId = data.itemId;
      const user = await User.findById(data.userId);

      if (user.role === roles.AGENT || user.role === roles.ADMIN) {
        return "Agents and admins cannot have wishlists";
      }

      const wishlist = await Wishlist.findById(user.wishlist);
      if (!wishlist) {
        throw new Error("Wishlist not found");
      }

      // Verifica se a propriedade está na wishlist
      const initialLength = wishlist.items.length;
      wishlist.items = wishlist.items.filter(
        (item) => item.property.toString() !== propertyId
      );

      // Verifica se algum item foi realmente removido
      if (wishlist.items.length === initialLength) {
        return "No property with the provided ID was found in the wishlist";
      }
      await wishlist.save();
      return wishlist;
    } catch (error) {
      throw new Error("Problem in removing item from wishlist " + error);
    }
  }

  // Método para visualizar a wishlist
  async viewWishlist(data) {
    try {
      const userId = data;
      const user = await User.findById(userId);

      if (user.role === roles.AGENT || user.role === roles.ADMIN) {
        return "Agents and admins cannot have wishlists";
      }

      let wishList = await Wishlist.findById(user.wishlist);
      if (!wishList) {
        wishList = await Wishlist.create({
          _id: user.wishlist,
          items: [],
          total: 0,
        });

        user.wishlist = wishList._id;
        await user.save();
      }
      return wishList;
    } catch (error) {
      throw new Error("Problem in fetching user" + error);
    }
  }

  async addToWishlist(data) {
    try {
      // Valida a entrada
      if (!data.userId || !data.itemId) {
        throw new Error("Invalid input: userId and itemId are required");
      }

      const user = await User.findById(data.userId);
      if (!user) {
        return "User not found";
      }

      if (user.role === roles.AGENT || user.role === roles.ADMIN) {
        return "Agents and admins cannot have wishlists";
      }

      // Verifica se a wishlist já existe
      let wishlist = await Wishlist.findById(user.wishlist);
      if (!wishlist) {
        wishlist = await Wishlist.create({
          _id: user.wishlist,
          items: [],
          total: 0,
        });

        user.wishlist = wishlist._id;
        await user.save();
      }

      // Verifica se a propriedade existe
      const property = await Property.findById(data.itemId);
      if (!property) {
        return "Property not found";
      }

      // Verifica se o item já está na wishlist
      const isItemAlreadyInWishlist = wishlist.items.some(
        (item) => item.property.toString() === data.itemId
      );
      if (isItemAlreadyInWishlist) {
        return "Item already in wishlist";
      }

      // Adiciona o item à wishlist
      const item = {
        property: data.itemId,
        note: data.note || "", // `note` opcional
      };
      wishlist.items.push(item);

      // Atualiza o total
      wishlist.total = wishlist.items.length;

      await wishlist.save();
      user.wishlist = wishlist._id;
      await user.save();

      return wishlist;
    } catch (error) {
      throw new Error("Problem in adding item to wishlist: " + error.message);
    }
  }

  async clearWishlist(data) {
    try {
      const user = await User.findById(data);
      const wishlist = await Wishlist.findById(user.wishlist);
      if (!wishlist) {
        throw new Error("Wishlist not found");
      }
      if (wishlist.items.length === 0) {
        return "Wishlist is already empty";
      }
      wishlist.items = [];
      await wishlist.save();
      return wishlist;
    } catch (error) {
      throw new Error("Problem in clearing wishlist " + error);
    }
  }

  async viewAllWishlist(data) {
    try {
      // Filtro para wishlists que tenham itens e que opcionalmente contenham um item específico
      const filter = {
        items: { $exists: true, $not: { $size: 0 } }, // Garante que o array `items` não está vazio
        ...(data.itemProperty && { "items.property": data.itemProperty }), // Filtra por propriedade específica, se fornecida
      };

      // Calcula o número total de wishlists e páginas
      const totalWishlists = await Wishlist.countDocuments(filter);
      const totalPages = Math.ceil(totalWishlists / data.limit);

      // Corrige a página solicitada para a mais próxima disponível, se necessário
      const correctedPage = data.page > totalPages ? totalPages : data.page;

      // Caso não existam wishlists, retorna uma mensagem apropriada
      if (totalWishlists === 0) {
        return "No wishlists found matching the criteria";
      }

      // Calcula o número de documentos a pular com base na página corrigida
      const skip = (correctedPage - 1) * data.limit;

      // Realiza a consulta com paginação e filtro
      const wishlists = await Wishlist.find(filter)
        .skip(skip)
        .limit(data.limit);

      return {
        wishlists,
        currentPage: correctedPage,
        totalPages,
        totalWishlists,
      };
    } catch (error) {
      throw new Error("Problem in fetching wishlists: " + error.message);
    }
  }
}
