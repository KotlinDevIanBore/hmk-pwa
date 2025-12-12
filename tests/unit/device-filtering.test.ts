import { describe, it, expect } from 'vitest';

interface MobilityDevice {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: number;
  availability: boolean;
}

/**
 * Device Filtering Tests
 */
describe('Device Filtering', () => {
  const mockDevices: MobilityDevice[] = [
    {
      id: '1',
      name: 'Standard Wheelchair',
      description: 'Manual wheelchair',
      category: 'wheelchair',
      price: 15000,
      availability: true,
    },
    {
      id: '2',
      name: 'Elbow Crutches',
      description: 'Adjustable crutches',
      category: 'crutches',
      price: 3500,
      availability: true,
    },
    {
      id: '3',
      name: 'Folding Walker',
      description: 'Lightweight walker',
      category: 'walker',
      price: 5000,
      availability: true,
    },
    {
      id: '4',
      name: 'Below Knee Prosthetic',
      description: 'Custom prosthetic',
      category: 'prosthetics',
      price: 45000,
      availability: false,
    },
  ];

  it('should filter devices by category', () => {
    const category = 'wheelchair';
    const filtered = mockDevices.filter((device) => device.category === category);
    expect(filtered.length).toBe(1);
    expect(filtered[0].category).toBe('wheelchair');
  });

  it('should filter devices by availability', () => {
    const available = mockDevices.filter((device) => device.availability === true);
    expect(available.length).toBe(3);
  });

  it('should filter devices by search query in name', () => {
    const query = 'wheelchair';
    const filtered = mockDevices.filter((device) =>
      device.name.toLowerCase().includes(query.toLowerCase())
    );
    expect(filtered.length).toBe(1);
  });

  it('should filter devices by search query in description', () => {
    const query = 'adjustable';
    const filtered = mockDevices.filter((device) =>
      device.description.toLowerCase().includes(query.toLowerCase())
    );
    expect(filtered.length).toBe(1);
  });

  it('should filter devices by category and availability', () => {
    const category = 'wheelchair';
    const available = true;
    const filtered = mockDevices.filter(
      (device) => device.category === category && device.availability === available
    );
    expect(filtered.length).toBe(1);
  });

  it('should return all devices when no filters applied', () => {
    const filtered = mockDevices.filter(() => true);
    expect(filtered.length).toBe(mockDevices.length);
  });

  it('should return empty array when no devices match filter', () => {
    const category = 'orthotics';
    const filtered = mockDevices.filter((device) => device.category === category);
    expect(filtered.length).toBe(0);
  });
});

