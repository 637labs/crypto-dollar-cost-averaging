import React from 'react';

import HorizontalNav3 from '../components/HorizontalNav3';
import Footer1 from '../components/Footer1';
import SplashScreenContent from "../components/SplashScreenContent";

export default function Index(): JSX.Element {
  const navigationContent = {
    brand: { text: 'nckl' },
  };

  return (
    <React.Fragment>
      <HorizontalNav3 content={navigationContent} />
      <SplashScreenContent />
      <Footer1 content={null} />
    </React.Fragment>
  );
}

