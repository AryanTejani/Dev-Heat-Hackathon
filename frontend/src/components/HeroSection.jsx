import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const HeroSection = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const timeline = gsap.timeline();
    
    timeline.from(titleRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power3.out'
    });
    
    timeline.from(subtitleRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4');
    
    timeline.from(ctaRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4');
    
    timeline.from(imageRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.6');
    
  }, []);

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 
              ref={titleRef} 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Talk. Collaborate. Create. 
              <span className="gradient-text block">Powered by AI.</span>
            </h1>
            <p 
              ref={subtitleRef}
              className="text-lg text-gray-600 mb-8 max-w-lg"
            >
              Experience seamless group conversations with an AI assistant that's 
              always ready to help. Type @ai and get instant answers without 
              leaving your chat.
            </p>
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
              <a href="#" className="primary-button text-center">Get Started</a>
              <a href="#" className="secondary-button text-center">Join a Group</a>
            </div>
          </div>
          
          <div ref={imageRef} className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white p-4 rounded-2xl shadow-xl">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-xs mr-3 flex-shrink-0">JS</div>
                    <div className="bg-blue-50 px-4 py-2 rounded-2xl rounded-tl-none text-sm max-w-xs">
                      <p>Can someone help me with the new API integration?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 font-bold text-xs mr-3 flex-shrink-0">TK</div>
                    <div className="bg-purple-50 px-4 py-2 rounded-2xl rounded-tl-none text-sm max-w-xs">
                      <p>@ai What's the best practice for JWT authentication?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs mr-3 flex-shrink-0">AI</div>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-2xl rounded-tl-none text-sm max-w-md">
                      <p className="text-gray-700">
                        For JWT authentication, best practices include:
                      </p>
                      <ul className="list-disc text-gray-700 pl-4 mt-1 space-y-1">
                        <li>Short expiration times</li>
                        <li>Secure, HttpOnly cookies</li>
                        <li>Proper signature validation</li>
                        <li>Refresh token rotation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
