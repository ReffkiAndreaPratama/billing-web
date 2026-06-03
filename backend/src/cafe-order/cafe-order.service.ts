import { Injectable } from '@nestjs/common';

export interface MenuItem { id: string; name: string; price: number; category: string; image?: string; }
export interface OrderItem { menuItemId: string; quantity: number; notes?: string; }
export interface Order { id: string; unitId: string; items: OrderItem[]; total: number; status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERED' | 'CANCELLED'; createdAt: Date; }

@Injectable()
export class CafeOrderService {
  private menu: MenuItem[] = [
    { id: 'm1', name: 'Nasi Goreng', price: 25000, category: 'Makanan' },
    { id: 'm2', name: 'Mie Goreng', price: 20000, category: 'Makanan' },
    { id: 'm3', name: 'Kentang Goreng', price: 15000, category: 'Snack' },
    { id: 'm4', name: 'Ayam Geprek', price: 30000, category: 'Makanan' },
    { id: 'm5', name: 'Indomie Rebus', price: 12000, category: 'Makanan' },
    { id: 'm6', name: 'Kopi Hitam', price: 10000, category: 'Minuman' },
    { id: 'm7', name: 'Kopi Susu', price: 15000, category: 'Minuman' },
    { id: 'm8', name: 'Es Teh', price: 8000, category: 'Minuman' },
    { id: 'm9', name: 'Air Mineral', price: 5000, category: 'Minuman' },
    { id: 'm10', name: 'Jus Jeruk', price: 12000, category: 'Minuman' },
    { id: 'm11', name: 'Soda Gembira', price: 15000, category: 'Minuman' },
    { id: 'm12', name: 'Cireng', price: 10000, category: 'Snack' },
    { id: 'm13', name: 'Pisang Goreng', price: 10000, category: 'Snack' },
    { id: 'm14', name: 'Rokok', price: 25000, category: 'Lainnya' },
  ];
  private orders: Order[] = [];

  getMenu(category?: string): MenuItem[] {
    return category ? this.menu.filter(m => m.category === category) : this.menu;
  }

  getCategories(): string[] {
    return [...new Set(this.menu.map(m => m.category))];
  }

  createOrder(unitId: string, items: OrderItem[]): Order {
    const total = items.reduce((sum, item) => {
      const menuItem = this.menu.find(m => m.id === item.menuItemId);
      return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);
    const order: Order = {
      id: `order-${Date.now()}`,
      unitId,
      items,
      total,
      status: 'PENDING',
      createdAt: new Date(),
    };
    this.orders.push(order);
    return order;
  }

  getOrders(unitId?: string): Order[] {
    return unitId ? this.orders.filter(o => o.unitId === unitId) : this.orders;
  }

  updateStatus(id: string, status: Order['status']): Order | null {
    const order = this.orders.find(o => o.id === id);
    if (order) { order.status = status; return order; }
    return null;
  }

  todayRevenue(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.orders
      .filter(o => o.status === 'DELIVERED' && new Date(o.createdAt) >= today)
      .reduce((sum, o) => sum + o.total, 0);
  }
}
