import React from 'react';
import RoomLayout from '../components/RoomLayout';

const defaultLivingProducts = [
  {
    id: 1,
    name: 'Luxury Fabric Sofa',
    image: '/img/living/sofa1.webp',
    price: 42999,
    oldPrice: 58999,
    discount: '27% OFF',
    rating: '4',
    reviews: 254,
    colors: '5+ Colors',
    delivery: 'Ships in 3 Days',
    badge: 'Best Seller',
    category: 'sofa',
  },
  {
    id: 2,
    name: 'Modern TV Unit',
    image: '/img/living/tvunit1.webp',
    price: 18999,
    oldPrice: 25999,
    discount: '27% OFF',
    rating: '5',
    reviews: 184,
    colors: '3+ Colors',
    delivery: 'Ships in 5 Days',
    badge: 'New Arrival',
    category: 'tv-unit',
  },
  {
    id: 3,
    name: 'Wooden Coffee Table',
    image: '/img/living/coffeetable1.webp',
    price: 8999,
    oldPrice: 12999,
    discount: '31% OFF',
    rating: '4',
    reviews: 148,
    colors: '2+ Colors',
    delivery: 'Ships in 2 Days',
    badge: 'Hot Deal',
    category: 'coffee-table',
  },
  {
    id: 4,
    name: 'Premium Recliner',
    image: '/img/living/recliner1.webp',
    price: 24999,
    oldPrice: 34999,
    discount: '29% OFF',
    rating: '5',
    reviews: 205,
    colors: '4+ Colors',
    delivery: 'Ships in 4 Days',
    badge: 'Limited Offer',
    category: 'recliner',
  },
  {
    id: 5,
    name: 'Modern Bookshelf',
    image: '/img/living/bookshelf1.webp',
    price: 10999,
    oldPrice: 15999,
    discount: '31% OFF',
    rating: '4',
    reviews: 132,
    colors: '3+ Colors',
    delivery: 'Ships in 3 Days',
    badge: 'Trending',
    category: 'bookshelf',
  },
];

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Sofas', value: 'sofa' },
  { label: 'TV Units', value: 'tv-unit' },
  { label: 'Coffee Tables', value: 'coffee-table' },
  { label: 'Recliners', value: 'recliner' },
  { label: 'Bookshelves', value: 'bookshelf' },
];

const Living = () => {
  return (
    <RoomLayout
      categoryName="Living"
      bannerTitle="Living Collection"
      bannerDesc="Discover premium Sofa, Dining Sets, Study Tables, and other living room furniture for your dream living space."
      gridId="livingGrid"
      filterOptions={filterOptions}
      categoryKeys={['sofa', 'tv-unit', 'coffee-table', 'recliner', 'bookshelf']}
      defaultProducts={defaultLivingProducts}
    />
  );
};

export default Living;
