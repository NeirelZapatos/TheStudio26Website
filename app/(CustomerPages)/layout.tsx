// app/(main)/layout.tsx
import Header2 from "../Components/Header2";
import Footer2 from "../Components/Footer2";
export default function MainLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <>
        <Header2 />
        {children}
        <Footer2 />
      </>
    );
  }