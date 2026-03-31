export interface Branch {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
}

export const branches: Branch[] = [
  {
    id: 1,
    name: 'Downtown Location',
    city: 'New York',
    address: '123 Main Street, New York, NY 10001',
    phone: '(212) 555-0123',
    hours: 'Mon-Sat: 9AM-6PM, Sun: 11AM-5PM',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'Midtown Location',
    city: 'New York',
    address: '456 Fifth Avenue, New York, NY 10022',
    phone: '(212) 555-0124',
    hours: 'Mon-Sat: 9AM-6PM, Sun: 11AM-5PM',
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'Brooklyn Location',
    city: 'Brooklyn',
    address: '789 Flatbush Avenue, Brooklyn, NY 11226',
    phone: '(718) 555-0125',
    hours: 'Mon-Sat: 9AM-6PM, Sun: 11AM-5PM',
    image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    name: 'Queens Location',
    city: 'Queens',
    address: '321 Roosevelt Avenue, Queens, NY 11368',
    phone: '(718) 555-0126',
    hours: 'Mon-Sat: 9AM-6PM, Sun: 11AM-5PM',
    image: 'https://images.unsplash.com/photo-1487958449943-edee5ba872d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    name: 'Bronx Location',
    city: 'Bronx',
    address: '654 Grand Concourse, Bronx, NY 10451',
    phone: '(718) 555-0127',
    hours: 'Mon-Sat: 9AM-6PM, Sun: 11AM-5PM',
    image: 'https://images.unsplash.com/photo-1464219414775-abc3e36db3c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];
