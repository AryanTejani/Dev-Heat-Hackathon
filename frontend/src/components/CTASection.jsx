
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const CTASection = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.from(textRef.current, {
      scrollTrigger: {
        trigger: textRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power3.out"
    });

    gsap.from(cardRef.current, {
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.2,
      ease: "power3.out"
    });
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-20 gradient-bg"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div 
            ref={textRef}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to transform your team communication?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of teams that use SparkChat to collaborate more effectively with AI-powered assistance.
            </p>
          </div>

          <div 
            ref={cardRef}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  Start for free
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unlimited group chats</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>50 AI questions per month</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Basic file sharing</span>
                  </li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#" className="primary-button text-center">Get Started Free</a>
                  <a href="#" className="secondary-button text-center">See Pricing</a>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-20"></div>
                <div className="relative p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">P</div>
                    <div className="ml-3">
                      <p className="font-medium">Product Hunt</p>
                      <div className="flex items-center text-yellow-500 text-sm">
                        ★★★★★ <span className="text-gray-600 ml-1">5.0</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "SparkChat has revolutionized how our team communicates. The AI assistant is incredibly helpful for quick answers without disrupting our workflow."
                  </p>
                  <p className="mt-3 font-medium">Sarah Johnson, Product Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;