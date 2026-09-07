"useClient";
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Globe,
  DollarSign,
  AlertCircle,
  Loader2,
  Search,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Sliders,
} from "lucide-react";
import {
  useShippingZones,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
} from "@/features/shipping/queries";
import { ShippingZoneItem } from "@/features/shipping/api";

export default function AdminShippingSettingsPage() {
  const { data: zonesData, isLoading, isError, refetch } = useShippingZones();
  const createMutation = useCreateShippingZoneMutation();
  const updateMutation = useUpdateShippingZoneMutation();
  const deleteMutation = useDeleteShippingZoneMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZoneItem | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [countriesText, setCountriesText] = useState("*");
  const [statesText, setStatesText] = useState("*");
  const [citiesText, setCitiesText] = useState("*");
  const [postalCodesText, setPostalCodesText] = useState("*");
  const [shippingCharge, setShippingCharge] = useState<number | string>(0);
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [freeShippingMinAmount, setFreeShippingMinAmount] = useState<number | string>("");
  const [isActive, setIsActive] = useState(true);

  const zones = zonesData?.data || [];

  const handleOpenCreateModal = () => {
    setEditingZone(null);
    setName("");
    setDescription("");
    setCountriesText("*");
    setStatesText("*");
    setCitiesText("*");
    setPostalCodesText("*");
    setShippingCharge(0);
    setIsFreeShipping(false);
    setFreeShippingMinAmount("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (zone: ShippingZoneItem) => {
    setEditingZone(zone);
    setName(zone.name);
    setDescription(zone.description || "");
    setCountriesText(Array.isArray(zone.countries) ? zone.countries.join(", ") : "*");
    setStatesText(Array.isArray(zone.states) ? zone.states.join(", ") : "*");
    setCitiesText(Array.isArray(zone.cities) ? zone.cities.join(", ") : "*");
    setPostalCodesText(Array.isArray(zone.postalCodes) ? zone.postalCodes.join(", ") : "*");
    setShippingCharge(zone.shippingCharge);
    setIsFreeShipping(zone.isFreeShipping);
    setFreeShippingMinAmount(zone.freeShippingMinAmount ?? "");
    setIsActive(zone.isActive);
    setIsModalOpen(true);
  };

  const parseCommaList = (text: string) => {
    const items = text.split(",").map((s) => s.trim()).filter(Boolean);
    return items.length > 0 ? items : ["*"];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      description: description.trim() || null,
      countries: parseCommaList(countriesText),
      states: parseCommaList(statesText),
      cities: parseCommaList(citiesText),
      postalCodes: parseCommaList(postalCodesText),
      shippingCharge: Number(shippingCharge) || 0,
      isFreeShipping,
      freeShippingMinAmount:
        freeShippingMinAmount !== "" && freeShippingMinAmount !== null
          ? Number(freeShippingMinAmount)
          : null,
      isActive,
    };

    if (editingZone) {
      updateMutation.mutate(
        { id: editingZone.id, data: payload },
        {
          onSuccess: () => {
            setIsModalOpen(false);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDelete = (zone: ShippingZoneItem) => {
    if (confirm(`Are you sure you want to delete shipping zone "${zone.name}"?`)) {
      deleteMutation.mutate(zone.id);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Sliders className="h-4 w-4" />
            <span>Admin Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Marketplace Shipping Systems
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Configure multi-vendor shipping zones, base delivery charges, free shipping thresholds, and location assignment rules.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Shipping Zone</span>
        </button>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Total Configured Zones</p>
            <p className="text-xl font-extrabold text-zinc-900 dark:text-white">{zones.length}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Active Delivery Zones</p>
            <p className="text-xl font-extrabold text-zinc-900 dark:text-white">
              {zones.filter((z) => z.isActive).length}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Free Shipping Rules</p>
            <p className="text-xl font-extrabold text-zinc-900 dark:text-white">
              {zones.filter((z) => z.isFreeShipping || z.freeShippingMinAmount !== null).length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Shipping Zones Table / List */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-600" />
            <span>Configured Shipping Zones</span>
          </h2>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Calculated dynamically on customer checkout
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-xs font-bold text-zinc-500">Loading shipping rules...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
            <p className="text-xs font-bold text-red-600">Failed to load shipping zones</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200"
            >
              Retry
            </button>
          </div>
        ) : zones.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <Truck className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No Shipping Zones Defined</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Add your first shipping zone to start charging configurable rates across local, national, or international destinations.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Zone</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Zone Name & Description</th>
                  <th className="px-6 py-4">Locations Assigned</th>
                  <th className="px-6 py-4">Shipping Charge</th>
                  <th className="px-6 py-4">Free Shipping Rule</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800 font-medium">
                {zones.map((zone) => {
                  const countriesStr = Array.isArray(zone.countries) ? zone.countries.join(", ") : "*";
                  const citiesStr = Array.isArray(zone.cities) ? zone.cities.join(", ") : "*";

                  return (
                    <tr key={zone.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-zinc-900 dark:text-white">{zone.name}</div>
                        {zone.description && (
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {zone.description}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                          <span className="font-bold text-[11px]">Countries:</span>
                          <span className="truncate max-w-[150px] font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {countriesStr}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                          <span>Cities:</span>
                          <span className="truncate max-w-[150px] font-mono text-[10px]">
                            {citiesStr}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                          ${Number(zone.shippingCharge).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {zone.isFreeShipping ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Always Free
                          </span>
                        ) : zone.freeShippingMinAmount !== null ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-extrabold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            Free for Orders ≥ ${Number(zone.freeShippingMinAmount).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">Standard Rate</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {zone.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-zinc-400 font-medium">
                            <span className="h-2 w-2 rounded-full bg-zinc-400" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(zone)}
                          className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                          title="Edit Zone"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(zone)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete Zone"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal dialog for creating / editing shipping zone */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                <span>{editingZone ? "Edit Shipping Zone" : "Create New Shipping Zone"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Zone Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Shipping"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Short description of this delivery zone"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Countries (comma-separated or *)
                  </label>
                  <input
                    type="text"
                    placeholder="* or Pakistan, United States"
                    value={countriesText}
                    onChange={(e) => setCountriesText(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Cities (comma-separated or *)
                  </label>
                  <input
                    type="text"
                    placeholder="* or New York, London, Lahore"
                    value={citiesText}
                    onChange={(e) => setCitiesText(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Base Shipping Charge ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={shippingCharge}
                    onChange={(e) => setShippingCharge(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Free Shipping Min Threshold ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 100 (leave empty for none)"
                    value={freeShippingMinAmount}
                    onChange={(e) => setFreeShippingMinAmount(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFreeShipping}
                    onChange={(e) => setIsFreeShipping(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Always Free Shipping for this Zone</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Zone Active</span>
                </label>
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Zone</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
