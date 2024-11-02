'use client';
import Head from 'next/head';
import Link from 'next/link';

const Footer1 = () => {
  return (
    <>
    <footer className="bg-black text-white py-6 fixed inset-x-0 bottom-0">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="mb-4 md:mb-0">TheStudio26@gmail.com</p>
          <p className="mb-4 md:mb-0">
            4100 Cameron Park Drive, Suite 118 <br /> Cameron Park, CA 95682
          </p>
          <p>916-350-0546</p>
        </div>
      </div>
    </footer>
    </>
  );
}

export default Footer1;