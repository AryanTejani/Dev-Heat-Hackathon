import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ChatPreviewSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const chatWindowRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const demoMessages = [
    "Hey team, just finished the first draft of the design.",
    "@ai What are some good color combinations for a tech website?",
    "For a tech website, consider these modern combinations: 1) Navy blue & orange 2) Purple & teal 3) Dark gray & electric blue 4) Mint green & charcoal. These create balance between professionalism and innovation.",
    "Thanks! I think purple and teal would work well with our brand.",
    "Agreed! When can we review the draft together?",
    "Let's set up a meeting for tomorrow at 2pm.",
    "@ai Schedule a meeting for tomorrow at 2pm with the design team",
    "Meeting scheduled for tomorrow at 2pm with the design team. I've sent calendar invites to all team members. Would you like me to prepare an agenda as well?"
  ];

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

    gsap.from(chatWindowRef.current, {
      scrollTrigger: {
        trigger: chatWindowRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 50,
      duration: 1,
      delay: 0.4,
      ease: "power3.out"
    });

    // Add messages one by one with a delay
    const messageInterval = setInterval(() => {
      if (currentMessageIndex < demoMessages.length) {
        setMessages(prev => [...prev, demoMessages[currentMessageIndex]]);
        setCurrentMessageIndex(prev => prev + 1);
      } else {
        clearInterval(messageInterval);
      }
    }, 2000);

    return () => clearInterval(messageInterval);
  }, [currentMessageIndex]);

  const getSenderInfo = (index) => {
    const isAiQuestion = messages[index].startsWith('@ai');
    const isAiResponse = index > 0 && messages[index-1].startsWith('@ai');
    
    if (isAiResponse) {
      return {
        avatar: 'AI',
        bgColor: 'bg-gradient-to-r from-purple-500 to-blue-500',
        textColor: 'text-white',
        messageBg: 'bg-gradient-to-r from-purple-50 to-blue-50'
      };
    } else if (index % 2 === 0 && !isAiQuestion) {
      return {
        avatar: 'JS',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-500',
        messageBg: 'bg-blue-50'
      };
    } else {
      return {
        avatar: 'TK',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-500',
        messageBg: 'bg-purple-50'
      };
    }
  };

  return (
    <section ref={sectionRef} className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            <span className="gradient-text">AI-powered</span> conversations
          </h2>
          <p 
            ref={subtitleRef}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            See how our AI assistant seamlessly integrates with your team chats to provide instant help without disrupting the flow.
          </p>
        </div>

        <div 
          ref={chatWindowRef}
          className="max-w-3xl mx-auto relative"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-white p-6 rounded-2xl shadow-xl">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <div className="text-sm font-medium text-gray-500">Design Team Chat</div>
              </div>
              
              <div className="space-y-5 max-h-96 overflow-y-auto">
                {messages.map((message, index) => {
                  const { avatar, bgColor, textColor, messageBg } = getSenderInfo(index);
                  
                  return (
                    <div key={index} className="flex items-start animate-fade-in">
                      <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center ${textColor} font-bold text-xs mr-3 flex-shrink-0`}>
                        {avatar}
                      </div>
                      <div 
                        className={`${messageBg} px-4 py-3 rounded-2xl rounded-tl-none text-sm max-w-md`}
                      >
                        <p className="text-gray-700">
                          {message}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {messages.length < demoMessages.length && (
                  <div className="flex items-center space-x-2 py-3 px-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-200"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-400"></div>
                  </div>
                )}
              </div>
              
              <div className="mt-5 pt-3 border-t border-gray-100">
                <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200">
                  <input 
                    type="text" 
                    placeholder="Type a message or @ai for assistance..." 
                    className="flex-1 px-4 py-2 text-sm rounded-full focus:outline-none"
                    disabled
                  />
                  <button className="text-purple-600 px-4 py-2 text-sm font-medium" disabled>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatPreviewSection;