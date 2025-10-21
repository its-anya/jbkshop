import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-12 py-8 border-t">
      <div className="container mx-auto px-4 text-center text-gray-500">
        <h3 className="font-serif text-2xl text-pink-500 mb-4">Jewels by Khadijah</h3>
        <p className="text-sm">Unique. As you... ✨</p>
        <div className="flex justify-center space-x-6 my-4">
          <a href="#" className="text-gray-500 hover:text-pink-500 transition-colors">Instagram</a>
          <a href="#" className="text-gray-500 hover:text-pink-500 transition-colors">Facebook</a>
          <a href="#" className="text-gray-500 hover:text-pink-500 transition-colors">Pinterest</a>
        </div>
        <p className="text-xs">&copy; {new Date().getFullYear()} Jewels by Khadijah. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;