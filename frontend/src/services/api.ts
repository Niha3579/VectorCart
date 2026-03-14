import axios from 'axios';

// Added 'export' here so you can import { api } in other files
export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
});

// Automatically attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
  // Use a check for window to avoid SSR errors in Next.js
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authService = {
  login: (data: any) => api.post('/auth/login', data, { 
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' } 
  }),
  register: (data: any) => api.post('/auth/register', data),
};

export const productService = {
  getAll: () => api.get('/products/'),
  getOne: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products/', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const chatService = {
  query: (message: string) => api.post('/chatbot/query', { message }),
};

export const orderService = {
  // Matched to your backend @router.post("/checkout")
  create: (orderData: any = {}) => api.post('/orders/checkout', orderData),
  // Matched to your backend @router.get("/history")
  getMyOrders: () => api.get('/orders/history'),
};

export const cartService = {
  // This sends the item to MongoDB
  syncAdd: (productId: string, qty: number) => 
    api.post('/cart/add', { product_id: productId, quantity: qty }),
};