"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/users/${user._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user]);

  if (!profile) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Your Profile</h1>
      <div className="space-y-3">
        <p><span className="font-medium">Username:</span> {profile.username}</p>
        <p><span className="font-medium">Email:</span> {profile.email}</p>
        <p><span className="font-medium">Role:</span> {profile.role}</p>
        {profile.role === "doctor" && (
          <p><span className="font-medium">Specialty:</span> {profile.specialty || "Not specified"}</p>
        )}
      </div>
    </div>
  );
};

export default Profile;