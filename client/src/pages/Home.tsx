import React from 'react';

import HorizontalNav from '../components/HorizontalNav';
import Footer from '../components/Footer';
import HomeContent from "../components/HomeContent";

export default function Home(): JSX.Element {
  const navigationContent = {
    brand: { text: 'nckl' },
  };

  return (
    <React.Fragment>
      <HorizontalNav content={navigationContent} />
      <HomeContent />
      <Footer />
    </React.Fragment>
  );
}

