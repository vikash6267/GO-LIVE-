import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import axios from '../../axiosconfig'

function ActivationUser() {
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get("email");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEmail) {
        console.log(userEmail)
      fetchUserData(userEmail);
    }
  }, [userEmail]);

  const fetchUserData = async (email) => {
    try {
        const { data, error } = await supabase
        .from("profiles")
        .select(
          "first_name, last_name, email, mobile_phone, type, company_name, display_name ,billing_address "
        )
        .eq("email", email)
        .single(); // Fetch only one record for simplicity

      if (error) {
        console.error("Failed to fetch customer information:", error);
        throw new Error(
          "Failed to fetch customer information: " + error.message
        );
      }

      // async function sendResetPasswordLink(email) {
      //   const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      
      //   if (error) {
      //     console.error('Error sending reset password email:', error.message);
      //   } else {
      //     console.log('Password reset email sent successfully!', data);
      //   }
      // }
      // sendResetPasswordLink(email)

      // if (!data ) {
      //   throw new Error("No customer information found.");
      // }
      // console.log("Data",data);

  
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader className="animate-spin text-blue-500" size={40} />
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        ) : userData ? (
          <>
            <h2 className="text-xl font-bold text-gray-800">Your Email is Confirmed ✅</h2>
            <p className="text-gray-600 mt-2">Welcome, <strong>{userData.first_name} {userData.last_name}</strong></p>
            <p className="text-gray-600 mt-1">Email: <strong>{userData.email}</strong></p>
          </>
        ) : (
          <p className="text-red-500">Error: User data not found!</p>
        )}
      </div>
    </div>
  );
}

export default ActivationUser;
