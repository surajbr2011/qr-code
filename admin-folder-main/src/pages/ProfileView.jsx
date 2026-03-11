import { Icon } from "@iconify/react";
import PageWrapper from "../components/layout/PageWrapper";
import { useHotel } from "../context/HotelContext";
import { useRef, useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function ProfileView() {
  const { updateLogo, hotelProfile, updateProfile } = useHotel();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    location: '',
    outletId: '',
    trinixId: ''
  });

  useEffect(() => {
    if (hotelProfile) {
      setFormData(hotelProfile);
    }
  }, [hotelProfile]);

  const handleUpdate = async () => {
    try {
      await api.put('/hotel', formData);
      updateProfile(formData);
      toast.success("Profile Updated Successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // In a real app we'd upload to server `POST /upload` then save URL
        // For now we simulate base64 save or local
        updateLogo(reader.result);
        toast.success("Logo updated");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <PageWrapper>
      <div className="animate-page px-3 sm:px-6 space-y-8">

        {/* ================= TITLE ================= */}
        <h1 className="text-xl sm:text-2xl font-bold text-black">
          Profile View
        </h1>

        {/* ================= PROFILE INFO CARD ================= */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">

          <p className="text-center text-sm text-gray-600 mb-5">
            Your activation will expire in
            <span className="font-semibold text-black"> 365 Days</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 text-sm">
            <p><span className="font-medium">Trinix Id :</span> {hotelProfile?.trinixId || 'TRX-DEFAULT'}</p>
            <p><span className="font-medium">Outlet Id :</span> {hotelProfile?.outletId || 'OUT-001'}</p>
            <p><span className="font-medium">Name :</span> {hotelProfile?.name}</p>
            <p><span className="font-medium">Owner Name :</span> {hotelProfile?.ownerName || 'Admin'}</p>
            <p><span className="font-medium">Location :</span> {hotelProfile?.address || hotelProfile?.location}</p>
            <p><span className="font-medium">Contact Number :</span> {hotelProfile?.contactNumber || hotelProfile?.phone}</p>
          </div>
        </div>

        {/* ================= EDIT FORM CARD ================= */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6 transition-all hover:shadow-md">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Restaurant Name</label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <Icon icon="mdi:store-outline" className="text-xl text-gray-400" />
              <input
                className="w-full outline-none text-sm bg-transparent font-medium"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <Icon icon="mdi:phone-outline" className="text-xl text-gray-400" />
              <input
                className="w-full outline-none text-sm bg-transparent font-medium"
                value={formData.contactNumber || formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value, contactNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <Icon icon="mdi:email-outline" className="text-xl text-gray-400" />
              <input
                className="w-full outline-none text-sm bg-transparent font-medium"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <Icon icon="mdi:map-marker-outline" className="text-xl text-gray-400" />
              <input
                className="w-full outline-none text-sm bg-transparent font-medium"
                value={formData.address || formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value, address: e.target.value })}
              />
            </div>
          </div>

          {/* Restaurant ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Restaurant ID</label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <Icon icon="mdi:identifier" className="text-xl text-gray-400" />
              <input
                className="w-full outline-none text-sm bg-transparent font-medium"
                value={formData.trinixId || ''}
                onChange={(e) => setFormData({ ...formData, trinixId: e.target.value })}
                placeholder="RES-XXXX"
              />
            </div>
          </div>

          {/* Outlet ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outlet ID</label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <Icon icon="mdi:store-settings-outline" className="text-xl text-gray-400" />
              <input
                className="w-full outline-none text-sm bg-transparent font-medium"
                value={formData.outletId || ''}
                onChange={(e) => setFormData({ ...formData, outletId: e.target.value })}
                placeholder="OUT-XXXX"
              />
            </div>
          </div>

          {/* Owner */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner Name</label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <Icon icon="mdi:account-outline" className="text-xl text-gray-400" />
              <input
                className="w-full outline-none text-sm bg-transparent font-medium"
                value={formData.ownerName || ''}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              />
            </div>
          </div>

          {/* Upload Logo */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:cloud-upload-outline" className="text-xl text-gray-600" />
              <span className="text-sm">Upload the logo</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleLogoUpload}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-1.5 rounded-full bg-black text-white text-xs hover:scale-105 transition"
            >
              Attach
            </button>
          </div>
        </div>

        {/* ================= UPDATE BUTTON ================= */}
        <div className="flex justify-center pt-8">
          <button
            onClick={handleUpdate}
            className="px-16 py-3 rounded-full bg-black text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            Update Profile
          </button>
        </div>

      </div>
    </PageWrapper>
  );
}
