import React from 'react';
import RoomLayout from '../components/RoomLayout';

const defaultBedroomProducts = [
  {
    id: 1,
    name: 'Nova Queen Bed',
    image: '/img/bedroom/bed1.webp',
    price: 39999,
    oldPrice: 72999,
    discount: '45% OFF',
    rating: '4',
    reviews: 324,
    colors: '4+ Colors',
    delivery: 'Ships in 3 Days',
    badge: 'Best Seller',
    category: 'bed',
  },
  {
    id: 2,
    name: 'Premium Wardrobe',
    image: '/img/bedroom/wardrobe1.webp',
    price: 24999,
    oldPrice: 38999,
    discount: '36% OFF',
    rating: '5',
    reviews: 192,
    colors: '3+ Colors',
    delivery: 'Ships in 5 Days',
    badge: 'New Arrival',
    category: 'wardrobe',
  },
  {
    id: 3,
    name: 'Modern Dressing Table',
    image: '/img/bedroom/dressing1.webp',
    price: 17999,
    oldPrice: 29999,
    discount: '40% OFF',
    rating: '4',
    reviews: 145,
    colors: '2+ Colors',
    delivery: 'Ships in 2 Days',
    badge: 'Hot Deal',
    category: 'dressing',
  },
  {
    id: 4,
    name: 'Premium Bedside Table',
    image: '/img/bedroom/bedside1.webp',
    price: 8999,
    oldPrice: 15999,
    discount: '44% OFF',
    rating: '4',
    reviews: 164,
    colors: '4+ Colors',
    delivery: 'Ships in 2 Days',
    badge: 'Limited Offer',
    category: 'bedside',
  },
];

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Beds', value: 'bed' },
  { label: 'Wardrobes', value: 'wardrobe' },
  { label: 'Dressing Tables', value: 'dressing' },
  { label: 'Bedside Tables', value: 'bedside' },
];

const Bedroom = () => {
  return (
    <RoomLayout
      categoryName="Bedroom"
      bannerTitle="Bedroom Collection"
      bannerDesc="Discover premium Beds, Wardrobes, Dressing Tables, Bedside Tables and Mattresses for your dream bedroom."
      gridId="productGrid"
      filterOptions={filterOptions}
      categoryKeys={['bed', 'wardrobe', 'dressing', 'bedside']}
      defaultProducts={defaultBedroomProducts}
    />
  );
};

export default Bedroom;
