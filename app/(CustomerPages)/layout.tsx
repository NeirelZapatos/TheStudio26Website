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
      <div className="flex flex-col min-h-screen">
        <Header2 />
        <main className="flex-1">{children}</main>
        <Footer2 />
      </div>
    </>
  );
}
