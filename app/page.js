import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import About from "./components/About";
import Reviews from "./components/Reviews";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      <Menu />
      <About />
      <Reviews />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}
