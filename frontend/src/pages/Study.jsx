import React from 'react';
import RoomLayout from '../components/RoomLayout';

const defaultStudyProducts = [
  {
    id: 1,
    name: 'Modern Study Table',
    image: '/img/study/studytable1.webp',
    price: 12999,
    oldPrice: 17999,
    discount: '28% OFF',
    rating: '5',
    reviews: 186,
    colors: '3+ Colors',
    delivery: 'Ships in 3 Days',
    badge: 'Best Seller',
    category: 'study-table',
  },
  {
    id: 2,
    name: 'Ergonomic Office Chair',
    image: '/img/study/officechair1.webp',
    price: 8999,
    oldPrice: 12999,
    discount: '31% OFF',
    rating: '4',
    reviews: 142,
    colors: '4+ Colors',
    delivery: 'Ships in 2 Days',
    badge: 'New Arrival',
    category: 'office-chair',
  },
  {
    id: 3,
    name: 'Computer Desk',
    image: '/img/study/computertable1.webp',
    price: 10999,
    oldPrice: 14999,
    discount: '27% OFF',
    rating: '4',
    reviews: 118,
    colors: '2+ Colors',
    delivery: 'Ships in 3 Days',
    badge: 'Trending',
    category: 'computer-table',
  },
  {
    id: 4,
    name: 'Wooden Bookshelf',
    image: '/img/study/bookshelf1.webp',
    price: 7999,
    oldPrice: 10999,
    discount: '27% OFF',
    rating: '5',
    reviews: 96,
    colors: '3+ Colors',
    delivery: 'Ships in 4 Days',
    badge: 'Hot Deal',
    category: 'bookshelf',
  },
  {
    id: 5,
    name: 'Filing Cabinet',
    image: '/img/study/filingcabinet1.webp',
    price: 9999,
    oldPrice: 13999,
    discount: '29% OFF',
    rating: '4',
    reviews: 82,
    colors: '2+ Colors',
    delivery: 'Ships in 5 Days',
    badge: 'Limited Offer',
    category: 'filing-cabinet',
  },
];

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Study Tables', value: 'study-table' },
  { label: 'Office Chairs', value: 'office-chair' },
  { label: 'Computer Tables', value: 'computer-table' },
  { label: 'Bookshelves', value: 'bookshelf' },
  { label: 'Filing Cabinets', value: 'filing-cabinet' },
];

const Study = () => {
  return (
    <RoomLayout
      categoryName="Study & Office"
      bannerTitle="Study & Office Collection"
      bannerDesc="Create an inspiring workspace with ergonomic desks, executive chairs, bookshelves, and organizing units."
      gridId="studyGrid"
      filterOptions={filterOptions}
      categoryKeys={['study-table', 'office-chair', 'computer-table', 'bookshelf', 'filing-cabinet', 'study']}
      defaultProducts={defaultStudyProducts}
    />
  );
};

export default Study;
