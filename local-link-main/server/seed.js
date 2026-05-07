import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Service from './src/modules/services/service.model.js';
import User from './src/modules/users/user.model.js';

dotenv.config();

// Sample data
const categories = [
  { name: 'plumbing', icon: 'Wrench', color: '#3b82f6' },
  { name: 'electrical', icon: 'Zap', color: '#f59e0b' },
  { name: 'cleaning', icon: 'Sparkles', color: '#10b981' },
  { name: 'tutoring', icon: 'Book', color: '#8b5cf6' },
  { name: 'painting', icon: 'Paintbrush', color: '#ef4444' },
  { name: 'carpentry', icon: 'Hammer', color: '#06b6d4' },
  { name: 'gardening', icon: 'Flower', color: '#22c55e' },
  { name: 'moving', icon: 'Truck', color: '#f97316' }
];

const sampleServices = {
  plumbing: [
    {
      title: 'Professional Pipe Repair',
      description: 'Expert pipe repair and replacement services. Fix leaks, bursts, and corrosion issues quickly and efficiently.',
      price: 150,
      rating: 4.8,
      reviews: 45,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Water Heater Installation',
      description: 'Complete water heater installation and repair. Tank and tankless systems available.',
      price: 450,
      rating: 4.9,
      reviews: 32,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Drain Cleaning Service',
      description: 'Professional drain cleaning and unclogging. Fast response for emergency blockages.',
      price: 120,
      rating: 4.7,
      reviews: 58,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Bathroom Fixture Installation',
      description: 'Install sinks, toilets, faucets, and shower heads. Quality workmanship guaranteed.',
      price: 200,
      rating: 4.6,
      reviews: 28,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Leak Detection & Repair',
      description: 'Advanced leak detection using modern equipment. Repair hidden leaks without unnecessary damage.',
      price: 180,
      rating: 4.9,
      reviews: 41,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    }
  ],
  electrical: [
    {
      title: 'Home Wiring Installation',
      description: 'Complete home wiring services. New construction and rewiring projects welcome.',
      price: 500,
      rating: 4.8,
      reviews: 36,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Electrical Panel Upgrade',
      description: 'Upgrade your electrical panel to handle modern power demands. Safety certified.',
      price: 800,
      rating: 4.9,
      reviews: 24,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Lighting Installation',
      description: 'Indoor and outdoor lighting installation. Ceiling fans, recessed lights, and more.',
      price: 150,
      rating: 4.7,
      reviews: 52,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Outlet & Switch Repair',
      description: 'Fix or replace faulty outlets and switches. GFCI installation available.',
      price: 100,
      rating: 4.6,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Emergency Electrical Service',
      description: '24/7 emergency electrical repairs. Power outages, sparks, and dangerous situations.',
      price: 250,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    }
  ],
  cleaning: [
    {
      title: 'Deep House Cleaning',
      description: 'Comprehensive deep cleaning for your entire home. Top to bottom service.',
      price: 300,
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Office Cleaning Service',
      description: 'Professional office and commercial space cleaning. Flexible scheduling available.',
      price: 400,
      rating: 4.7,
      reviews: 56,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Carpet Cleaning',
      description: 'Professional carpet cleaning and stain removal. Steam cleaning available.',
      price: 200,
      rating: 4.6,
      reviews: 78,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Window Cleaning',
      description: 'Interior and exterior window cleaning. Residential and commercial properties.',
      price: 150,
      rating: 4.7,
      reviews: 92,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Move-In/Move-Out Cleaning',
      description: 'Thorough cleaning for moving transitions. Ensure you get your deposit back.',
      price: 350,
      rating: 4.9,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    }
  ],
  tutoring: [
    {
      title: 'Math Tutoring (All Levels)',
      description: 'Experienced math tutor for elementary through college level. Algebra, calculus, statistics.',
      price: 80,
      rating: 4.9,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'English & Writing Tutor',
      description: 'Improve your writing skills and English comprehension. Essay editing included.',
      price: 75,
      rating: 4.8,
      reviews: 98,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Science Tutoring',
      description: 'Physics, chemistry, and biology tutoring. High school and college level.',
      price: 85,
      rating: 4.7,
      reviews: 72,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Language Lessons',
      description: 'Spanish, French, or Mandarin lessons. Native speakers available.',
      price: 90,
      rating: 4.9,
      reviews: 134,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Test Prep (SAT/ACT)',
      description: 'Comprehensive test preparation for SAT and ACT. Proven score improvement strategies.',
      price: 120,
      rating: 4.9,
      reviews: 87,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    }
  ],
  painting: [
    {
      title: 'Interior House Painting',
      description: 'Professional interior painting services. Quality paints and meticulous preparation.',
      price: 600,
      rating: 4.8,
      reviews: 45,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Exterior Painting',
      description: 'Protect and beautify your home exterior. Weather-resistant paints used.',
      price: 1200,
      rating: 4.7,
      reviews: 32,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Cabinet Painting',
      description: 'Transform your kitchen with cabinet painting or refinishing. Cost-effective update.',
      price: 800,
      rating: 4.6,
      reviews: 28,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Wallpaper Installation',
      description: 'Professional wallpaper hanging and removal. All types of wallpaper.',
      price: 400,
      rating: 4.5,
      reviews: 19,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Deck & Fence Staining',
      description: 'Protect and enhance your deck or fence with professional staining.',
      price: 500,
      rating: 4.7,
      reviews: 36,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    }
  ],
  carpentry: [
    {
      title: 'Custom Furniture Building',
      description: 'Handcrafted custom furniture made to your specifications. Quality hardwood.',
      price: 800,
      rating: 4.9,
      reviews: 28,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Door Installation & Repair',
      description: 'Install new doors or repair existing ones. Interior and exterior doors.',
      price: 250,
      rating: 4.7,
      reviews: 54,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Cabinet Installation',
      description: 'Professional kitchen and bathroom cabinet installation. Custom and stock cabinets.',
      price: 600,
      rating: 4.8,
      reviews: 42,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Deck Building',
      description: 'Custom deck construction and repair. Wood and composite materials available.',
      price: 2000,
      rating: 4.9,
      reviews: 31,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Trim & Molding Installation',
      description: 'Crown molding, baseboards, and decorative trim installation. Fine finish work.',
      price: 400,
      rating: 4.6,
      reviews: 38,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    }
  ],
  gardening: [
    {
      title: 'Lawn Maintenance',
      description: 'Regular lawn mowing, edging, and cleanup. Weekly or bi-weekly service.',
      price: 100,
      rating: 4.7,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Landscape Design',
      description: 'Professional landscape design and installation. Transform your outdoor space.',
      price: 800,
      rating: 4.8,
      reviews: 34,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Tree Trimming & Removal',
      description: 'Safe tree trimming and removal services. Certified arborists on staff.',
      price: 400,
      rating: 4.6,
      reviews: 56,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Garden Bed Installation',
      description: 'Design and install beautiful garden beds. Raised beds and in-ground options.',
      price: 350,
      rating: 4.7,
      reviews: 42,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Irrigation System Installation',
      description: 'Automatic sprinkler and drip irrigation systems. Water-efficient designs.',
      price: 1200,
      rating: 4.8,
      reviews: 27,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    }
  ],
  moving: [
    {
      title: 'Local Moving Service',
      description: 'Professional local moving within the city. Full packing and loading service.',
      price: 600,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Long Distance Moving',
      description: 'Reliable long-distance moving services. Cross-country moves welcome.',
      price: 2500,
      rating: 4.6,
      reviews: 78,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Packing Service',
      description: 'Professional packing service for your move. All materials included.',
      price: 400,
      rating: 4.8,
      reviews: 92,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Furniture Assembly',
      description: 'Assembly of IKEA and other furniture. Quick and efficient service.',
      price: 150,
      rating: 4.7,
      reviews: 134,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    },
    {
      title: 'Storage Solutions',
      description: 'Short and long-term storage solutions. Climate-controlled options available.',
      price: 200,
      rating: 4.5,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
    }
  ]
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/local-link');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Service.deleteMany({});
    await User.deleteMany({ role: 'provider' });
    console.log('🗑️  Cleared existing services and providers');

    // Create sample providers
    const providers = [];
    
    // Create demo customer account
    await User.create({
      name: 'Demo Customer',
      email: 'demo@customer.com',
      password: await bcrypt.hash('password123', 10),
      role: 'customer',
      isVerified: true,
      phone: '+1234567890'
    });
    console.log('✅ Created demo customer account');
    
    for (let i = 0; i < 20; i++) {
      const provider = await User.create({
        name: `Provider ${i + 1}`,
        email: `provider${i + 1}@example.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'provider',
        isVerified: true,
        phone: `+123456789${i}`,
        location: {
          type: 'Point',
          coordinates: [-73.935242 + (Math.random() * 0.1), 40.730610 + (Math.random() * 0.1)]
        },
        providerInfo: {
          yearsOfExperience: Math.floor(Math.random() * 15) + 1,
          verified: Math.random() > 0.3
        }
      });
      providers.push(provider);
    }
    console.log('✅ Created 20 sample providers');

    // Create services for each category
    let serviceCount = 0;
    for (const [category, services] of Object.entries(sampleServices)) {
      for (const serviceData of services) {
        const provider = providers[Math.floor(Math.random() * providers.length)];
        
        await Service.create({
          provider: provider._id,
          title: serviceData.title,
          description: serviceData.description,
          category,
          price: serviceData.price,
          averageRating: serviceData.rating,
          totalReviews: serviceData.reviews,
          images: [serviceData.image],
          location: {
            type: 'Point',
            coordinates: provider.location.coordinates
          },
          isActive: true,
          tags: [category, 'professional', 'quality']
        });
        serviceCount++;
      }
    }

    console.log(`✅ Created ${serviceCount} sample services across ${categories.length} categories`);
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Services per category: 5`);
    console.log(`   - Total services: ${serviceCount}`);
    console.log(`   - Sample providers: 20`);
    console.log('\n✨ Database seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
