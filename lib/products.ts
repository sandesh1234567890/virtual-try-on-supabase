export interface Product {
  id: string; // Changed from number to string for Prisma compatibility
  name: string;
  category: string;
  image: string;
}

export const products: Product[] = [
  { id: '1', name: 'Your Red T-Shirt', category: 'T-Shirt', image: 'https://orangeidea.in/cdn/shop/files/HS07_Red.jpg?v=1726132378' },
  { id: '5', name: 'Your White T-Shirt', category: 'T-Shirt', image: 'https://orangeidea.in/cdn/shop/files/HS02_White.jpg?v=1726130844&width=150' },
  { id: '2', name: 'Denim Jacket', category: 'Jacket', image: 'https://assets.digitalcontent.marksandspencer.app/image/upload/w_1008,h_1319,q_auto,f_auto,e_sharpen/SD_03_T16_6466M_E2_X_EC_94' },
  { id: '6', name: 'Leather Jacket', category: 'Jacket', image: 'https://i.imgur.com/pl349pM.png' },
  { id: '10', name: 'Beige Trench Coat', category: 'Jacket', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6C0xOtO13DFeJvTMQ8FPkx1mArE43bTJYs4v2RSeHoAOPaSfSK9ANxtXPbxAlsyZEuKw&usqp=CAU' },
  { id: '3', name: 'Summer Dress', category: 'Dress', image: 'https://i.imgur.com/5d2S6zC.png' },
  { id: '7', name: 'Floral Sundress', category: 'Dress', image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQSToyOZL0lm55_HOX8bfD4GDP2lTOtPuCkgic0mfR6ow3sihcR' },
  { id: '8', name: 'Blue Evening Gown', category: 'Dress', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr-HKxMh2HpLrWDEBjCzhYaWwHndCKDeXeH3Oct1MRJ5SjuztR' },
  { id: '4', name: 'Formal Shirt', category: 'Shirt', image: 'https://i.imgur.com/KOABTTx.png' },
  { id: '12', name: 'Plaid Flannel Shirt', category: 'Shirt', image: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTNwa1VYTRdCQj8yU_BUUEp53aGpkj4Pe7f9E0RmyB4K0WLsr0x' },
  { id: '9', name: 'Navy Business Suit', category: 'Suit', image: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTCTVhGtN1IBcBw-5rZQsUp_5xVTG2mMj_0wF4vHe-lN55FXk4M' },
  { id: '11', name: 'Blue Jeans', category: 'Pants', image: 'https://i.ebayimg.com/images/g/sE8AAOSwK5tjxU~T/s-l1200.jpg' }
];

export const categories = Array.from(new Set(products.map(p => p.category)));
