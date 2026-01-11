import { products as initialProducts, Product } from './products';

// Use globalThis to persist user-added products across hot reloads in development
const globalForMockStore = globalThis as unknown as {
    mockStore: {
        products: Product[];
    };
};

if (!globalForMockStore.mockStore) {
    globalForMockStore.mockStore = {
        products: [...initialProducts],
    };
}

export const mockStore = {
    getProducts: () => globalForMockStore.mockStore.products,
    addProduct: (product: Product) => {
        globalForMockStore.mockStore.products.push(product);
    },
};
