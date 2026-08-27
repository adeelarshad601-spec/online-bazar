"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCart } from "@/features/cart/queries";
import { useProductDetails } from "@/features/products/queries";
import { useCurrentUser } from "@/features/auth/queries";
import { useCheckoutMutation } from "@/features/checkout/queries";
import { shippingAddressSchema, ShippingAddressInput } from "@/features/checkout/schemas";
import {
  CheckCircle2,
  MapPin,
  ShoppingBag,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Tag,
  AlertCircle,
  Package,
} from "lucide-react";

function CheckoutStepper({ currentStep = 2 }: { currentStep?: number }) {
  const steps = [
    { id: 1, name: "Cart", status: "completed" },
    { id: 2, name: "Shipping & Address", status: currentStep >= 2 ? "active" : "pending" },
    { id: 3, name: "Order Review", status: currentStep >= 3 ? "active" : "pending" },
    { id: 4, name: "Confirmation", status: currentStep >= 4 ? "completed" : "pending" },
  ];

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="flex items-center justify-between gap-2 sm:gap-4">
        {steps.map((step, idx) => (
          <li key={step.id} className="flex-1">
            <div className="flex flex-col items-center group">
              <div className="flex items-center w-full">
                {idx > 0 && (
                  <div
                    className={`h-0.5 w-full transition-colors ${
                      step.id <= currentStep ? "bg-emerald-600" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                )}
                <div
                  className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step.id < currentStep
                      ? "bg-emerald-600 text-white"
                      : step.id === currentStep
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950"
                      : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-full transition-colors ${
                      step.id < currentStep ? "bg-emerald-600" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-[11px] sm:text-xs font-bold text-center transition-colors ${
                  step.id === currentStep
                    ? "text-emerald-700 dark:text-emerald-400"
                    : step.id < currentStep
                    ? "text-zinc-800 dark:text-zinc-200"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-96 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-80 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function CheckoutFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNowParam = searchParams.get("buyNow") === "true";
  const buyNowProductId = searchParams.get("productId");
  const buyNowVariantId = searchParams.get("variantId");
  const buyNowQtyParam = parseInt(searchParams.get("quantity") || "1", 10);
  const buyNowQuantity = isNaN(buyNowQtyParam) || buyNowQtyParam < 1 ? 1 : buyNowQtyParam;

  const { data: buyNowProduct, isLoading: isBuyNowProductLoading } = useProductDetails(
    isBuyNowParam && buyNowProductId ? buyNowProductId : ""
  );

  const { data: user } = useCurrentUser();
  const { data: cart, isLoading: isCartLoading, isError: isCartError } = useCart();
  const { mutate: executeCheckout, isPending: isSubmitting, data: checkoutData } = useCheckoutMutation();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Navigate to success page after successful checkout
  useEffect(() => {
    if (checkoutData?.success && checkoutData.data?.id) {
      const timer = setTimeout(() => {
        router.push(`/checkout/success?orderId=${checkoutData.data.id}`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [checkoutData, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: user?.name || "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "United States",
    },
  });

  if (user && user.role !== "CUSTOMER") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-12 dark:border-amber-900/40 dark:bg-amber-950/20 text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-300">
            Customer Account Required
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto">
            Checkout is available exclusively for customer accounts. You are currently logged in as a <strong>{user.role}</strong>.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-700"
          >
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const isLoading = isBuyNowParam ? isBuyNowProductLoading : isCartLoading;

  if (isLoading) {
    return <CheckoutSkeleton />;
  }

  if (!isBuyNowParam && isCartError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-12 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold text-red-900 dark:text-red-300">
            Cart Unavailable
          </h1>
          <p className="mt-1 max-w-sm text-xs text-red-600 dark:text-red-400">
            We couldn't retrieve your cart for checkout. Please return to cart and try again.
          </p>
          <Link
            href="/cart"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  let items: any[] = [];
  if (isBuyNowParam) {
    if (buyNowProduct) {
      let selectedVariant = null;
      if (buyNowVariantId && buyNowProduct.variants) {
        selectedVariant = buyNowProduct.variants.find((v: any) => v.id === buyNowVariantId) || null;
      }
      const rawPrice = selectedVariant?.price ?? buyNowProduct.price;
      const numericPrice = typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice || 0));

      items = [
        {
          id: "buy-now-item",
          productId: buyNowProduct.id,
          variantId: selectedVariant?.id || null,
          quantity: buyNowQuantity,
          price: numericPrice,
          subtotal: numericPrice * buyNowQuantity,
          product: buyNowProduct,
          variant: selectedVariant,
        },
      ];
    }
  } else {
    items = (cart?.items || []).map((item: any) => {
      const rawPrice = item.price;
      const numericPrice = typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice || 0));
      return {
        ...item,
        price: numericPrice,
        subtotal: numericPrice * item.quantity,
      };
    });
  }

  const isCartEmpty = items.length === 0;

  if (isCartEmpty) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white p-16 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">
            No Items Selected for Checkout
          </h2>
          <p className="mt-2 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
            You cannot proceed to checkout without selecting a product. Browse our store to add products.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            <span>Browse Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmountValue = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      setAppliedCoupon(couponInput.trim().toUpperCase());
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const onSubmit = async (data: ShippingAddressInput) => {
    if (isSubmitting) return;

    // Execute mutation and handle response
    executeCheckout({
      shippingAddress: data,
      paymentMethod: "COD",
      couponCode: appliedCoupon || null,
      buyNowItem: isBuyNowParam && buyNowProductId
        ? {
            productId: buyNowProductId,
            variantId: buyNowVariantId || null,
            quantity: buyNowQuantity,
          }
        : null,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
            Checkout
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Complete your shipping address and review your order to place order
          </p>
        </div>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Shopping Cart</span>
        </Link>
      </div>

      {/* Checkout Stepper */}
      <CheckoutStepper currentStep={2} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Form & Review */}
          <div className="space-y-8 lg:col-span-2">
            {/* Section 1: Shipping Address Form */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    1. Shipping Address
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Where should we deliver your items?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. Jane Doe"
                    {...register("fullName")}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white transition-colors focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                      errors.fullName
                        ? "border-red-500 dark:border-red-500"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    disabled={isSubmitting}
                    placeholder="e.g. +1 555-019-2834"
                    {...register("phone")}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white transition-colors focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                      errors.phone
                        ? "border-red-500 dark:border-red-500"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="country"
                    type="text"
                    disabled={isSubmitting}
                    placeholder="United States"
                    {...register("country")}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white transition-colors focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                      errors.country
                        ? "border-red-500 dark:border-red-500"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  />
                  {errors.country && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address"
                    type="text"
                    disabled={isSubmitting}
                    placeholder="123 Main Street, Suite or Apt #"
                    {...register("address")}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white transition-colors focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                      errors.address
                        ? "border-red-500 dark:border-red-500"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    disabled={isSubmitting}
                    placeholder="New York"
                    {...register("city")}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white transition-colors focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                      errors.city
                        ? "border-red-500 dark:border-red-500"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label htmlFor="postalCode" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Postal / Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    disabled={isSubmitting}
                    placeholder="10001"
                    {...register("postalCode")}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white transition-colors focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                      errors.postalCode
                        ? "border-red-500 dark:border-red-500"
                        : "border-zinc-200 dark:border-zinc-700"
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Payment Method */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    2. Payment Method
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Select how you wish to pay for your order
                  </p>
                </div>
              </div>

              {/* COD Choice Card */}
              <div className="relative flex items-center justify-between rounded-2xl border-2 border-emerald-600 bg-emerald-50/40 p-4 dark:bg-emerald-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Cash on Delivery (COD)
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Pay with cash upon package delivery at your specified shipping address.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Available
                </span>
              </div>
            </div>

            {/* Section 3: Order Items Review */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                      3. Order Items ({totalItemsCount})
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Review products in your checkout payload
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((item) => {
                  const primaryImage =
                    item.product.images && item.product.images.length > 0
                      ? item.product.images[0].url
                      : null;

                  return (
                    <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-400">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-bold text-zinc-900 line-clamp-1 dark:text-white">
                          {item.product.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          {item.variant && (
                            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              Option: {item.variant.name || "Default"}
                            </span>
                          )}
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span>${item.price.toFixed(2)} / item</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                          ${item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div>
            <div className="sticky top-24 space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Order Summary
              </h3>

              {/* Coupon Placeholder Code */}
              <div className="space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <label htmlFor="couponCode" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Promo Code / Coupon
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span>{appliedCoupon}</span>
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleRemoveCoupon}
                      className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 text-[11px] underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      id="couponCode"
                      type="text"
                      disabled={isSubmitting}
                      placeholder="Enter promo code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || isSubmitting}
                      className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-3 border-y border-zinc-100 py-4 text-xs dark:border-zinc-800">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal ({totalItemsCount} items)</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    ${totalAmountValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    FREE
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span className="font-bold">Calculated by Backend</span>
                  </div>
                )}
              </div>

              {/* Total Amount */}
              <div className="flex items-baseline justify-between text-base font-extrabold text-zinc-900 dark:text-white">
                <span>Total Due</span>
                <span className="text-2xl text-emerald-600 dark:text-emerald-400">
                  ${totalAmountValue.toFixed(2)}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:opacity-50"
                id="place-order-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order (COD)</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Guarantees */}
              <div className="space-y-2 rounded-2xl bg-zinc-50 p-4 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>100% Guaranteed Transaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" />
                  <span>Fast Express Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutFormContent />
      </Suspense>
    </ProtectedRoute>
  );
}
