import React from 'react';
import { useNavigate } from 'react-router-dom';

const BlogCard = ({ title, description, image, link }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="max-w-sm rounded overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105"
      onClick={() => window.location.href = link}
    >
      <img className="w-full h-48 object-cover" src={image} alt={title} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
        <p className="text-gray-700 text-base">{description}</p>
      </div>
    </div>
  );
};

const Blogs = () => {
  const blogs = [
    {
      title: "Complete Blood Count (CBC)",
      description: "Learn about CBC test, its importance, and what the results mean for your health.",
      image: "/blogs/Blog 1/dp.webp",
      link: "/blogs/Blog 1/index.html"
    },
    {
      title: "Understanding Blood Pressure",
      description: "Everything you need to know about blood pressure readings and maintaining healthy levels.",
      image: "/blogs/Blog 2/dp.webp",
      link: "/blogs/Blog 2/index.html"
    },
    {
      title: "Diabetes Management",
      description: "Essential tips and information for managing diabetes effectively.",
      image: "/blogs/Blog 3/dp.webp",
      link: "/blogs/Blog 3/index.html"
    },
    {
      title: "Heart Health",
      description: "Guidelines for maintaining a healthy heart and preventing cardiovascular diseases.",
      image: "/blogs/Blog 4/dp.webp",
      link: "/blogs/Blog 4/index.html"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Medical Blogs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.map((blog, index) => (
          <BlogCard key={index} {...blog} />
        ))}
      </div>
    </div>
  );
};

export default Blogs;