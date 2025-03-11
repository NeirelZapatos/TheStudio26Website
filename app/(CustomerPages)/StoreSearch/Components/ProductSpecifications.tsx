interface ProductSpecsProps {
  color: string;
  size: string;
  material: string;
}

export default function ProductSpecs({
  color,
  size,
  material
}: ProductSpecsProps) {
  return (
    <div className="tabs tabs-box">
      <input
        type="radio"
        name="my_tabs_3"
        className="tab"
        aria-label="Product Specifications"
        defaultChecked
      />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        <ul className="list-disc list-inside">
          <li>Color: {color}</li>
          <li>Size: {size}</li>
          <li>Material: {material}</li>
        </ul>
      </div>

      <input type="radio" name="my_tabs_3" className="tab" aria-label="Tab 2" />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        Tab content 2
      </div>

      <input type="radio" name="my_tabs_3" className="tab" aria-label="Tab 3" />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        Tab content 3
      </div>
    </div>
  );
}
