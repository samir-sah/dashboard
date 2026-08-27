import apiFetch from '@/services/api/api.service';
import { API_CONFIG } from '@/config/api.config';

export const inventoryService = {
  // GET all devices (inventory items)
  getProducts: () => apiFetch(API_CONFIG.endpoints.products),

  // GET single device by _id or productId
  getProductById: (id) => apiFetch(API_CONFIG.endpoints.productById(id)),

  // PATCH update device fields
  updateProduct: (id, data) =>
    apiFetch(API_CONFIG.endpoints.productById(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
