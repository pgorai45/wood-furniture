import React from 'react';
import RoomLayout from '../components/RoomLayout';

const defaultDecorProducts = [
  {
    id: 1,
    name: 'Modern Wall Art',
    image: '/img/decor/wallart1.webp',
    price: 2999,
    oldPrice: 4499,
    discount: '33% OFF',
    rating: '5',
    reviews: 186,
    colors: '3+ Designs',
    delivery: 'Ships in 2 Days',
    badge: 'Best Seller',
    category: 'wall-art',
  },
  {
    id: 2,
    name: 'Luxury Wall Mirror',
    image: '/img/decor/mirror1.webp',
    price: 5999,
    oldPrice: 7999,
    discount: '25% OFF',
    rating: '4',
    reviews: 132,
    colors: '2+ Designs',
    delivery: 'Ships in 3 Days',
    badge: 'New Arrival',
    category: 'mirrors',
  },
  {
    id: 3,
    name: 'Modern Table Lamp',
    image: '/img/decor/lighting1.webp',
    price: 3499,
    oldPrice: 4999,
    discount: '30% OFF',
    rating: '5',
    reviews: 96,
    colors: '4+ Colors',
    delivery: 'Ships in 2 Days',
    badge: 'Trending',
    category: 'lighting',
  },
  {
    id: 4,
    name: 'Premium Area Rug',
    image: '/img/decor/rug1.webp',
    price: 6999,
    oldPrice: 9499,
    discount: '26% OFF',
    rating: '4',
    reviews: 84,
    colors: '5+ Colors',
    delivery: 'Ships in 4 Days',
    badge: 'Limited Offer',
    category: 'rugs',
  },
];

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Wall Art', value: 'wall-art' },
  { label: 'Mirrors', value: 'mirrors' },
  { label: 'Lighting', value: 'lighting' },
  { label: 'Rugs', value: 'rugs' },
];

const Decor = () => {
  return (
    <RoomLayout
      categoryName="Decor"
      bannerTitle="Decor & Furnishing"
      bannerDesc="Add the finishing touch to your living spaces with artistic wall accents, elegant lighting, mirrors, and cozy rugs."
      gridId="decorGrid"
      filterOptions={filterOptions}
      categoryKeys={['wall-art', 'mirrors', 'lighting', 'rugs', 'decor']}
      defaultProducts={defaultDecorProducts}
    />
  );
};

export default Decor;
