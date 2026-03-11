export type Vehicle = {
      id: string;
      make: string;
      model: string;
      year: number;
      price: number; // plain dollars
      mileage: string;
      fuelType: string;
      image: string;
      description: string;
      rating: number; // 0-5 scale
    };

    const VEHICLES_KEY = 'ancar_vehicles_v1';

    const seedVehicles: Vehicle[] = [
      {
        id: '1',
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        price: 24999,
        mileage: '15,000',
        fuelType: 'Gasoline',
        image:
          'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description:
          'Reliable mid-size sedan with a comfortable interior, great fuel economy, and advanced safety features. One-owner, full service history.',
        rating: 4.6,
      },
      {
        id: '2',
        make: 'Honda',
        model: 'CR-V',
        year: 2023,
        price: 28999,
        mileage: '8,500',
        fuelType: 'Gasoline',
        image:
          'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description:
          'Compact SUV offering roomy cargo space and a smooth ride, perfect for families and daily commuters. Excellent safety equipment.',
        rating: 4.7,
      },
      {
        id: '3',
        make: 'BMW',
        model: '3 Series',
        year: 2021,
        price: 32999,
        mileage: '22,000',
        fuelType: 'Gasoline',
        image:
          'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description:
          'Sporty luxury sedan with responsive handling, premium interior finishes, and advanced driving assist features.',
        rating: 4.5,
      },
      {
        id: '4',
        make: 'Ford',
        model: 'F-150',
        year: 2020,
        price: 35999,
        mileage: '45,000',
        fuelType: 'Gasoline',
        image:
          'https://placehold.co/1200x400',
        description:
          'Full-size pickup with strong towing capacity, rugged build, and well-maintained service records. Ideal for work or recreation.',
        rating: 4.4,
      },
      {
        id: '5',
        make: 'Tesla',
        model: 'Model 3',
        year: 2022,
        price: 39999,
        mileage: '12,000',
        fuelType: 'Electric',
        image:
          'https://placehold.co/1200x400',
        description:
          'All-electric sedan with impressive acceleration, excellent range, and modern driver assistance features. Low running costs.',
        rating: 4.8,
      },
      {
        id: '6',
        make: 'Subaru',
        model: 'Outback',
        year: 2021,
        price: 27999,
        mileage: '30,000',
        fuelType: 'Gasoline',
        image:
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        description:
          'Versatile wagon with standard all-wheel drive, great ground clearance, and a reputation for dependability—perfect for adventurers.',
        rating: 4.5,
      },
    ];

    function readStorage(): Vehicle[] {
      try {
        const raw = localStorage.getItem(VEHICLES_KEY);
        if (!raw) {
          localStorage.setItem(VEHICLES_KEY, JSON.stringify(seedVehicles));
          return seedVehicles;
        }
        return JSON.parse(raw) as Vehicle[];
      } catch {
        return seedVehicles;
      }
    }

    function writeStorage(list: Vehicle[]) {
      localStorage.setItem(VEHICLES_KEY, JSON.stringify(list));
    }

    export function getVehicles(): Vehicle[] {
      return readStorage();
    }

    export function getVehicleById(id: string): Vehicle | undefined {
      return readStorage().find((v) => v.id === id);
    }

    export function addVehicle(v: Omit<Vehicle, 'id'>): Vehicle {
      const list = readStorage();
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newV: Vehicle = { id, ...v };
      list.unshift(newV);
      writeStorage(list);
      return newV;
    }

    export function updateVehicle(id: string, patch: Partial<Vehicle>): Vehicle | undefined {
      const list = readStorage();
      const idx = list.findIndex((x) => x.id === id);
      if (idx === -1) return undefined;
      const updated = { ...list[idx], ...patch };
      list[idx] = updated;
      writeStorage(list);
      return updated;
    }

    export function deleteVehicle(id: string): boolean {
      const list = readStorage();
      const filtered = list.filter((x) => x.id !== id);
      if (filtered.length === list.length) return false;
      writeStorage(filtered);
      return true;
    }