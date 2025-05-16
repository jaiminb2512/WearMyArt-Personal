import React, { useState } from "react";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    productImages: [],
    sizeStock: { XS: 5, S: 10, M: 15, L: 15, XL: 10, XXL: 5, "3XL": 5 },
    price: 599,
    discountedPrice: 399,
    description: "Comfortable cotton t-shirt with custom print option.",
    color: "Black",
    customizeOption: "Photo",
    maxEditingCost: 100,
    otherDetails: {  },
  });

  const [imagePreview, setImagePreview] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState(["S", "M", "L"]);

  // Available color options
  const colorOptions = [
    { name: "Black", class: "bg-black" },
    { name: "Yellow", class: "bg-yellow-400" },
    { name: "White", class: "bg-white border border-gray-300" },
    { name: "Gray", class: "bg-gray-400" },
    { name: "Green", class: "bg-green-500" },
    { name: "Red", class: "bg-red-500" },
    { name: "Blue", class: "bg-blue-500" },
    { name: "Navy", class: "bg-blue-900" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) => {
      if (prev.includes(size)) {
        return prev.filter((s) => s !== size);
      } else {
        return [...prev, size];
      }
    });
  };

  const handleSizeStockChange = (size, value) => {
    setFormData((prev) => ({
      ...prev,
      sizeStock: {
        ...prev.sizeStock,
        [size]: parseInt(value) || 0,
      },
    }));
  };

  const handleOtherDetailsChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      otherDetails: {
        ...prev.otherDetails,
        [key]: value,
      },
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Create image previews
      const newImagePreviews = filesArray.map((file) =>
        URL.createObjectURL(file)
      );
      setImagePreview((prev) => [...prev, ...newImagePreviews]);

      // Update form data
      setFormData((prev) => ({
        ...prev,
        productImages: [...prev.productImages, ...filesArray],
      }));
    }
  };

  const removeImage = (index) => {
    // Remove from preview
    const newPreviews = [...imagePreview];
    newPreviews.splice(index, 1);
    setImagePreview(newPreviews);

    // Remove from form data
    const newImages = [...formData.productImages];
    newImages.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      productImages: newImages,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Product data to submit:", formData);
    // Here you would make your API call in the future
  };

  // Calculate discount percentage
  const discountPercentage =
    formData.price > 0
      ? Math.round(
          ((formData.price - formData.discountedPrice) / formData.price) * 100
        )
      : 0;

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto p-6">
      {/* Product Preview Panel */}
      <div className="w-full md:w-1/3">
        <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
          <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-4 flex items-center justify-center">
            {imagePreview.length > 0 ? (
              <img
                src={imagePreview[0]}
                alt="Product Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2">No image uploaded</p>
              </div>
            )}
          </div>

          <h3 className="font-medium text-lg">
            {formData.name || "Product Name"}
          </h3>

          <div className="mt-2 flex justify-between items-center">
            <div>
              <span className="font-bold text-lg">
                ₹{formData.discountedPrice || 0}
              </span>
              {formData.price > formData.discountedPrice && (
                <>
                  <span className="text-gray-500 line-through ml-2">
                    ₹{formData.price}
                  </span>
                  <span className="text-green-600 ml-2">
                    ({discountPercentage}% Off)
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">Size:</p>
            <div className="flex gap-2 mt-1">
              {Object.keys(formData.sizeStock).map(
                (size) =>
                  selectedSizes.includes(size) && (
                    <div
                      key={size}
                      className={`h-8 w-8 flex items-center justify-center border rounded-full text-xs
                      ${
                        formData.sizeStock[size] > 0
                          ? "border-gray-300 cursor-pointer hover:border-black"
                          : "border-gray-200 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {size}
                    </div>
                  )
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">Colors:</p>
            <div className="flex gap-2 mt-1">
              {colorOptions.slice(0, 4).map((color) => (
                <div
                  key={color.name}
                  className={`h-6 w-6 rounded-full ${color.class} cursor-pointer
                    ${
                      formData.color === color.name
                        ? "ring-2 ring-offset-1 ring-blue-500"
                        : ""
                    }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, color: color.name }))
                  }
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-700">
              {formData.description || "No description available."}
            </p>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Product
            </button>
            <button
              type="button"
              className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Product Form */}
      <div className="w-full md:w-2/3">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-bold mb-6 text-gray-800">
            Add New Product
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Images */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Product Images <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <span className="text-xs text-gray-500">Up to 5 images</span>
              </div>

              {/* Image Previews */}
              {imagePreview.length > 0 && (
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {imagePreview.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="h-20 w-20 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Size and Stock */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">Size:</p>
              <div className="flex gap-2 mt-1">
                {Object.keys(formData.sizeStock).map(
                  (size) =>
                    selectedSizes.includes(size) && (
                      <div
                        key={size}
                        className={`h-8 w-8 flex items-center justify-center border rounded-full text-xs
                      ${
                        formData.sizeStock[size] > 0
                          ? "border-gray-300 cursor-pointer hover:border-black"
                          : "border-gray-200 text-gray-300 cursor-not-allowed"
                      }`}
                      >
                        {size}
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Regular Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Discounted Price
                </label>
                <input
                  type="number"
                  name="discountedPrice"
                  value={formData.discountedPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Product Attributes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sleeve Type
                </label>
                <select
                  name="sleeve"
                  value={formData.sleeve}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Half Sleeve">Half Sleeve</option>
                  <option value="Full Sleeve">Full Sleeve</option>
                  <option value="Sleeveless">Sleeveless</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Green">Green</option>
                  <option value="Blue">Blue</option>
                  <option value="Red">Red</option>
                  <option value="Black">Black</option>
                  <option value="White">White</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Customize Option */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Customize Option
                </label>
                <select
                  name="customizeOption"
                  value={formData.customizeOption}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Photo">Photo</option>
                  <option value="Text">Text</option>
                  <option value="Both">Both (Photo & Text)</option>
                  <option value="None">None</option>
                </select>
              </div>

              {/* Max Editing Cost */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Max Editing Cost
                </label>
                <input
                  type="number"
                  name="maxEditingCost"
                  value={formData.maxEditingCost}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Product Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              ></textarea>
            </div>

            {/* Other Details */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Material
              </label>
              <input
                type="text"
                value={formData.otherDetails.material}
                onChange={(e) =>
                  handleOtherDetailsChange("material", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Product
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
