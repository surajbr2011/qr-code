import PageWrapper from "../components/layout/PageWrapper";

export default function Setting() {
  return (
    <PageWrapper>
      <div className="animate-page px-3 sm:px-6 space-y-8 max-w-4xl">

        {/* ================= TITLE ================= */}
        <h1 className="text-xl sm:text-2xl font-bold text-black">
          Setting
        </h1>

        {/* ================= BILL SETTINGS CARD ================= */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="space-y-5">

            {[
              { label: "Send E-Bill for Quick Bill", active: true },
              { label: "Send E-Bill for Dine In" },
              { label: "Send Payment Link" },
              { label: "Send E-Bill on WhatsApp" },
              { label: "Send E-Bill on SMS" },
              { label: "Show Outlet Name" },
              { label: "Quick Bill KOT" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium text-black">
                  {item.label}
                </span>

                {/* Toggle */}
                <label className="relative inline-flex cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={item.active}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 transition-all duration-300" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 peer-checked:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ================= AUTO SYNC CARD ================= */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-black">
              Auto Sync
            </h2>

            {/* Toggle */}
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 transition-all duration-300" />
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 peer-checked:translate-x-5" />
            </label>
          </div>

          {/* Time Buttons */}
          <div className="flex flex-wrap gap-3">
            {["15 Minutes", "30 Minutes", "1 Hour", "3 Hour"].map((time, i) => (
              <button
                key={time}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${i === 0
                    ? "bg-gray-900 text-white shadow-md hover:bg-black"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
