import Hero from "./test-components/Hero";
import ClassCard from "./test-components/ClassCard";

export default function Page() {
 
  return (
    <div className="flex w-full flex-col border-opacity-50">
      <Hero />
      <div className="divider"></div>
      <div className="flex w-full">
        <ClassCard />
        <div className="divider divider-horizontal"></div>
        <ClassCard />
        <div className="divider divider-horizontal"></div>
        <ClassCard />
        <div className="divider divider-horizontal"></div>
        <ClassCard />
      </div>
      <div className="divider"></div>
    </div>
    );
  }