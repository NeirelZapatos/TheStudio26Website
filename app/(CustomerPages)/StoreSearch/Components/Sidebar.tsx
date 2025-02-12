const Sidebar = () => {
  return (
    <aside className="w-full md:w-1/4 bg-gray-100 p-6 border-r border-gray-300">
      <h2 className="text-xl font-bold mb-4">Filters</h2>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Categories</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Jewelry
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Stones
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Supplies
          </label>
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Price Range</h3>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            placeholder="$ Min"
            className="input input-bordered w-full"
          />
          <input
            type="number"
            placeholder="$ Max"
            className="input input-bordered w-full"
          />
        </div>
        <input
          type="range"
          className="range range-primary mt-4"
          min="0"
          max="1000"
        />
      </div>

      {/* Materials */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Material</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Gold
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Silver
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Copper
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Brass
          </label>
        </div>
      </div>

      {/* Colors */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Color</h3>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Red
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Blue
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Green
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Black
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            White
          </label>
        </div>
      </div>

      {/* Sizes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Size</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Small
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Medium
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />
            Large
          </label>
        </div>
      </div>
      <button className="btn btn-primary w-full">Apply Filters</button>
    </aside>
  );
};

export default Sidebar;
