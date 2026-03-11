import { useState, useEffect } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import { Icon } from "@iconify/react";
import api from "../utils/api";
import toast from "react-hot-toast";

const ROLES = ["Kitchen Staff", "Waiters", "Manager"]; // Match backend or UI preference

const ROLE_ICONS = {
  "Kitchen Staff": "mdi:silverware-fork-knife",
  "Waiters": "mdi:account",
  "Manager": "mdi:tie"
};

const ROLE_PERMISSIONS = {
  "Kitchen Staff": [
    "View Kitchen Orders (KOT)",
    "Change Order Status to 'Preparing' / 'Ready'",
  ],
  "Waiters": [
    "View Assigned Orders",
    "Mark Orders as Served",
  ],
  "Manager": [
    "Full Access"
  ]
};

// Format current date
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-GB", options);
};

export default function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // null | "add" | "edit"

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    email: "", // Keeping optional for now
    password: "",
  });
  const [selectedRole, setSelectedRole] = useState("Kitchen Staff");
  const [status, setStatus] = useState("Active");

  const [editingStaff, setEditingStaff] = useState(null);
  const isEdit = modalType === "edit";
  const isOpen = modalType !== null;

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get("/auth/staff");
      setStaffList(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load staff");
      setLoading(false);
    }
  };

  /* 🔒 Lock background scroll when modal open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  /* Reset form when modal opens */
  const openAddModal = () => {
    setFormData({ name: "", employeeId: "", email: "", password: "" });
    setSelectedRole("Kitchen Staff");
    setStatus("Active");
    setEditingStaff(null);
    setModalType("add");
  };

  const openEditModal = (staff) => {
    setFormData({
      name: staff.name,
      employeeId: staff.employeeId || "",
      email: staff.email || "",
      password: "", // Leave blank if not changing
    });
    setSelectedRole(staff.role === 'kitchen' ? 'Kitchen Staff' : staff.role === 'waiter' ? 'Waiters' : staff.role === 'manager' ? 'Manager' : 'Kitchen Staff');
    setStatus(staff.isActive ? "Active" : "Inactive");
    setEditingStaff(staff);
    setModalType("edit");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) return toast.error("Enter Name");
    if (!formData.employeeId.trim()) return toast.error("Enter Employee ID");

    if (!isEdit && !formData.password.trim()) return toast.error("Enter Password");

    try {
      // Map UI role to backend role
      let backendRole = 'waiter';
      if (selectedRole === 'Kitchen Staff') backendRole = 'kitchen';
      if (selectedRole === 'Waiters') backendRole = 'waiter';
      if (selectedRole === 'Manager') backendRole = 'manager';

      if (isEdit) {
        // update staff
        await api.put(`/auth/staff/${editingStaff._id}`, {
          name: formData.name,
          employeeId: formData.employeeId,
          email: formData.email, // Updated
          role: backendRole,
          status: status,
          ...(formData.password ? { password: formData.password } : {})
        });
        toast.success("Staff Updated Successfully");
        fetchStaff();
      } else {
        // Add new staff
        await api.post("/auth/register-staff", {
          name: formData.name,
          employeeId: formData.employeeId,
          email: formData.email, // Updated
          password: formData.password,
          role: backendRole
        });
        toast.success("Staff Created Successfully");
        fetchStaff();
      }
      setModalType(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!editingStaff) return;
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await api.delete(`/auth/staff/${editingStaff._id}`);
      toast.success("Staff deleted successfully");
      fetchStaff();
      setModalType(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete staff");
    }
  };

  return (
    <PageWrapper>
      <div className="animate-page px-2 sm:px-0 space-y-8">

        {/* ================= PAGE HEADER ================= */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-black">
              Staff Management
            </h1>
            <p className="text-sm text-gray-500">
              Add staff to your account
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold shadow-lg hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            + Add New Staff
          </button>
        </div>

        {/* ================= STAFF TABLE ================= */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-6 bg-gray-50/80 px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                <span>Name</span>
                <span>Employee ID</span>
                <span>Created On</span>
                <span>Role Type</span>
                <span>Status</span>
                <span className="text-right">Action</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading Staff...</div>
              ) : staffList.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <Icon icon="mdi:account-group" width={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No staff members added yet</p>
                  <p className="text-sm text-gray-400">Click "Add New Staff" to get started</p>
                </div>
              ) : (
                staffList.map((staff) => (
                  <div
                    key={staff._id}
                    className="grid grid-cols-6 px-6 py-4 border-t border-gray-50 text-sm items-center
                               hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="font-medium text-gray-900">{staff.name}</span>
                    <span className="text-gray-600 truncate pr-2 font-mono">{staff.employeeId || "-"}</span>
                    <span className="text-gray-600">{formatDate(staff.createdAt)}</span>
                    <span className="font-medium text-gray-900 capitalize">{staff.role}</span>
                    <span className={`font-bold px-3 py-1 rounded-full w-fit ${staff.isActive
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 bg-gray-100"
                      }`}>
                      {staff.isActive ? "Active" : "Inactive"}
                    </span>

                    <div className="text-right">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="inline-flex items-center gap-2 text-gray-600 font-medium hover:text-black transition-colors"
                      >
                        <Icon icon="mdi:pencil" width={16} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ================= MODAL ================= */}
        {isOpen && (
          <div
            className="fixed inset-0 z-[9999] bg-black/40 flex items-start sm:items-center justify-center overflow-auto py-8 no-scrollbar"
            onClick={() => setModalType(null)}
          >
            <div
              className="bg-white w-full max-w-[920px] rounded-2xl p-8 shadow-xl relative border border-black/10
                         animate-[scaleIn_0.2s_ease-out] max-h-[90vh] overflow-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setModalType(null)}
                className="absolute top-5 right-5 text-xl hover:scale-110 transition"
                aria-label="Close"
              >
                <Icon icon="mdi:close" width={20} />
              </button>

              <h2 className="text-xl font-semibold mb-6">
                {isEdit ? "View/Edit Staff" : "Add New Staff"}
              </h2>

              {/* ================= FORM ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <Input
                  icon="mdi:account"
                  label="Full Name"
                  placeholder="Enter Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />

                <Input
                  icon="mdi:email"
                  label="Email (Optional)"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex gap-6 mt-2 text-sm items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="staffStatus"
                        checked={status === "Active"}
                        onChange={() => setStatus("Active")}
                        className="accent-blue-600"
                      />
                      <Icon
                        icon={status === "Active" ? "mdi:check-circle" : "mdi:checkbox-blank-circle-outline"}
                        width={16}
                        className={status === "Active" ? "text-green-500" : "text-gray-300"}
                      />
                      <span>Active</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="staffStatus"
                        checked={status === "Inactive"}
                        onChange={() => setStatus("Inactive")}
                        className="accent-blue-600"
                      />
                      <Icon
                        icon={status === "Inactive" ? "mdi:close-circle" : "mdi:checkbox-blank-circle-outline"}
                        width={16}
                        className={status === "Inactive" ? "text-gray-500" : "text-gray-300"}
                      />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>

                {/* Mobile removed as backend doesn't support it yet */}

                <Input
                  icon="mdi:card-account-details"
                  label="Employee ID"
                  placeholder="Enter Emp ID"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange("employeeId", e.target.value)}
                />

                <Input
                  icon="mdi:lock"
                  label="Password"
                  placeholder="Enter Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
              </div>

              {/* ================= USER ROLE ================= */}
              <div className="border border-dashed rounded-xl p-4 mb-6">
                <p className="font-semibold mb-3">User Role</p>

                <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2`}>

                  {/* ROLE LIST */}
                  <div className="space-y-2">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`w-full text-left px-4 py-2 rounded-lg cursor-pointer text-sm font-medium flex items-center gap-3 transition-all ${selectedRole === role ? "bg-blue-50 border-l-4 border-blue-600" : "hover:bg-gray-100"
                          }`}
                      >
                        <Icon icon={ROLE_ICONS[role]} width={18} className="text-gray-600" />
                        <span>{role}</span>
                      </button>
                    ))}
                  </div>

                  {/* ================= PERMISSIONS ================= */}
                  <div className="text-sm space-y-4">
                    <div className="border border-dashed rounded-xl p-4 min-h-[220px]">
                      <p className="font-semibold mb-3">{selectedRole} Can Do</p>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {(ROLE_PERMISSIONS[selectedRole] || []).map((perm) => (
                          <li key={perm}>{perm}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= ACTIONS ================= */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setModalType(null)}
                  className="px-4 py-1 rounded-full bg-gray-100 text-sm hover:bg-gray-200 transition"
                >
                  Cancel
                </button>

                {isEdit && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-1 rounded-full bg-red-100 text-red-600 text-sm hover:bg-red-200 transition font-medium"
                  >
                    Delete Staff
                  </button>
                )}

                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-full bg-black text-white text-sm font-bold shadow-lg hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  {isEdit ? "Save Changes" : "Add User"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

/* ================= INPUT ================= */
function Input({ label, placeholder, value, onChange, icon, type = "text" }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative flex items-center">
        {icon && (
          <Icon icon={icon} width={18} className="absolute left-4 text-gray-400 pointer-events-none" />
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full border border-gray-200 rounded-xl py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 
            ${icon ? 'pl-11' : 'pl-4'} 
            ${isPassword ? 'pr-12' : 'pr-4'}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-gray-400 hover:text-blue-600 transition-colors p-1"
          >
            <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} width={20} />
          </button>
        )}
      </div>
    </div>
  );
}
