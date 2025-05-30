import React from "react";
import Hero from "../Components/HomeComponents/Hero";
import CustomizeTshirtProcess from "../Components/HomeComponents/CustomizeTshirtProcess";
import TShirtPrinting from "../Components/HomeComponents/TShirtPrinting";
import WhyChooseUs from "../Components/HomeComponents/WhyChooseUs";
import Testimonials from "../Components/HomeComponents/Testimonials";
import Social from "../Components/HomeComponents/Social";
import FAQ from "../Components/FAQ";
import TshirtPrintingSteps from "../Components/HomeComponents/TshirtPrintingSteps";
import FeaturesSection from "../Components/HomeComponents/FeaturesSection";
import { useSelector } from "react-redux";
import Footer from "../Components/Footer";

const Home = () => {
  const { isAdmin } = useSelector((state) => state.user);
  return (
    <>
      <Hero />
      <CustomizeTshirtProcess />
      <TShirtPrinting />
      <WhyChooseUs />
      <Testimonials />
      <TshirtPrintingSteps />
      <FeaturesSection />
      <FAQ />
      <Social />
      <Footer />
    </>
  );
};

export default Home;
