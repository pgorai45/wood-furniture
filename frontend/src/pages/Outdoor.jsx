import React from 'react';
import RoomLayout from '../components/RoomLayout';

const defaultOutdoorProducts = [
  {
    id: 1,
    name: 'Premium Garden Chair',
    image: '/img/outdoor/gardenchair1.webp',
    price: 6999,
    oldPrice: 9999,
    discount: '30% OFF',
    rating: '5',
    reviews: 145,
    colors: '3+ Colors',
    delivery: 'Ships in 2 Days',
    badge: 'Best Seller',
    category: 'garden-chair',
  },
  {
    id: 2,
    name: 'Luxury Outdoor Sofa',
    image: '/img/outdoor/outdoorsofa1.webp',
    price: 32999,
    oldPrice: 45999,
    discount: '28% OFF',
    rating: '4',
    reviews: 98,
    colors: '4+ Colors',
    delivery: 'Ships in 5 Days',
    badge: 'New Arrival',
    category: 'outdoor-sofa',
  },
  {
    id: 3,
    name: 'Wooden Garden Swing',
    image: '/img/outdoor/swing1.webp',
    price: 18999,
    oldPrice: 24999,
    discount: '24% OFF',
    rating: '5',
    reviews: 116,
    colors: '2+ Colors',
    delivery: 'Ships in 4 Days',
    badge: 'Trending',
    category: 'swing',
  },
  {
    id: 4,
    name: 'Outdoor Coffee Set',
    image: '/img/outdoor/coffeeset1.webp',
    price: 15999,
    oldPrice: 21999,
    discount: '27% OFF',
    rating: '4',
    reviews: 87,
    colors: '3+ Colors',
    delivery: 'Ships in 3 Days',
    badge: 'Hot Deal',
    category: 'coffee-set',
  },
  {
    id: 5,
    name: 'Garden Umbrella',
    image: '/img/outdoor/umbrella1.webp',
    price: 7999,
    oldPrice: 10999,
    discount: '27% OFF',
    rating: '4',
    reviews: 72,
    colors: '5+ Colors',
    delivery: 'Ships in 2 Days',
    badge: 'Limited Offer',
    category: 'umbrella',
  },
];

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Garden Chairs', value: 'garden-chair' },
  { label: 'Outdoor Sofas', value: 'outdoor-sofa' },
  { label: 'Swings', value: 'swing' },
  { label: 'Coffee Sets', value: 'coffee-set' },
  { label: 'Garden Umbrellas', value: 'umbrella' },
];

const Outdoor = () => {
  return (
    <RoomLayout
      categoryName="Outdoor"
      bannerTitle="Outdoor Collection"
      bannerDesc="Elevate your patio, balcony, or garden with weather-resistant luxury furniture and outdoor relaxation essentials."
      gridId="outdoorGrid"
      filterOptions={filterOptions}
      categoryKeys={['garden-chair', 'outdoor-sofa', 'swing', 'coffee-set', 'umbrella', 'outdoor']}
      defaultProducts={defaultOutdoorProducts}
    />
  );
};

export default Outdoor;
