import React from 'react';

import HorizontalNav3 from '../components/HorizontalNav3';
import Features4 from '../components/Features4';
import Pricing2 from '../components/Pricing2';
import Footer1 from '../components/Footer1';

export default function Index(): JSX.Element {
  const navigationContent = {
    brand: { text: 'nckl' },
  };

  return (
    <React.Fragment>
      <HorizontalNav3 content={navigationContent} />
      <Features4 content={null} />
      <Pricing2 content={null} />
      <Footer1 content={null} />
    </React.Fragment>
  );
}

