import React from 'react';
import RoomLayout from '../components/RoomLayout';

const defaultDiningProducts = [
  {
    id: 1,
    name: '6 Seater Dining Table',
    image: '/img/dining/diningtable1.webp',
    price: 29999,
    oldPrice: 39999,
    discount: '25% OFF',
    rating: '5',
    reviews: 245,
    colors: '3+ Colors',
    delivery: 'Ships in 3 Days',
    badge: 'Best Seller',
    category: 'dining-table',
  },
  {
    id: 2,
    name: 'Wooden Dining Chair',
    image: '/img/dining/chair1.webp',
    price: 4999,
    oldPrice: 6999,
    discount: '29% OFF',
    rating: '4',
    reviews: 132,
    colors: '2+ Colors',
    delivery: 'Ships in 2 Days',
    badge: 'New Arrival',
    category: 'dining-chair',
  },
  {
    id: 3,
    name: 'Dining Bench',
    image: '/img/dining/bench1.webp',
    price: 8999,
    oldPrice: 11999,
    discount: '25% OFF',
    rating: '4',
    reviews: 98,
    colors: '2+ Colors',
    delivery: 'Ships in 4 Days',
    badge: 'Trending',
    category: 'bench',
  },
  {
    id: 4,
    name: 'Modern Bar Unit',
    image: '/img/dining/barunit1.webp',
    price: 18999,
    oldPrice: 25999,
    discount: '27% OFF',
    rating: '5',
    reviews: 154,
    colors: '3+ Colors',
    delivery: 'Ships in 5 Days',
    badge: 'Hot Deal',
    category: 'bar-unit',
  },
  {
    id: 5,
    name: 'Premium Crockery Unit',
    image: '/img/dining/crockery1.webp',
    price: 21999,
    oldPrice: 30999,
    discount: '29% OFF',
    rating: '4',
    reviews: 121,
    colors: '4+ Colors',
    delivery: 'Ships in 4 Days',
    badge: 'Limited Offer',
    category: 'crockery-unit',
  },
];

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Dining Tables', value: 'dining-table' },
  { label: 'Dining Chairs', value: 'dining-chair' },
  { label: 'Dining Benches', value: 'bench' },
  { label: 'Bar Units', value: 'bar-unit' },
  { label: 'Crockery Units', value: 'crockery-unit' },
];

const Dining = () => {
  return (
    <RoomLayout
      categoryName="Dining"
      bannerTitle="Dining Collection"
      bannerDesc="Discover premium Dining Tables, Chairs, Benches, Bar Cabinets, and Crockery Units for memorable meals."
      gridId="diningGrid"
      filterOptions={filterOptions}
      categoryKeys={['dining-table', 'dining-chair', 'bench', 'bar-unit', 'crockery-unit', 'dining']}
      defaultProducts={defaultDiningProducts}
    />
  );
};

export default Dining;
