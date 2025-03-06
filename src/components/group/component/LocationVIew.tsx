import { useState } from "react";

interface Location {
  id: string;
  name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  countryRegion: string;
  faxNumber: string;
  ordersThisMonth: number;
  status: string;
  type: string;
}

interface LocationPopupProps {
  location: Location;
  onClose: () => void;
}

const LocationPopup: React.FC<LocationPopupProps> = ({ location, onClose }) => {
  if (!location) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <button 
          className="absolute top-2 right-2 text-gray-600 hover:text-black" 
          onClick={onClose}
        >
          ✖
        </button>
        <h2 className="text-xl font-bold mb-4">{location.name}</h2>
        <p><strong>Address:</strong> {location.address}</p>
        <p><strong>Email:</strong> {location.contact_email}</p>
        <p><strong>Phone:</strong> {location.contact_phone}</p>
        <p><strong>Orders This Month:</strong> {location.ordersThisMonth}</p>
        <p><strong>Status:</strong> {location.status}</p>
        <button 
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700" 
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};



export default LocationPopup;
