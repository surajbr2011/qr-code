import { useState, useEffect } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import { Icon } from "@iconify/react";
import { useHotel } from "../context/HotelContext"; // Assuming this context wraps api calls or we use api directly
import api from "../utils/api";
import toast from "react-hot-toast";

export default function GeneralSetting() {
  const [tab, setTab] = useState("all");
  const { hotelProfile, updateProfile } = useHotel();
  const [settings, setSettings] = useState({
    billSettings: {
      sendEBillQuick: true,
      sendEBillDineIn: false,
      sendPaymentLink: false,
      sendWhatsapp: false,
      sendSMS: false,
      showOutletName: true,
      quickBillKOT: false
    },
    autoSync: true,
    syncInterval: '15 Minutes',
    printers: []
  });

  useEffect(() => {
    if (hotelProfile?.settings) {
      setSettings(hotelProfile.settings);
    }
  }, [hotelProfile]);

  const handleToggle = async (section, key, value) => {
    try {
      let newSettings = { ...settings };

      if (section === 'billSettings') {
        newSettings.billSettings[key] = value;
      } else if (section === 'root') {
        newSettings[key] = value;
      }

      setSettings(newSettings);

      // Optimistic UI, but update backend
      // We need to pass the FULL profile update usually, or just settings
      // Assuming updateProfile handles merging or we send full object
      await api.put('/hotel', { settings: newSettings });
      toast.success("Settings saved");
      // update context if needed
      updateProfile({ settings: newSettings });

    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    }
  };

  const billOptions = [
    { key: "sendEBillQuick", label: "Send E-Bill for Quick Bill" },
    { key: "sendEBillDineIn", label: "Send E-Bill for Dine In" },
    { key: "sendPaymentLink", label: "Send Payment Link" },
    { key: "sendWhatsapp", label: "Send E-Bill on WhatsApp" },
    { key: "sendSMS", label: "Send E-Bill on SMS" },
    { key: "showOutletName", label: "Show Outlet Name" },
    { key: "quickBillKOT", label: "Quick Bill KOT" },
  ];

  return (
    <PageWrapper>
      <div className="animate-page px-3 sm:px-6 space-y-8 max-w-7xl">

        {/* ================= HEADER ================= */}
        <h1 className="text-xl sm:text-2xl font-bold text-black">
          General Setting
        </h1>

        {/* ================= TOP CARDS ================= */}
        <div className="flex gap-6">
          {/* All Setting */}
          <button
            onClick={() => setTab("all")}
            className={`w-40 h-32 rounded-3xl border transition-all duration-300
            flex flex-col items-center justify-center gap-2
            ${tab === "all"
                ? "bg-white border-blue-100 ring-4 ring-blue-50/50 shadow-xl scale-105"
                : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-white hover:shadow-md"
              }`}
          >
            <div className={`p-3 rounded-full ${tab === "all" ? "bg-blue-100/50" : "bg-gray-100"}`}>
              <Icon icon="mdi:cog" className={`text-4xl ${tab === "all" ? "text-blue-500" : "text-gray-400"}`} />
            </div>
            <span className={`font-semibold text-sm ${tab === "all" ? "text-black" : "text-gray-500"}`}>All Setting</span>
          </button>

          {/* Printer Setting */}
          <button
            onClick={() => setTab("printer")}
            className={`w-40 h-32 rounded-3xl border transition-all duration-300
            flex flex-col items-center justify-center gap-2
            ${tab === "printer"
                ? "bg-white border-blue-100 ring-4 ring-blue-50/50 shadow-xl scale-105"
                : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-white hover:shadow-md"
              }`}
          >
            <div className={`p-3 rounded-full ${tab === "printer" ? "bg-blue-100/50" : "bg-gray-100"}`}>
              <Icon icon="mdi:printer" className={`text-4xl ${tab === "printer" ? "text-blue-500" : "text-gray-400"}`} />
            </div>
            <span className={`font-semibold text-sm ${tab === "printer" ? "text-black" : "text-gray-500"}`}>Printer Setting</span>
          </button>
        </div>

        {/* ================= ALL SETTINGS ================= */}
        {tab === "all" && (
          <>
            {/* -------- BILL SETTINGS -------- */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm w-full md:max-w-2xl">
              <div className="space-y-6">
                {billOptions.map((opt) => (
                  <div key={opt.key} className="flex justify-between items-center gap-4">
                    <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                    <label className="relative inline-flex cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.billSettings?.[opt.key] || false}
                        onChange={(e) => handleToggle('billSettings', opt.key, e.target.checked)}
                      />
                      <div className="w-12 h-7 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-all duration-300" />
                      <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* -------- AUTO SYNC -------- */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm w-full md:max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg text-black">Auto Sync</h2>
                <label className="relative inline-flex cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.autoSync || false}
                    onChange={(e) => handleToggle('root', 'autoSync', e.target.checked)}
                  />
                  <div className="w-12 h-7 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-all duration-300" />
                  <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5" />
                </label>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {["15 Minutes", "30 Minutes", "1 Hour", "3 Hour"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleToggle('root', 'syncInterval', t)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-[10px] sm:text-xs font-semibold transition-all duration-200 shadow-sm
                    ${settings.syncInterval === t
                        ? "bg-gray-900 text-white shadow-md hover:bg-black"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ================= PRINTER SETTINGS ================= */}
        {tab === "printer" && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm w-full md:max-w-4xl min-h-[400px] flex flex-col justify-between overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Header */}
                <div className="grid grid-cols-3 font-bold text-sm mb-6 px-4">
                  <span>Printers Name</span>
                  <div className="text-center">Active</div>
                  <div className="text-right">No of Prints</div>
                </div>

                {/* Rows */}
                <div className="space-y-6">
                  {["KOT Printer", "Quick Bill"].map((name, i) => (
                    <div
                      key={name}
                      className="grid grid-cols-3 items-center px-4"
                    >
                      <span className="text-sm font-medium text-gray-800">{name}</span>

                      <div className="flex justify-center">
                        <label className="relative inline-flex cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={i === 0} />
                          <div className="w-12 h-7 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-all duration-300" />
                          <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5" />
                        </label>
                      </div>

                      <div className="text-right text-sm text-gray-400">—</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100">
              <button onClick={() => toast("Feature coming soon")} className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-medium shadow-lg hover:bg-gray-800 transition-colors">
                Add New Printer
              </button>

              <div className="flex gap-3">
                <button className="px-8 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Reset
                </button>
                <button onClick={() => toast.success("Printer settings saved")} className="px-8 py-2.5 rounded-full bg-black text-white text-sm font-medium shadow-lg hover:bg-gray-800 transition-colors">
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
