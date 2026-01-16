import React from 'react';

const Philosophy: React.FC = () => {
  return (
    <section id="philosophy" className="py-24 md:py-32 bg-cream relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-4 fade-up">
            <div className="w-16 h-1 bg-gold mb-8"></div>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight">
              Our <br/> <span className="italic text-gold-dark">Philosophy</span>
            </h2>
          </div>
          
          <div className="md:col-span-8 fade-up">
            <p className="font-serif text-2xl md:text-3xl text-charcoal-light leading-relaxed mb-8">
              "We believe that wellness is not a luxury, but a necessity for the soul. At Golden Tower Spa, we blend the architectural elegance of Paris with the warm, healing hands of Oriental Mindoro."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-charcoal/80 font-light leading-relaxed">
              <p>
                Every treatment is a ritual, designed to elevate your senses and ground your spirit. We use only organic, gold-infused oils and locally sourced botanicals to ensure your skin receives nature's purest gifts.
              </p>
              <p>
                Located in the heart of Mansalay, we offer a sanctuary where time slows down, allowing you to reconnect with your inner balance amidst the chaos of modern life.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;