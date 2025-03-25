import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { v4 as uuidv4 } from "uuid";
import { useCart } from "@/hooks/use-cart";

const validationSchema = yup.object().shape({
  price: yup.number().required("Price is required").positive("Price must be positive"),
  sizes: yup.array().of(
    yup.object().shape({
      size: yup.string().required("Size is required"),
      price: yup.number().required("Size price is required").positive("Must be positive"),
      quantity: yup.number().required("Quantity is required").min(1, "Min quantity is 1"),
    })
  ),
});

const CustomProductForm = ({ isOpen, onClose }) => {
  const { addToCart } = useCart();
    
  const {
    register,
    handleSubmit,
    control,
    getValues ,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      price: 0,
      sizes: [{ size: "", price: 0, quantity: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sizes",
  });

  const onSubmit = async () => {
    const data = getValues(); // Get form values



      const totalPrice = data.sizes.reduce(
        (sum, size) => sum + Number(size.price) * Number(size.quantity),
        0
      );
    try {
      const cartItem = {
        productId: uuidv4(),
        name: "Custom",
        price: Number(totalPrice),
        image: "https://via.placeholder.com/150",
        shipping_cost: 0,
        sizes: data.sizes.map((size) => {
        
          return {
            id: uuidv4(),
            price: Number(size.price),
            quantity: Number(size.quantity),
            size_value:size.size,
            size_unit:".",
          };
        }),
        quantity: data.sizes.reduce((total, size) => total + Number(size.quantity), 0),
        customizations: {},
        notes: "",
      };

      console.log("Cart Item:", cartItem);
      
      await addToCart(cartItem); // ✅ Cart me add hoga
      onClose(); // ✅ Form close hoga
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (!isOpen) return null; // ✅ Agar modal open nahi hai toh kuch show na ho

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-lg w-full mx-auto p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Add Custom Product</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Price Input */}
          {/* <div>
            <label className="block text-sm font-medium">Price</label>
            <input
              type="number"
              {...register("price")}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
          </div> */}

          {/* Dynamic Sizes Input */}
          <div>
            <h3 className="text-lg font-medium">Custom</h3>
            {fields.map((field, index) => (
              <div key={field.id} className="flex space-x-2 items-center">
                {/* Size */}
                <input
                  type="text"
                  placeholder="Name Atleat 2 words"
                  {...register(`sizes.${index}.size`)}
                  className="p-2 border border-gray-300 rounded w-1/3"
                />
                {/* Price */}
                <label htmlFor="">Price  </label>
                <input
                  type="number"
                  placeholder="Price"
                  {...register(`sizes.${index}.price`)}
                  className="p-2 border border-gray-300 rounded w-1/3"
                />
                {/* Quantity */}
                <label htmlFor="">Qunity  </label>

                <input
                  type="number"
                  placeholder="Quantity"
                  {...register(`sizes.${index}.quantity`)}
                  className="p-2 border border-gray-300 rounded w-1/3"
                />
                {/* Remove Button */}
                <button type="button" onClick={() => remove(index)} className="text-red-500">
                  X
                </button>
              </div>
            ))}
            {/* Add Size Button */}
            <button
              type="button"
              onClick={() => append({ size: "", price: 0, quantity: 0 })}
              className="mt-2 p-2 bg-blue-500 text-white rounded"
            >
              Add Size
            </button>
          </div>

          {/* Submit and Close Buttons */}
          <div className="flex justify-between">
            <p onClick={onSubmit} className="p-2 bg-green-500 text-white rounded">
              Add to Cart
            </p>
            <button type="button" onClick={onClose} className="p-2 bg-gray-500 text-white rounded">
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomProductForm;
