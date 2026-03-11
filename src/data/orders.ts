import { getVehicleById } from './vehicles.ts';

    export type OrderStatus = 'in progress' | 'out for delivery' | 'completed' | 'cancelled';

    export type Order = {
      id: string;
      customerEmail: string;
      customerName?: string;
      vehicleId: string;
      amount: number; // dollars
      status: OrderStatus;
      createdAt: string;
    };

    const ORDERS_KEY = 'ancar_orders_v1';

    const seedOrders: Order[] = (() => {
      // create a couple of sample orders referencing seeded vehicles if present
      const now = new Date();
      const v1 = getVehicleById('1');
      const v2 = getVehicleById('2');
      return [
        {
          id: `ord-${Date.now() - 1000000}`,
          customerEmail: 'sarah@example.com',
          customerName: 'Sarah Johnson',
          vehicleId: v1 ? v1.id : '1',
          amount: v1 ? v1.price : 24999,
          status: 'completed',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 40).toISOString(),
        },
        {
          id: `ord-${Date.now() - 500000}`,
          customerEmail: 'michael@example.com',
          customerName: 'Michael Chen',
          vehicleId: v2 ? v2.id : '2',
          amount: v2 ? v2.price : 28999,
          status: 'in progress',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        },
      ];
    })();

    function readOrders(): Order[] {
      try {
        const raw = localStorage.getItem(ORDERS_KEY);
        if (!raw) {
          localStorage.setItem(ORDERS_KEY, JSON.stringify(seedOrders));
          return seedOrders;
        }
        return JSON.parse(raw) as Order[];
      } catch {
        return seedOrders;
      }
    }

    function writeOrders(list: Order[]) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
    }

    export function getOrders(): Order[] {
      return readOrders();
    }

    export function getOrderById(id: string): Order | undefined {
      return readOrders().find((o) => o.id === id);
    }

    export function addOrder(o: Omit<Order, 'id' | 'createdAt'>): Order {
      const list = readOrders();
      const id = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newO: Order = { id, createdAt: new Date().toISOString(), ...o };
      list.unshift(newO);
      writeOrders(list);
      return newO;
    }

    export function updateOrder(id: string, patch: Partial<Order>): Order | undefined {
      const list = readOrders();
      const idx = list.findIndex((x) => x.id === id);
      if (idx === -1) return undefined;
      const updated = { ...list[idx], ...patch };
      list[idx] = updated;
      writeOrders(list);
      return updated;
    }

    export function deleteOrder(id: string): boolean {
      const list = readOrders();
      const filtered = list.filter((x) => x.id !== id);
      if (filtered.length === list.length) return false;
      writeOrders(filtered);
      return true;
    }