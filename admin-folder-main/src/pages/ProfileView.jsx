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

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (hotelProfile) {
      setFormData(hotelProfile);
    }
  }, [hotelProfile]);

  const handleUpdate = async () => {
    // Basic validation
    if (!formData.name?.trim() || !formData.phone?.trim() || !formData.email?.trim()) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    setIsSaving(true);
    try {
      // Create request payload matching API expectation
      const payload = {
        name: formData.name,
        contactNumber: formData.phone || formData.contactNumber,
        email: formData.email,
        address: formData.location || formData.address,
        ownerName: formData.ownerName,
        // trinixId and outletId are intentionally read-only on frontend editing scope
      };

      await api.put('/hotel', payload);
      updateProfile(payload); // Context sync
      toast.success("Profile Updated Successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateLogo(reader.result);
        toast.success("Logo updated successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <PageWrapper>
      {/* BUG-019: pb-32 adds scroll runway so fields aren't cut off behind footer */}
      <div className="animate-page px-3 sm:px-6 space-y-8 pb-32">

        {/* ================= TITLE ================= */}
        <h1 className="text-xl sm:text-2xl font-bold text-black pt-4">
          Profile Management
        </h1>

        {/* ================= PROFILE INFO CARD ================= */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
          {(() => {
            // BUG-005, BUG-006: Dynamic activation expiry computation
            const endDate = hotelProfile?.activationEndDate
              ? new Date(hotelProfile.activationEndDate)
              // Provide a mockup of 29 days remaining if missing, just for visual validation
              : new Date(Date.now() + 29 * 24 * 60 * 60 * 1000);

            const diffTime = endDate - new Date();
            const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

            let bannerClass = "bg-gray-50 border-gray-200 text-gray-800";
            let highlightClass = "text-black";
            let urgencyBtn = false;

            if (daysRemaining <= 7) {
              bannerClass = "bg-red-50 border-red-200 text-red-800";
              highlightClass = "text-red-600";
              urgencyBtn = true;
            } else if (daysRemaining <= 30) {
              bannerClass = "bg-orange-50 border-orange-200 text-orange-800";
              highlightClass = "text-orange-600";
              urgencyBtn = true;
            }

            return (
              <div className={`flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl mb-6 border ${bannerClass}`}>
                <p className="text-sm font-medium text-center sm:text-left">
                  Your activation will expire in <span className={`font-bold ${highlightClass} text-lg ml-1`}>{daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}</span>
                </p>
                {urgencyBtn && (
                  <button className="mt-3 sm:mt-0 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg shadow-sm hover:bg-gray-800 transition-colors">
                    Renew Now
                  </button>
                )}
              </div>
            );
          })()}

          {/* BUG-015: Improved consistent string/colon spacing using flex grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm max-w-3xl mx-auto">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-semibold text-gray-500">Trinix ID</span>
              <span className="font-medium text-gray-900">{hotelProfile?.trinixId || 'TRX-DEFAULT'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-semibold text-gray-500">Outlet ID</span>
              <span className="font-medium text-gray-900">{hotelProfile?.outletId || 'OUT-001'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-semibold text-gray-500">Restaurant</span>
              <span className="font-medium text-gray-900">{hotelProfile?.name || '---'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-semibold text-gray-500">Owner Name</span>
              <span className="font-medium text-gray-900">{hotelProfile?.ownerName || 'Admin'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-semibold text-gray-500">Location</span>
              <span className="font-medium text-gray-900 truncate max-w-[150px] text-right" title={hotelProfile?.address || hotelProfile?.location}>
                {hotelProfile?.address || hotelProfile?.location || '---'}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-semibold text-gray-500">Contact</span>
              <span className="font-medium text-gray-900">{hotelProfile?.contactNumber || hotelProfile?.phone || '---'}</span>
            </div>
          </div>
        </div>

        {/* ================= EDIT FORM CARD ================= */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6 transition-all hover:shadow-md">

          {/* Name */}
          <div className="space-y-1.5 group">
            {/* BUG-018: Darker label for contrast | BUG-009: red asterisk */}
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Restaurant Name <span className="text-red-500">*</span>
            </label>
            {/* BUG-008: White background, active focus ring */}
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <Icon icon="mdi:store-outline" className="text-xl text-gray-400 group-focus-within:text-blue-500" />
              <input
                className="w-full outline-none text-sm bg-transparent font-medium text-gray-900 placeholder-gray-400"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. B S B Restaurant" // BUG-010
                maxLength={50}
              />
              <Icon icon="mdi:pencil-outline" className="text-gray-300 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <div className="text-right text-[10px] text-gray-400">{formData.name?.length || 0}/50</div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <Icon icon="mdi:phone-outline" className="text-xl text-gray-400 group-focus-within:text-blue-500" />
              <input
                type="tel"         // BUG-016: type="tel" and inputMode="numeric"
                inputMode="numeric"
                className="w-full outline-none text-sm bg-transparent font-medium text-gray-900 placeholder-gray-400"
                value={formData.contactNumber || formData.phone || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // Numbers only
                  setFormData({ ...formData, phone: val, contactNumber: val });
                }}
                placeholder="e.g. 9876543210" // BUG-010
                maxLength={15}
              />
              <Icon icon="mdi:pencil-outline" className="text-gray-300 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <Icon icon="mdi:email-outline" className="text-xl text-gray-400 group-focus-within:text-blue-500" />
              <input
                type="email"
                className="w-full outline-none text-sm bg-transparent font-medium text-gray-900 placeholder-gray-400"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="restaurant@example.com"
              />
              <Icon icon="mdi:pencil-outline" className="text-gray-300 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Location / Address */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Location
            </label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <Icon icon="mdi:map-marker-outline" className="text-xl text-gray-400 group-focus-within:text-blue-500" />
              <input
                className="w-full outline-none text-sm bg-transparent font-medium text-gray-900 placeholder-gray-400"
                value={formData.address || formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value, address: e.target.value })}
                placeholder="e.g. Bangalore, India"
              />
              <Icon icon="mdi:pencil-outline" className="text-gray-300 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Owner Name */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Owner Name
            </label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <Icon icon="mdi:account-outline" className="text-xl text-gray-400 group-focus-within:text-blue-500" />
              <input
                className="w-full outline-none text-sm bg-transparent font-medium text-gray-900 placeholder-gray-400"
                value={formData.ownerName || ''}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="e.g. John Doe"
              />
              <Icon icon="mdi:pencil-outline" className="text-gray-300 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Restaurant ID (Read-only System ID) */}
            <div className="space-y-1.5 opacity-80 cursor-not-allowed">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Restaurant / Trinix ID</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-100">
                <Icon icon="mdi:identifier" className="text-xl text-gray-400" />
                <input
                  className="w-full outline-none text-sm bg-transparent font-medium text-gray-500 cursor-not-allowed"
                  value={formData.trinixId || ''}
                  readOnly
                  title="System identifiers cannot be changed manually"
                />
                <Icon icon="mdi:lock-outline" className="text-gray-400" />
              </div>
            </div>

            {/* Outlet ID (Read-only System ID) */}
            <div className="space-y-1.5 opacity-80 cursor-not-allowed">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Outlet ID</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-100">
                <Icon icon="mdi:store-settings-outline" className="text-xl text-gray-400" />
                <input
                  className="w-full outline-none text-sm bg-transparent font-medium text-gray-500 cursor-not-allowed"
                  value={formData.outletId || ''}
                  readOnly
                  title="System identifiers cannot be changed manually"
                />
                <Icon icon="mdi:lock-outline" className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Upload Logo */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                <Icon icon="mdi:cloud-upload-outline" className="text-xl" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-800 block">Restaurant Logo</span>
                <span className="text-xs text-gray-400">Attach a transparent PNG or JPG</span>
              </div>
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
              className="px-5 py-2 rounded-lg bg-gray-900 border border-transparent text-white text-sm font-medium hover:bg-gray-800 active:scale-95 transition-all shadow-sm"
            >
              Upload
            </button>
          </div>
        </div>

      </div>

      {/* BUG-007: Sticky Footer for Action Button ensuring it's always visible */}
      <div className="fixed bottom-0 left-0 md:left-[260px] right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 flex justify-end md:justify-center">
        <button
          onClick={handleUpdate}
          disabled={isSaving}
          className={`px-8 py-3 rounded-xl bg-orange-500 text-white font-bold shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 flex items-center gap-2 ${isSaving ? "opacity-75 cursor-wait" : ""}`}
        >
          {isSaving ? (
            <>
              <Icon icon="mdi:loading" className="animate-spin text-xl" />
              Saving...
            </>
          ) : (
            <>
              <Icon icon="mdi:content-save-outline" className="text-xl" />
              Save Changes
            </>
          )}
        </button>
      </div>

    </PageWrapper>
  );
}
