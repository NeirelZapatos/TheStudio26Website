import React from "react";


export default function CalendarLayout({
    children,
}:  {
    children: React.ReactNode
}
)   {
    return (
        <section>
          <main>{children}</main>
        </section>
      );
}