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
      image: 'https://images.unsplash.com/photo-1676210133055-eab6ef033ce3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGx1bWJpbmclMjBQcm9mZXNzaW9uYWwlMjBQaXBlJTIwUmVwYWlyfGVufDB8fDB8fHww'
    },
    {
      title: 'Water Heater Installation',
      description: 'Complete water heater installation and repair. Tank and tankless systems available.',
      price: 450,
      rating: 4.9,
      reviews: 32,
      image: 'https://plus.unsplash.com/premium_photo-1664298589198-b15ff5382648?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGx1bWJpbmclMjBXYXRlciUyMEhlYXRlciUyMEluc3RhbGxhdGlvbnxlbnwwfHwwfHx8MA%3D%3D'
    },
    {
      title: 'Drain Cleaning Service',
      description: 'Professional drain cleaning and unclogging. Fast response for emergency blockages.',
      price: 120,
      rating: 4.7,
      reviews: 58,
      image: 'https://media.istockphoto.com/id/1422121660/photo/hand-in-orange-gloves-holds-many-hair-loss-on-filter-in-washbasin-while-cleaning.webp?a=1&b=1&s=612x612&w=0&k=20&c=YWH0O7-QUMOMy_cx2XPpZy-d9EgrHFOcYt0QzhqcZ6Q='
    },
    {
      title: 'Bathroom Fixture Installation',
      description: 'Install sinks, toilets, faucets, and shower heads. Quality workmanship guaranteed.',
      price: 200,
      rating: 4.6,
      reviews: 28,
      image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGx1bWJpbmclMjBCYXRocm9vbSUyMEZpeHR1cmUlMjBJbnN0YWxsYXRpb258ZW58MHx8MHx8fDA%3D'
    },
    {
      title: 'Leak Detection & Repair',
      description: 'Advanced leak detection using modern equipment. Repair hidden leaks without unnecessary damage.',
      price: 180,
      rating: 4.9,
      reviews: 41,
      image: 'https://media.istockphoto.com/id/2252282659/photo/close-up-of-water-leak-detector-sensor-alert-on-leaking-outdoor-tap-in-garden.webp?a=1&b=1&s=612x612&w=0&k=20&c=QBsCv5RSK91oVCYOMJsDzKxheX4evcJI6HcfDDkGN1Y='
    }
  ],
  electrical: [
    {
      title: 'Home Wiring Installation',
      description: 'Complete home wiring services. New construction and rewiring projects welcome.',
      price: 500,
      rating: 4.8,
      reviews: 36,
      image: 'https://images.unsplash.com/photo-1557516300-46e218a6961f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZWxlY3RyaWNhbCUyMEhvbWUlMjBXaXJpbmclMjBJbnN0YWxsYXRpb258ZW58MHx8MHx8fDA%3D'
    },
    {
      title: 'Electrical Panel Upgrade',
      description: 'Upgrade your electrical panel to handle modern power demands. Safety certified.',
      price: 800,
      rating: 4.9,
      reviews: 24,
      image: 'https://media.istockphoto.com/id/1469656864/photo/electrician-engineer-uses-a-multimeter-to-test-the-electrical-installation-and-power-line.webp?a=1&b=1&s=612x612&w=0&k=20&c=eDdOgrMY7RUNadSSchLwiaDGzHV8vUEt0soJ0Q0Fltk='
    },
    {
      title: 'Lighting Installation',
      description: 'Indoor and outdoor lighting installation. Ceiling fans, recessed lights, and more.',
      price: 150,
      rating: 4.7,
      reviews: 52,
      image: 'https://plus.unsplash.com/premium_photo-1661908782924-de673a5c6988?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZWxlY3RyaWNhbCUyMExpZ2h0aW5nJTIwSW5zdGFsbGF0aW9ufGVufDB8fDB8fHww'
    },
    {
      title: 'Outlet & Switch Repair',
      description: 'Fix or replace faulty outlets and switches. GFCI installation available.',
      price: 100,
      rating: 4.6,
      reviews: 67,
      image: 'https://plus.unsplash.com/premium_photo-1683127814960-3a97c4f0d882?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZWxlY3RyaWNhbCUyME91dGxldCUyMCUyNiUyMFN3aXRjaCUyMFJlcGFpcnxlbnwwfHwwfHx8MA%3D%3D'
    },
    {
      title: 'Emergency Electrical Service',
      description: '24/7 emergency electrical repairs. Power outages, sparks, and dangerous situations.',
      price: 250,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1596814150734-a0c84168a01d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVsZWN0cmljYWwlMjBFbWVyZ2VuY3klMjBwdWxsfGVufDB8fDB8fHww'
    }
  ],
  cleaning: [
    {
      title: 'Deep House Cleaning',
      description: 'Comprehensive deep cleaning for your entire home. Top to bottom service.',
      price: 300,
      rating: 4.8,
      reviews: 124,
      image: 'https://plus.unsplash.com/premium_photo-1678980766527-b33a383238ae?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2xlYW5pbmclMjBEZWVwJTIwSG91c2UlMjBDbGVhbmluZ3xlbnwwfHwwfHx8MA%3D%3D'
    },
    {
      title: 'Office Cleaning Service',
      description: 'Professional office and commercial space cleaning. Flexible scheduling available.',
      price: 400,
      rating: 4.7,
      reviews: 56,
      image: 'https://plus.unsplash.com/premium_photo-1683141112334-d7d404f6e716?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2xlYW5pbmclMjBPZmZpY2UlMjBDbGVhbmluZyUyMFNlcnZpY2V8ZW58MHx8MHx8fDA%3D'
    },
    {
      title: 'Carpet Cleaning',
      description: 'Professional carpet cleaning and stain removal. Steam cleaning available.',
      price: 200,
      rating: 4.6,
      reviews: 78,
      image: 'https://images.unsplash.com/photo-1742483359033-13315b247c74?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2xlYW5pbmclMjBDYXJwZXQlMjBDbGVhbmluZ3xlbnwwfHwwfHx8MA%3D%3D'
    },
    {
      title: 'Window Cleaning',
      description: 'Interior and exterior window cleaning. Residential and commercial properties.',
      price: 150,
      rating: 4.7,
      reviews: 92,
      image: 'https://images.unsplash.com/photo-1635445818409-64a0ff92eb39?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGNsZWFuaW5nJTIwV2luZG93JTIwQ2xlYW5pbmd8ZW58MHx8MHx8fDA%3D'
    },
    {
      title: 'Move-In/Move-Out Cleaning',
      description: 'Thorough cleaning for moving transitions. Ensure you get your deposit back.',
      price: 350,
      rating: 4.9,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1581578949510-fa7315c4c350?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TW92ZS1JbiUyRk1vdmUtT3V0JTIwQ2xlYW5pbmd8ZW58MHx8MHx8fDA%3D'
    }
  ],
  tutoring: [
    {
      title: 'Math Tutoring (All Levels)',
      description: 'Experienced math tutor for elementary through college level. Algebra, calculus, statistics.',
      price: 80,
      rating: 4.9,
      reviews: 156,
      image: 'https://plus.unsplash.com/premium_photo-1661964320064-ca1bfb994d11?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fE1hdGglMjBUdXRvcmluZyUyMChBbGwlMjBMZXZlbHMpfGVufDB8fDB8fHww'
    },
    {
      title: 'English & Writing Tutor',
      description: 'Improve your writing skills and English comprehension. Essay editing included.',
      price: 75,
      rating: 4.8,
      reviews: 98,
      image: 'https://media.istockphoto.com/id/1478130206/photo/woman-teaching-child-writing-and-learning-for-home-assessment-test-and-memory-development-at.webp?a=1&b=1&s=612x612&w=0&k=20&c=NiqnVF5RYp9KvhJnZiDifbfAGoWqTPNlY5GCcxbfzcs='
    },
    {
      title: 'Science Tutoring',
      description: 'Physics, chemistry, and biology tutoring. High school and college level.',
      price: 85,
      rating: 4.7,
      reviews: 72,
      image: 'https://images.unsplash.com/photo-1758685734062-165cc0094e61?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fFNjaWVuY2UlMjBUdXRvcmluZ3xlbnwwfHwwfHx8MA%3D%3D'
    },
    {
      title: 'Language Lessons',
      description: 'Spanish, French, or Mandarin lessons. Native speakers available.',
      price: 90,
      rating: 4.9,
      reviews: 134,
      image: 'https://images.unsplash.com/photo-1673515334717-da4d85aaf38b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TGFuZ3VhZ2UlMjBMZXNzb25zJyUyQyUyMGRlc2NyaXB0aW9uJTNBJTIwJ1NwYW5pc2glMkMlMjBGcmVuY2glMkMlMjBvciUyME1hbmRhcmluJTIwbGVzc29ucy4lMjBOYXRpdmUlMjBzcGVha2VycyUyMGF2YWlsYWJsZS58ZW58MHx8MHx8fDA%3D'
    },
    {
      title: 'Test Prep (SAT/ACT)',
      description: 'Comprehensive test preparation for SAT and ACT. Proven score improvement strategies.',
      price: 120,
      rating: 4.9,
      reviews: 87,
      image: 'https://media.istockphoto.com/id/949490402/photo/pencil-sharpener-and-eraser-on-answer-sheets-or-standardized-test-form-with-answers-bubbled.webp?a=1&b=1&s=612x612&w=0&k=20&c=mK9ggaobs75O3pDxzNnwq7ySiPZ843-H2k1oHGV4a34='
    }
  ],
  painting: [
    {
      title: 'Interior House Painting',
      description: 'Professional interior painting services. Quality paints and meticulous preparation.',
      price: 600,
      rating: 4.8,
      reviews: 45,
      image: 'https://images.unsplash.com/photo-1717281234297-3def5ae3eee1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHBhaW50aW5nJTIwSW50ZXJpb3IlMjBIb3VzZSUyMFBhaW50aW5nJyUyQyUyMGRlc2NyaXB0aW9uJTNBJTIwJ1Byb2Zlc3Npb25hbCUyMGludGVyaW9yJTIwcGFpbnRpbmclMjBzZXJ2aWNlcy4lMjBRdWFsaXR5JTIwcGFpbnRzJTIwYW5kJTIwbWV0aWN1bG91c3xlbnwwfHwwfHx8MA%3D%3D'
    },
    {
      title: 'Exterior Painting',
      description: 'Protect and beautify your home exterior. Weather-resistant paints used.',
      price: 1200,
      rating: 4.7,
      reviews: 32,
      image: 'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFpbnRpbmclMjBFeHRlcmlvciUyMFBhaW50aW5nJyUyQyUyMGRlc2NyaXB0aW9uJTNBJTIwJ1Byb3RlY3QlMjBhbmQlMjBiZWF1dGlmeSUyMHlvdXIlMjBob21lJTIwZXh0ZXJpb3IuJTIwV2VhdGhlci1yZXNpc3RhbnQlMjBwYWludHMlMjB1c2VkLnxlbnwwfHwwfHx8MA%3D%3D'
    },
    {
      title: 'Cabinet Painting',
      description: 'Transform your kitchen with cabinet painting or refinishing. Cost-effective update.',
      price: 800,
      rating: 4.6,
      reviews: 28,
      image: 'https://plus.unsplash.com/premium_photo-1664303816628-2c3f28be369d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGFpbnRpbmclMjBDYWJpbmV0JTIwUGFpbnRpbmcnJTJDJTIwZGVzY3JpcHRpb24lM0ElMjAnVHJhbnNmb3JtJTIweW91ciUyMGtpdGNoZW4lMjB3aXRoJTIwY2FiaW5ldCUyMHBhaW50aW5nJTIwb3IlMjByZWZpbmlzaGluZy4lMjBDb3N0LWVmZmVjdGl2ZSUyMHVwZGF0ZXxlbnwwfHwwfHx8MA%3D%3D'
    },
    {
      title: 'Wallpaper Installation',
      description: 'Professional wallpaper hanging and removal. All types of wallpaper.',
      price: 400,
      rating: 4.5,
      reviews: 19,
      image: 'https://plus.unsplash.com/premium_photo-1661964258975-033bfdf1e573?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBhaW50aW5nJTIwV2FsbHBhcGVyJTIwSW5zdGFsbGF0aW9uJyUyQyUyMGRlc2NyaXB0aW9uJTNBJTIwJ1Byb2Zlc3Npb25hbCUyMHdhbGxwYXBlciUyMGhhbmdpbmclMjBhbmQlMjByZW1vdmFsLiUyMEFsbCUyMHR5cGVzJTIwb2YlMjB3YWxscGFwZXJ8ZW58MHx8MHx8fDA%3D'
    },
    {
      title: 'Deck & Fence Staining',
      description: 'Protect and enhance your deck or fence with professional staining.',
      price: 500,
      rating: 4.7,
      reviews: 36,
      image: 'https://images.unsplash.com/photo-1748908271581-b701ab3ad25e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RGVjayUyMCUyNiUyMEZlbmNlJTIwU3RhaW5pbmcnJTJDJTIwZGVzY3JpcHRpb24lM0ElMjAnUHJvdGVjdCUyMGFuZCUyMGVuaGFuY2UlMjB5b3VyJTIwZGVjayUyMG9yJTIwZmVuY2UlMjB3aXRoJTIwcHJvZmVzc2lvbmFsJTIwc3RhaW5pbmd8ZW58MHx8MHx8fDA%3D'
    }
  ],
  carpentry: [
    {
      title: 'Custom Furniture Building',
      description: 'Handcrafted custom furniture made to your specifications. Quality hardwood.',
      price: 800,
      rating: 4.9,
      reviews: 28,
      image: 'https://images.unsplash.com/photo-1631396326646-c06a935ff3a6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2FycGVudHJ5JTIwQ3VzdG9tJTIwRnVybml0dXJlJTIwQnVpbGRpbmclMjBIYW5kY3JhZnRlZCUyMGN1c3RvbSUyMGZ1cm5pdHVyZSUyMG1hZGUlMjB0byUyMHlvdXIlMjBzcGVjaWZpY2F0aW9ucy4lMjBRdWFsaXR5JTIwaGFyZHdvb2R8ZW58MHx8MHx8fDA%3D'
    },
    {
      title: 'Door Installation & Repair',
      description: 'Install new doors or repair existing ones. Interior and exterior doors.',
      price: 250,
      rating: 4.7,
      reviews: 54,
      image: 'https://images.unsplash.com/photo-1536160885591-301854e2ed04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNhcnBlbnRyeSUyMERvb3IlMjBJbnN0YWxsYXRpb24lMjAlMjYlMjBSZXBhaXJ8ZW58MHx8MHx8fDA%3D'
    },
    {
      title: 'Cabinet Installation',
      description: 'Professional kitchen and bathroom cabinet installation. Custom and stock cabinets.',
      price: 600,
      rating: 4.8,
      reviews: 42,
      image: 'https://plus.unsplash.com/premium_photo-1683133825889-7f8dd0b5817f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2FycGVudHJ5JTIwQ2FiaW5ldCUyMEluc3RhbGxhdGlvbnxlbnwwfHwwfHx8MA%3D%3D'
    },
    {
      title: 'Deck Building',
      description: 'Custom deck construction and repair. Wood and composite materials available.',
      price: 2000,
      rating: 4.9,
      reviews: 31,
      image: 'https://images.unsplash.com/photo-1656646549607-8fda5837a4ca?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FycGVudHJ5JTIwRGVjayUyMEJ1aWxkaW5nfGVufDB8fDB8fHww'
    },
    {
      title: 'Trim & Molding Installation',
      description: 'Crown molding, baseboards, and decorative trim installation. Fine finish work.',
      price: 400,
      rating: 4.6,
      reviews: 38,
      image: 'https://plus.unsplash.com/premium_photo-1683129664545-e977ddede93f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2FycGVudHJ5JTIwVHJpbSUyMCUyNiUyME1vbGRpbmclMjBJbnN0YWxsYXRpb258ZW58MHx8MHx8fDA%3D'
    }
  ],
  gardening: [
    {
      title: 'Lawn Maintenance',
      description: 'Regular lawn mowing, edging, and cleanup. Weekly or bi-weekly service.',
      price: 100,
      rating: 4.7,
      reviews: 89,
      image: 'https://media.istockphoto.com/id/1264145990/photo/gardener-trimming-grass-lawn-using-electric-cordless-mower.webp?a=1&b=1&s=612x612&w=0&k=20&c=MpwgQFu1B3r-HX-Ofh1s8GVX2OtR5oIVkJG-I0PEybM='
    },
    {
      title: 'Landscape Design',
      description: 'Professional landscape design and installation. Transform your outdoor space.',
      price: 800,
      rating: 4.8,
      reviews: 34,
      image: 'https://plus.unsplash.com/premium_photo-1714251842994-f32dbd50df66?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z2FyZGVuaW5nJTIwTGFuZHNjYXBlJTIwRGVzaWdufGVufDB8fDB8fHww'
    },
    {
      title: 'Tree Trimming & Removal',
      description: 'Safe tree trimming and removal services. Certified arborists on staff.',
      price: 400,
      rating: 4.6,
      reviews: 56,
      image: 'https://media.istockphoto.com/id/1399726153/photo/man-trimming-decorative-trees-for-sale-in-garden-shop.webp?a=1&b=1&s=612x612&w=0&k=20&c=9ZtK4rLDYct0xToZmtAOfXXtbMHx4k959PGljj2XGkA='
    },
    {
      title: 'Garden Bed Installation',
      description: 'Design and install beautiful garden beds. Raised beds and in-ground options.',
      price: 350,
      rating: 4.7,
      reviews: 42,
      image: 'https://plus.unsplash.com/premium_photo-1678677946745-47819646a87e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8R2FyZGVuJTIwQmVkJTIwSW5zdGFsbGF0aW9ufGVufDB8fDB8fHww'
    },
    {
      title: 'Irrigation System Installation',
      description: 'Automatic sprinkler and drip irrigation systems. Water-efficient designs.',
      price: 1200,
      rating: 4.8,
      reviews: 27,
      image: 'https://images.unsplash.com/photo-1588813888677-3e8cc72f8b0a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2FyZGVuaW5nJTNBJTIwSXJyaWdhdGlvbiUyMFN5c3RlbSUyMEluc3RhbGxhdGlvbnxlbnwwfHwwfHx8MA%3D%3D'
    }
  ],
  moving: [
    {
      title: 'Local Moving Service',
      description: 'Professional local moving within the city. Full packing and loading service.',
      price: 600,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1614359835514-92f8ba196357?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW92aW5nJTNBJTIwTG9jYWwlMjBNb3ZpbmclMjBTZXJ2aWNlfGVufDB8fDB8fHww'
    },
    {
      title: 'Long Distance Moving',
      description: 'Reliable long-distance moving services. Cross-country moves welcome.',
      price: 2500,
      rating: 4.6,
      reviews: 78,
      image: 'https://plus.unsplash.com/premium_photo-1661409078904-42334551db0c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bW92aW5nJTNBJTIwTG9uZyUyMERpc3RhbmNlJTIwTW92aW5nfGVufDB8fDB8fHww'
    },
    {
      title: 'Packing Service',
      description: 'Professional packing service for your move. All materials included.',
      price: 400,
      rating: 4.8,
      reviews: 92,
      image: 'https://images.unsplash.com/photo-1600725935160-f67ee4f6084a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW92aW5nJTNBJTIwUGFja2luZyUyMFNlcnZpY2V8ZW58MHx8MHx8fDA%3D'
    },
    {
      title: 'Furniture Assembly',
      description: 'Assembly of IKEA and other furniture. Quick and efficient service.',
      price: 150,
      rating: 4.7,
      reviews: 134,
      image: 'https://images.unsplash.com/photo-1623043453741-11aef9cb59b5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW92aW5nJTNBJTIwRnVybml0dXJlJTIwQXNzZW1ibHklMjBkZXNjcmlwdGlvbiUzQSUyMEFzc2VtYmx5JTIwb2YlMjBJS0VBJTIwYW5kJTIwb3RoZXIlMjBmdXJuaXR1cmUuJTIwUXVpY2slMjBhbmQlMjBlZmZpY2llbnQlMjBzZXJ2aWNlLnxlbnwwfHwwfHx8MA%3D%3D'
    },
    {
      title: 'Storage Solutions',
      description: 'Short and long-term storage solutions. Climate-controlled options available.',
      price: 200,
      rating: 4.5,
      reviews: 67,
      image: 'https://plus.unsplash.com/premium_photo-1661757829099-f8b61e232cfb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bW92aW5nJTIwJTNBJTIwU3RvcmFnZSUyMFNvbHV0aW9uc3xlbnwwfHwwfHx8MA%3D%3D'
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
    await User.deleteMany({});
    console.log('🗑️  Cleared existing services and users');

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
