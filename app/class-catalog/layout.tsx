import React from "react";
import Footer from "./test-components/Footer";
import Navbar from "./test-components/Navbar";
import Header from "./test-components/Header";

export default function ClassCatalogLayout({
    children,
}:  {
    children: React.ReactNode
}
)   {
    return (
        <section>
          <Header />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </section>
      );
}