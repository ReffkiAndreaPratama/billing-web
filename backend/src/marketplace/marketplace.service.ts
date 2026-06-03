import { Injectable } from '@nestjs/common';

export interface Product {
  id: string; name: string; description: string; price: number; category: string;
  image?: string; stock: number; type: 'VOUCHER' | 'ITEM' | 'TOPUP';
}

export interface Purchase {
  id: string; productId: string; productName: string; quantity: number; total: number;
  buyerName: string; buyerId: string; code?: string; status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
}

@Injectable()
export class MarketplaceService {
  private products: Product[] = [
    { id: 'p1', name: 'Mobile Legends 100 Diamond', description: 'MLBB 100 Diamond', price: 20000, category: 'Mobile Legends', stock: 999, type: 'TOPUP' },
    { id: 'p2', name: 'Mobile Legends 500 Diamond', description: 'MLBB 500 Diamond', price: 90000, category: 'Mobile Legends', stock: 999, type: 'TOPUP' },
    { id: 'p3', name: 'Free Fire 100 Gems', description: 'FF 100 Gems', price: 15000, category: 'Free Fire', stock: 999, type: 'TOPUP' },
    { id: 'p4', name: 'PUBG UC 100', description: 'PUBG 100 UC', price: 25000, category: 'PUBG', stock: 999, type: 'TOPUP' },
    { id: 'p5', name: 'VALORANT Points 100', description: '100 VP', price: 15000, category: 'VALORANT', stock: 999, type: 'TOPUP' },
    { id: 'p6', name: 'Steam Wallet 50K', description: 'Steam Wallet IDR 50,000', price: 55000, category: 'Steam', stock: 100, type: 'VOUCHER' },
    { id: 'p7', name: 'Steam Wallet 100K', description: 'Steam Wallet IDR 100,000', price: 110000, category: 'Steam', stock: 100, type: 'VOUCHER' },
    { id: 'p8', name: 'Garena Shells 100', description: '100 Garena Shells', price: 18000, category: 'Garena', stock: 999, type: 'TOPUP' },
    { id: 'p9', name: 'Headset Gaming RGB', description: 'Headset gaming dengan RGB', price: 150000, category: 'Merchandise', stock: 10, type: 'ITEM' },
    { id: 'p10', name: 'Mousepad XXL', description: 'Mousepad ukuran besar', price: 75000, category: 'Merchandise', stock: 20, type: 'ITEM' },
  ];
  private purchases: Purchase[] = [];

  getProducts(category?: string): Product[] {
    return category ? this.products.filter(p => p.category === category) : this.products;
  }

  getCategories(): string[] {
    return [...new Set(this.products.map(p => p.category))];
  }

  purchase(dto: { productId: string; quantity: number; buyerName: string; buyerId: string }): Purchase {
    const product = this.products.find(p => p.id === dto.productId);
    if (!product) throw new Error('Product not found');
    if (product.stock < dto.quantity) throw new Error('Insufficient stock');
    product.stock -= dto.quantity;
    const code = product.type === 'VOUCHER' || product.type === 'TOPUP'
      ? `${product.name.toUpperCase().replace(/\s/g, '')}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      : undefined;
    const purchase: Purchase = {
      id: `buy-${Date.now()}`,
      productId: dto.productId, productName: product.name,
      quantity: dto.quantity, total: product.price * dto.quantity,
      buyerName: dto.buyerName, buyerId: dto.buyerId,
      code, status: 'COMPLETED', createdAt: new Date(),
    };
    this.purchases.push(purchase);
    return purchase;
  }

  getPurchases(buyerId?: string): Purchase[] {
    return buyerId ? this.purchases.filter(p => p.buyerId === buyerId) : this.purchases;
  }

  todayRevenue(): number {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return this.purchases
      .filter(p => p.status === 'COMPLETED' && new Date(p.createdAt) >= today)
      .reduce((s, p) => s + p.total, 0);
  }
}
