import React, { useState } from "react";

const ShippingMethodSelector = ({ onCheckout }) => {
  const [shippingMethod, setShippingMethod] = useState('');

  const handleContinueToCheckout = () => {
    if (!shippingMethod) {
      alert('Please Select a Shipping Method');
      return;
    }

    onCheckout(shippingMethod);
  };

  return (
    <div></div>
  )
}

export default ShippingMethodSelector;