import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Heart, Users, Shield, Clock } from 'lucide-react';
import img1 from '../../public/home1.jpg';

const Home = () => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const features = [
    { icon: Heart, title: "Connect with Others", description: "Join communities specific to your health interests or conditions." },
    { icon: Users, title: "Expert Advice", description: "Get insights from verified healthcare professionals." },
    { icon: Shield, title: "Privacy First", description: "Your personal information is always protected." },
    { icon: Clock, title: "24/7 Support", description: "Access resources and support anytime, anywhere." }
  ];

  const testimonials = [
    { text: "MedConnect has transformed my healthcare journey.", author: "Sarah Johnson", role: "Patient" },
    { text: "This platform helps me connect better with patients.", author: "Dr. Michael Chen", role: "Cardiologist" },
    { text: "The community support is incredible.", author: "Robert Smith", role: "Patient" }
  ];

  const teamMembers = [
    { name: "Parth Kedari", role: "Team Lead/Chatbot", image: "" },
    { name: "Rachit Nimje", role: "Website Full Stack", image: "" },
    { name: "Vallabh", role: "Website Full Stack", image: "" },
    { name: "Om Shintre", role: "WebRTC Backend", image: "" },
    { name: "Om Bhavsar", role: "WebRTC Backend", image: "" },
    { name: "Raj", role: "Website Backend", image: "" },
    { name: "Shaunak", role: "Chatbot Backend", image: "" }
  ];

  const images = ["/home1.jpg", "/home2.jpg", "/home3.jpg"];

  return (
    <div className="min-h-screen">
      <div className="min-h-screen flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 mb-8 md:mb-0"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Connecting Healthcare,
            <span className="text-red-600"> One Community at a Time</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            "The best way to find yourself is to lose yourself in the service of others."
            <br />
            <span className="text-gray-500 italic">- Mahatma Gandhi</span>
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Get Started
          </motion.button>
        </motion.div>

    <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-3 grid-rows-2 gap-3 w-full max-w-lg mx-auto"
        >
      <div className="col-span-2 row-span-2">
        <motion.img
          src={images[0]}
          alt="Medical 1"
          className="rounded-lg shadow-md w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
        />
      </div>

      <div className="col-span-1 row-span-1">
        <motion.img
          src={images[1]}
          alt="Medical 2"
          className="rounded-lg shadow-md w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
        />
      </div>
      <div className="col-span-1 row-span-1">
        <motion.img
          src={images[2]}
          alt="Medical 3"
          className="rounded-lg shadow-md w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
        />
      </div>

    </motion.div>
      </div>

      <div className="py-16 px-6 md:px-16">
        <h2 className="text-3xl font-bold text-center mb-12">What we provide?</h2>
        <div className="space-y-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center bg-white rounded-xl shadow-lg p-6"
            >
              <feature.icon className="w-12 h-12 text-red-600 mr-6" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-16 px-6 md:px-16">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="flex overflow-x-auto space-x-6 pb-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 min-w-[300px]"
            >
              <p className="text-gray-600 italic mb-4">{testimonial.text}</p>
              <p className="font-semibold text-red-600">{testimonial.author}</p>
              <p className="text-gray-500">{testimonial.role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-16 px-6 md:px-16">
        <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;