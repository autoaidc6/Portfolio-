import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Projects from '../components/Projects';
import About from '../components/About';
import Blog from '../components/Blog';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      <main>
        <Hero />
        <Projects />
        <About />
        <Blog />
      </main>
      <Footer />
    </div>
  );
}

export default Home;