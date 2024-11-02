'use client';
import Header1 from "../Components/Header1";
import Footer1 from "../Components/Footer1";
import Header2 from "../Components/Header2";
import Footer2 from "../Components/Footer2";


export default function Page() {
  return (
    <div>
      <Header2/>
      <div className="bg-[#f5f5f5]">
        <section className="text-center p-10 bg-white-100">
          <h2 className="text-4xl font-bold text-[#1e1e1e] mb-4 mx-auto">Lab Sessions</h2>
          <p className="text-xl font-bold text-[#000000] max-w-3xl mx-auto">Open Lab with Master Dan
          </p>
        </section>
      </div>
      <div className = "flex justify-center items-center">
        <button className="bg-black text-white btn">Individual</button>
        <button className="bg-black text-white btn">Monthly</button>
      </div>
      <Footer2/>
    </div>
  );
}