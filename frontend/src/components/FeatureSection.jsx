import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageSquare, Zap, Users, Bot } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FeatureCard = ({ icon, title, description, delay }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.from(cardRef.current, {
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: delay * 0.2,
      ease: "power3.out"
    });
  }, [delay]);

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg"
    >
      <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-5">
        <div className="text-purple-600">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    gsap.from(titleRef.current, {
      scrollTrigger: {
        trigger: titleRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power3.out"
    });

    gsap.from(subtitleRef.current, {
      scrollTrigger: {
        trigger: subtitleRef.current,
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

  const features = [
    {
      icon: <MessageSquare size={24} />,
      title: "Real-time Chat",
      description: "Seamless real-time messaging with your team. Messages sync instantly across all devices."
    },
    {
      icon: <Bot size={24} />,
      title: "AI Assistant",
      description: "Just type @ai and ask a question. Our AI assistant answers right in your chat thread."
    },
    {
      icon: <Users size={24} />,
      title: "Group Collaboration",
      description: "Create groups for different projects or teams. Collaborate with everyone in one place."
    },
    {
      icon: <Zap size={24} />,
      title: "Instant Answers",
      description: "Get immediate answers to your questions without switching context or leaving the conversation."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Features that <span className="gradient-text">make teamwork better</span>
          </h2>
          <p 
            ref={subtitleRef}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            SparkChat combines real-time communication with powerful AI to enhance your team's productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
