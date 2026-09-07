"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Store,
  CheckCircle2,
  XCircle,
  Key,
  Lock,
  Plus,
  Edit2,
  Save,
  AlertCircle,
  Sliders,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface RoleDefinition {
  id: string;
  name: string;
  code: "ADMIN" | "SELLER" | "CUSTOMER";
  description: string;
  userCount: number;
  badgeColor: string;
  permissions: {
    manageSettings: boolean;
    manageShippingZones: boolean;
    manageProducts: boolean;
    fulfillOrders: boolean;
    requestPayouts: boolean;
    manageCoupons: boolean;
    viewAnalytics: boolean;
  };
}

export default function AdminRolesSettingsPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([
    {
      id: "role-admin",
      name: "Administrator",
      code: "ADMIN",
      description: "Full system administration privileges, financial controls, and platform settings.",
      userCount: 3,
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
      permissions: {
        manageSettings: true,
        manageShippingZones: true,
        manageProducts: true,
        fulfillOrders: true,
        requestPayouts: true,
        manageCoupons: true,
        viewAnalytics: true,
      },
    },
    {
      id: "role-seller",
      name: "Vendor / Seller",
      code: "SELLER",
      description: "Shop owners who list products, fulfill vendor orders, and request earnings payouts.",
      userCount: 24,
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      permissions: {
        manageSettings: false,
        manageShippingZones: false,
        manageProducts: true,
        fulfillOrders: true,
        requestPayouts: true,
        manageCoupons: false,
        viewAnalytics: true,
      },
    },
    {
      id: "role-customer",
      name: "Customer",
      code: "CUSTOMER",
      description: "Registered buyers who browse products, place orders, write reviews, and manage addresses.",
      userCount: 512,
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      permissions: {
        manageSettings: false,
        manageShippingZones: false,
        manageProducts: false,
        fulfillOrders: false,
        requestPayouts: false,
        manageCoupons: false,
        viewAnalytics: false,
      },
    },
  ]);

  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenEdit = (role: RoleDefinition) => {
    setEditingRole({ ...role, permissions: { ...role.permissions } });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (key: keyof RoleDefinition["permissions"]) => {
    if (!editingRole) return;
    setEditingRole({
      ...editingRole,
      permissions: {
        ...editingRole.permissions,
        [key]: !editingRole.permissions[key],
      },
    });
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? editingRole : r)));
    setIsModalOpen(false);
    toast.success(`Role permissions updated for ${editingRole.name}!`);
  };

  const permissionLabels: Array<{ key: keyof RoleDefinition["permissions"]; label: string; desc: string }> = [
    { key: "manageSettings", label: "General Settings Control", desc: "Modify marketplace title, currency & gateway configurations" },
    { key: "manageShippingZones", label: "Manage Shipping Zones", desc: "Configure shipping zones, rates & free shipping rules" },
    { key: "manageProducts", label: "Product Management", desc: "Create, edit, approve or archive product catalog listings" },
    { key: "fulfillOrders", label: "Order Processing", desc: "Update vendor order statuses (Processing, Shipped, Delivered)" },
    { key: "requestPayouts", label: "Seller Earnings Payouts", desc: "Access balance dashboard and request payout disbursements" },
    { key: "manageCoupons", label: "Coupons & Discounts", desc: "Create promotional discount vouchers and coupon codes" },
    { key: "viewAnalytics", label: "Analytics & Reports", desc: "Access revenue, GMV, and order analytics dashboards" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            <Shield className="h-4 w-4" />
            <span>Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Roles & Capability Permissions</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Configure system roles, access capabilities, and security boundaries across Admin, Seller, and Customer accounts.
          </p>
        </div>
      </div>

      {/* Role Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${role.badgeColor}`}>
                  {role.code}
                </span>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  {role.userCount} Users
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">{role.name}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{role.description}</p>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs font-medium">
                {permissionLabels.slice(0, 4).map((p) => {
                  const hasPerm = role.permissions[p.key];
                  return (
                    <div key={p.key} className="flex items-center justify-between text-[11px]">
                      <span className={hasPerm ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400 line-through"}>
                        {p.label}
                      </span>
                      {hasPerm ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenEdit(role)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Configure Capabilities</span>
            </button>
          </div>
        ))}
      </div>

      {/* Permission Matrix Table */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Key className="h-4 w-4 text-emerald-600" />
            <span>Capability Matrix Overview</span>
          </h2>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            System Security Model
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200/80 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Capability</th>
                {roles.map((r) => (
                  <th key={r.id} className="px-6 py-4 text-center">
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800 font-medium">
              {permissionLabels.map((p) => (
                <tr key={p.key} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900 dark:text-white">{p.label}</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{p.desc}</div>
                  </td>
                  {roles.map((r) => {
                    const active = r.permissions[p.key];
                    return (
                      <td key={r.id} className="px-6 py-4 text-center">
                        {active ? (
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mx-auto">
                            <Check className="h-4 w-4 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 mx-auto">
                            ✕
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {isModalOpen && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  Configure Permissions: {editingRole.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Toggle fine-grained system capabilities for role code <strong>{editingRole.code}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="space-y-3">
                {permissionLabels.map((p) => {
                  const isChecked = editingRole.permissions[p.key];
                  return (
                    <label
                      key={p.key}
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 cursor-pointer"
                    >
                      <div>
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-white block">
                          {p.label}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                          {p.desc}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(p.key)}
                        className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Role Permissions</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
