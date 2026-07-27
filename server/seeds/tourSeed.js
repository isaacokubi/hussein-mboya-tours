import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tour from '../models/Tour.js';
import Destination from '../models/Destination.js';

dotenv.config();

const tours = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const destinations = await Destination.find();
    if (!destinations.length) {
      throw new Error('No destinations found. Seed destinations first.');
    }

    const getDestination = (name) => {
      const destination = destinations.find(
        (d) => d.name.toLowerCase() === name.toLowerCase()
      );
      if (!destination) {
        throw new Error(`Destination not found: ${name}`);
      }
      return destination._id;
    };

    await Tour.deleteMany();

    await Tour.insertMany([
      /*
      |--------------------------------------------------------------------------
      | MAASAI MARA TOUR
      |--------------------------------------------------------------------------
      */
      {
        title: 'Maasai Mara Safari Adventure',
        slug: 'maasai-mara-safari-adventure',
        description: 'Experience the Great Migration, wildlife and unforgettable safari moments in Kenya s most famous reserve.',
        category: 'Safari',
        destination: getDestination('Maasai Mara'),
        country: 'Kenya',
        duration: 3,
        difficulty: 'easy',
        price: 500,
        discount: 0,
        images: ['/destinations/maasai-mara.jpg'],
        itinerary: [
          { day: 1, title: 'Arrival and Game Drive', description: 'Arrive at Maasai Mara and enjoy an evening wildlife drive.' },
          { day: 2, title: 'Great Migration Experience', description: 'Full day safari exploring lions, elephants and other wildlife.' },
          { day: 3, title: 'Departure', description: 'Morning game drive before returning home.' }
        ],
        inclusions: ['Transport', 'Accommodation', 'Park fees', 'Professional guide'],
        exclusions: ['Personal expenses', 'Travel insurance'],
        availabilitySettings: { totalSlots: 20, bookedSlots: 0 },
        featured: true,
        status: 'active'
      },
      /*
      |--------------------------------------------------------------------------
      | DIANI TOUR
      |--------------------------------------------------------------------------
      */
      {
        title: 'Diani Beach Escape',
        slug: 'diani-beach-escape',
        description: 'Relax on Kenya s most beautiful white sandy beaches with luxury accommodation and coastal adventures.',
        category: 'Beach',
        destination: getDestination('Diani Beach'),
        country: 'Kenya',
        duration: 5,
        difficulty: 'easy',
        price: 700,
        discount: 0,
        images: ['/destinations/diani.jpg'],
        itinerary: [
          { day: 1, title: 'Arrival', description: 'Arrive and check into your luxury beach resort.' },
          { day: 2, title: 'Beach Activities', description: 'Enjoy water sports or relax on the white sands.' },
          { day: 3, title: 'Coastal Exploration', description: 'Discover local marine life and coastal culture.' },
          { day: 4, title: 'Leisure Day', description: 'Free day for spa, relaxation, or optional excursions.' },
          { day: 5, title: 'Departure', description: 'Check out and transfer to the airport.' }
        ],
        inclusions: ['Hotel accommodation', 'Breakfast', 'Beach activities'],
        exclusions: ['Flights', 'Personal expenses'],
        availabilitySettings: { totalSlots: 20, bookedSlots: 0 },
        featured: true,
        status: 'active'
      },
      /*
      |--------------------------------------------------------------------------
      | AMBOSELI TOUR
      |--------------------------------------------------------------------------
      */
      {
        title: 'Amboseli Wildlife Safari',
        slug: 'amboseli-wildlife-safari',
        description: 'Discover elephants, breathtaking landscapes and amazing views of Mount Kilimanjaro.',
        category: 'Safari',
        destination: getDestination('Amboseli National Park'),
        country: 'Kenya',
        duration: 4,
        difficulty: 'easy',
        price: 850,
        discount: 0,
        images: ['/destinations/amboseli.jpg'],
        itinerary: [
          { day: 1, title: 'Arrival at Amboseli', description: 'Check into the lodge and enjoy an evening game drive.' },
          { day: 2, title: 'Full Day Safari', description: 'Explore Amboseli National Park and view elephants.' },
          { day: 3, title: 'Nature Experience', description: 'Enjoy photography and wildlife viewing.' },
          { day: 4, title: 'Departure', description: 'Morning safari before leaving the park.' }
        ],
        inclusions: ['Transport', 'Accommodation', 'Park fees', 'Guide'],
        exclusions: ['Personal expenses', 'Tips'],
        availabilitySettings: { totalSlots: 20, bookedSlots: 0 },
        featured: true,
        status: 'active'
      }
    ]);

    console.log('Tours seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Tour seed failed: ', error.message);
    process.exit(1);
  }
};

tours();
