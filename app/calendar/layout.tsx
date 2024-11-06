import React from "react";
import Footer1 from "../Components/Footer1";
import Footer2 from "../Components/Footer2";
import Header1 from "../Components/Header1";
import Header2 from "../Components/Header2";

export default function CalendarLayout({
    children,
}:  {
    children: React.ReactNode
}
)   {
    return (
        <section>
          <Header2 />
          <main>{children}</main>
          <Footer2 />
        </section>
      );
}