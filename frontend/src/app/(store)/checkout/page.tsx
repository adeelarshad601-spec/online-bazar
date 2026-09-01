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
  Plus,
  Lock,
  Check,
} from "lucide-react";

function CheckoutStepper({ currentStep = 2 }: { currentStep?: number }) {
  const steps = [
    { id: 1, name: "Cart", status: "completed" },
    { id: 2, name: "Shipping & Address", status: currentStep >= 2 ? "active" : "pending" },
    { id: 3, name: "Payment & Review", status: currentStep >= 3 ? "active" : "pending" },
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

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "STRIPE">("COD");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

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
    setValue,
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

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const onSubmit = async (data: ShippingAddressInput) => {
    if (isSubmitting) return;

    executeCheckout({
      shippingAddress: data,
      paymentMethod: paymentMethod === "STRIPE" ? "STRIPE" : "COD",
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
            Checkout
          </h1>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Complete your shipping address and payment details to place your order
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
            <div className="rounded-3xl bg-[#f6f7f9] p-6 shadow-xs dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                    1. Shipping Address
                  </h2>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Where should we deliver your order?
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
                    className={`w-full rounded-2xl border px-4 py-3 text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60 ${
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
                    className={`w-full rounded-2xl border px-4 py-3 text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60 ${
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
                    className={`w-full rounded-2xl border px-4 py-3 text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60 ${
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
                    className={`w-full rounded-2xl border px-4 py-3 text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60 ${
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
                    className={`w-full rounded-2xl border px-4 py-3 text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60 ${
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
                    className={`w-full rounded-2xl border px-4 py-3 text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60 ${
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

            {/* Section 2: Payment Method (COD vs Stripe / Card) */}
            <div className="rounded-3xl bg-[#f6f7f9] p-6 shadow-xs dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                      2. Payment Method
                    </h2>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Select how you wish to pay for your order
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Lock className="h-3.5 w-3.5" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              {/* Payment Options Grid */}
              <div className="space-y-4">
                {/* Option 1: Cash on Delivery (COD) */}
                <label
                  onClick={() => setPaymentMethod("COD")}
                  className={`relative flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-all border-2 ${
                    paymentMethod === "COD"
                      ? "border-emerald-600 bg-white dark:bg-zinc-800 shadow-md"
                      : "border-zinc-200 bg-white/50 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethodSelect"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                        Cash on Delivery (COD)
                      </h3>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Pay with cash upon package delivery at your specified doorstep address.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Available
                  </span>
                </label>

                {/* Option 2: Credit / Debit Card (Stripe Payment) */}
                <label
                  onClick={() => setPaymentMethod("STRIPE")}
                  className={`relative flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-all border-2 ${
                    paymentMethod === "STRIPE"
                      ? "border-emerald-600 bg-white dark:bg-zinc-800 shadow-md"
                      : "border-zinc-200 bg-white/50 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethodSelect"
                      checked={paymentMethod === "STRIPE"}
                      onChange={() => setPaymentMethod("STRIPE")}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                          Credit / Debit Card (Stripe)
                        </h3>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-extrabold uppercase text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          Instant
                        </span>
                      </div>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Pay securely with Visa, Mastercard, American Express, or Discover.
                      </p>
                    </div>
                  </div>

                  {/* Card Brand Logos */}
                  <div className="flex items-center gap-1">
                    <span className="rounded bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                      VISA
                    </span>
                    <span className="rounded bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                      MC
                    </span>
                    <span className="rounded bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                      AMEX
                    </span>
                  </div>
                </label>

                {/* Professional Card Form Fields (Shown when Stripe/Card Selected) */}
                {paymentMethod === "STRIPE" && (
                  <div className="rounded-2xl border border-emerald-200 bg-white p-5 space-y-4 dark:border-emerald-900/50 dark:bg-zinc-800/90 shadow-inner">
                    <div className="flex items-center justify-between text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                      <span>Card Information</span>
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Lock className="h-3.5 w-3.5" />
                        <span className="text-[10px]">Stripe Secure Checkout</span>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Card Number
                      </label>
                      <div className="relative flex items-center">
                        <CreditCard className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4532 •••• •••• 8892"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs font-mono font-bold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Expiry */}
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Expires (MM/YY)
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-mono font-bold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                        />
                      </div>

                      {/* CVC */}
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-mono font-bold text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="Name on card"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Order Items Review */}
            <div className="rounded-3xl bg-[#f6f7f9] p-6 shadow-xs dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                      3. Order Items ({totalItemsCount})
                    </h2>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Review products in your checkout payload
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                {items.map((item) => {
                  const primaryImage =
                    item.product.images && item.product.images.length > 0
                      ? item.product.images[0].url
                      : null;

                  return (
                    <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white p-1.5 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 flex items-center justify-center">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={item.product.title}
                            fill
                            className="object-contain"
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
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {item.variant && (
                            <span className="rounded-full bg-zinc-200/60 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
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

          {/* Right Column: Payment Summary Sidebar (Matching Image 2 Reference UI) */}
          <div>
            <div className="sticky top-24 space-y-6 rounded-3xl bg-[#f6f7f9] p-6 shadow-xs dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                Payment Summary
              </h3>

              {/* Payment Method Quick Selector (Image 2 style) */}
              <div className="space-y-2 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Payment Method
                </label>
                <div className="space-y-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <label
                    onClick={() => setPaymentMethod("COD")}
                    className="flex cursor-pointer items-center gap-2.5"
                  >
                    <input
                      type="radio"
                      name="summaryPaymentRadio"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>COD (Cash on Delivery)</span>
                  </label>
                  <label
                    onClick={() => setPaymentMethod("STRIPE")}
                    className="flex cursor-pointer items-center gap-2.5"
                  >
                    <input
                      type="radio"
                      name="summaryPaymentRadio"
                      checked={paymentMethod === "STRIPE"}
                      onChange={() => setPaymentMethod("STRIPE")}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Stripe Payment</span>
                  </label>
                </div>
              </div>

              {/* Address Quick Selector */}
              <div className="space-y-2 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Address
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("address", "");
                      setValue("city", "");
                      setValue("postalCode", "");
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    <span>Add Address</span>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <select
                  className="w-full cursor-pointer rounded-2xl border border-zinc-200 bg-white py-2.5 px-3 text-xs font-medium text-zinc-800 shadow-xs focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  onChange={(e) => {
                    if (e.target.value === "default") {
                      setValue("address", "123 Main Street");
                      setValue("city", "New York");
                      setValue("postalCode", "10001");
                      setValue("country", "United States");
                    }
                  }}
                >
                  <option value="default">Default Address (New York)</option>
                  <option value="custom">Enter Custom Address Below</option>
                </select>
              </div>

              {/* Coupon / Promo Code Input */}
              <div className="space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-100/70 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span>{appliedCoupon}</span>
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleRemoveCoupon}
                      className="text-emerald-700 underline text-[11px] hover:text-emerald-900"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="Coupon Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-medium text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || isSubmitting}
                      className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-3 border-y border-zinc-200/80 py-4 text-xs font-medium dark:border-zinc-800">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    ${totalAmountValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Shipping:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Free
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span>-$20.00</span>
                  </div>
                )}
              </div>

              {/* Total Due */}
              <div className="flex items-baseline justify-between text-base font-extrabold text-zinc-900 dark:text-white">
                <span>Total:</span>
                <span className="text-2xl text-emerald-600 dark:text-emerald-400">
                  ${(totalAmountValue - (appliedCoupon ? 20 : 0)).toFixed(2)}
                </span>
              </div>

              {/* Submit / Place Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:opacity-50"
                id="place-order-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order ({paymentMethod === "STRIPE" ? "Stripe" : "COD"})</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Guarantees */}
              <div className="space-y-2 rounded-2xl bg-white p-4 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 shadow-xs">
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
