"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/actions/products";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Category } from "@prisma/client";

interface ProductFormProps {
  categories: Category[];
  initialData?: ProductFormValues & { id: string };
  mode: "create" | "edit";
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  );
}

const defaultVariant = {
  size: "",
  color: "",
  price: 0,
  compareAtPrice: null,
  stock: null,
  sku: "",
};

function detectIsVariable(data?: ProductFormValues): boolean {
  if (!data) return false;
  if (data.variants.length > 1) return true;
  const v = data.variants[0];
  return !!(v?.size || v?.color);
}

export function ProductForm({ categories, initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [isVariable, setIsVariable] = useState(() => detectIsVariable(initialData));

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ?? {
      name: "",
      slug: "",
      description: "",
      categoryId: "",
      status: "DRAFT" as const,
      featured: false,
      variants: [{ ...defaultVariant }],
      images: [] as ProductFormValues["images"],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const watchedImages = watch("images");

  function handleVariableToggle(checked: boolean) {
    setIsVariable(checked);
    if (!checked) {
      // Switching to simple: collapse all variants down to the first one, clear size/color
      const first = fields[0];
      setValue("variants", [
        {
          id: first?.id,
          size: "",
          color: "",
          price: (watch(`variants.0.price`) as number) || 0,
          compareAtPrice: (watch(`variants.0.compareAtPrice`) as number | null) ?? null,
          stock: (watch(`variants.0.stock`) as number | null) ?? null,
          sku: (watch(`variants.0.sku`) as string) || "",
        },
      ]);
    }
  }

  async function onSubmit(data: ProductFormValues) {
    setServerError(null);
    const result =
      mode === "edit" && initialData
        ? await updateProduct(initialData.id, data)
        : await createProduct(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left column: main fields ── */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Basic info */}
          <Section title="Basic Information">
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-[#A3A3A3]">Product Name *</Label>
                <Input
                  {...register("name", {
                    onChange: (e) => {
                      if (!slugTouched) {
                        setValue("slug", slugify(e.target.value), {
                          shouldValidate: true,
                        });
                      }
                    },
                  })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className={inputClass(!!errors.name)}
                />
                <FieldError message={errors.name?.message} />
              </div>

              <div>
                <Label className="text-[#A3A3A3]">Slug *</Label>
                <Input
                  {...register("slug", {
                    onChange: () => setSlugTouched(true),
                  })}
                  placeholder="wireless-noise-cancelling-headphones"
                  className={inputClass(!!errors.slug)}
                />
                <FieldError message={errors.slug?.message} />
              </div>

              <div>
                <Label className="text-[#A3A3A3]">Description *</Label>
                <Textarea
                  {...register("description")}
                  placeholder="Describe the product in detail…"
                  rows={5}
                  className={cn(
                    "mt-1 resize-none border-[#2A2A2A] bg-[#0D0D0D] text-white placeholder:text-[#4A4A4A] focus-visible:border-[#5DC600] focus-visible:ring-[#5DC600]/20",
                    errors.description && "border-red-500/50"
                  )}
                />
                <FieldError message={errors.description?.message} />
              </div>
            </div>
          </Section>

          {/* Pricing & Stock */}
          <Section
            title={isVariable ? "Variants" : "Pricing & Stock"}
            description={
              isVariable
                ? "Each variant has its own price, stock, and optional size/color."
                : "Set the price and available stock for this product."
            }
          >
            {/* Variable toggle */}
            <div className="mb-5 flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">Variable product</p>
                <p className="text-xs text-[#A3A3A3]">
                  Enable to add multiple variants with different sizes, colors, or prices
                </p>
              </div>
              <Switch
                checked={isVariable}
                onCheckedChange={handleVariableToggle}
                className="data-[checked]:bg-[#5DC600]"
              />
            </div>

            {isVariable ? (
              /* ── Variable: full variants table ── */
              <div className="flex flex-col gap-3">
                <div className="hidden grid-cols-[1fr_1fr_100px_100px_80px_80px_32px] gap-2 text-xs font-medium text-[#A3A3A3] sm:grid">
                  <span>Size</span>
                  <span>Color</span>
                  <span>Price (₦)</span>
                  <span>Compare At</span>
                  <span>Stock</span>
                  <span>SKU</span>
                  <span />
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 gap-2 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] p-3 sm:grid-cols-[1fr_1fr_100px_100px_80px_80px_32px] sm:items-start sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0"
                  >
                    <div>
                      <label className="mb-1 block text-xs text-[#A3A3A3] sm:hidden">Size</label>
                      <Input
                        {...register(`variants.${index}.size`)}
                        placeholder="e.g. M, L, 42"
                        className={inputClass(false)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[#A3A3A3] sm:hidden">Color</label>
                      <Input
                        {...register(`variants.${index}.color`)}
                        placeholder="e.g. Black"
                        className={inputClass(false)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[#A3A3A3] sm:hidden">Price (₦)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`variants.${index}.price`, { valueAsNumber: true })}
                        placeholder="0.00"
                        className={inputClass(!!errors.variants?.[index]?.price)}
                      />
                      <FieldError message={errors.variants?.[index]?.price?.message} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[#A3A3A3] sm:hidden">Compare At</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`variants.${index}.compareAtPrice`, {
                          setValueAs: (v) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v)),
                        })}
                        placeholder="0.00"
                        className={inputClass(false)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[#A3A3A3] sm:hidden">Stock</label>
                      <Input
                        type="number"
                        min="0"
                        {...register(`variants.${index}.stock`, {
                          setValueAs: (v) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v)),
                        })}
                        placeholder="Leave blank if unlimited"
                        className={inputClass(!!errors.variants?.[index]?.stock)}
                      />
                      <FieldError message={errors.variants?.[index]?.stock?.message} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[#A3A3A3] sm:hidden">SKU</label>
                      <Input
                        {...register(`variants.${index}.sku`)}
                        placeholder="SKU-001"
                        className={inputClass(false)}
                      />
                    </div>
                    <div className="flex items-start pt-0 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => fields.length > 1 && remove(index)}
                        disabled={fields.length === 1}
                        className="flex h-9 w-8 items-center justify-center rounded text-[#A3A3A3] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Remove variant"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {errors.variants?.root && (
                  <FieldError message={errors.variants.root.message} />
                )}
                {errors.variants?.message && (
                  <FieldError message={errors.variants.message} />
                )}

                <button
                  type="button"
                  onClick={() => append({ ...defaultVariant })}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-[#2A2A2A] px-4 py-2.5 text-sm text-[#A3A3A3] transition-colors hover:border-[#5DC600]/40 hover:text-[#5DC600]"
                >
                  <Plus className="h-4 w-4" />
                  Add Variant
                </button>
              </div>
            ) : (
              /* ── Simple: flat price/stock fields ── */
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-[#A3A3A3]">Price (₦) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("variants.0.price", { valueAsNumber: true })}
                    placeholder="0.00"
                    className={inputClass(!!errors.variants?.[0]?.price)}
                  />
                  <FieldError message={errors.variants?.[0]?.price?.message} />
                </div>
                <div>
                  <Label className="text-[#A3A3A3]">Compare At Price (₦) <span className="text-[#555]">- optional</span></Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("variants.0.compareAtPrice", {
                      setValueAs: (v) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v)),
                    })}
                    placeholder="Leave blank if no discount"
                    className={inputClass(false)}
                  />
                </div>
                <div>
                  <Label className="text-[#A3A3A3]">Stock Quantity <span className="text-[#555]">- optional</span></Label>
                  <Input
                    type="number"
                    min="0"
                    {...register("variants.0.stock", {
                      setValueAs: (v) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v)),
                    })}
                    placeholder="Leave blank if unlimited"
                    className={inputClass(!!errors.variants?.[0]?.stock)}
                  />
                  <FieldError message={errors.variants?.[0]?.stock?.message} />
                </div>
                <div>
                  <Label className="text-[#A3A3A3]">SKU</Label>
                  <Input
                    {...register("variants.0.sku")}
                    placeholder="SKU-001"
                    className={inputClass(false)}
                  />
                </div>
              </div>
            )}
          </Section>

          {/* Images */}
          <Section title="Product Images" description="First image is the main display image.">
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUploader
                  images={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Section>
        </div>

        {/* ── Right column: settings ── */}
        <div className="flex flex-col gap-5">
          <Section title="Status & Visibility">
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-[#A3A3A3]">Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        className={cn(
                          "mt-1 w-full border-[#2A2A2A] bg-[#0D0D0D] text-white",
                          errors.status && "border-red-500/50"
                        )}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="border-[#2A2A2A] bg-[#1A1A1A] text-white">
                        <SelectItem value="DRAFT" className="hover:bg-[#2A2A2A]">
                          Draft
                        </SelectItem>
                        <SelectItem value="ACTIVE" className="hover:bg-[#2A2A2A]">
                          Active
                        </SelectItem>
                        <SelectItem value="ARCHIVED" className="hover:bg-[#2A2A2A]">
                          Archived
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.status?.message} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">Featured</p>
                  <p className="text-xs text-[#A3A3A3]">
                    Show on homepage hero section
                  </p>
                </div>
                <Controller
                  control={control}
                  name="featured"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[checked]:bg-[#5DC600]"
                    />
                  )}
                />
              </div>
            </div>
          </Section>

          <Section title="Category">
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full border-[#2A2A2A] bg-[#0D0D0D] text-white",
                      errors.categoryId && "border-red-500/50"
                    )}
                  >
                    <span className="flex flex-1 truncate text-left text-sm">
                      {field.value
                        ? (categories.find((c) => c.id === field.value)?.name ?? "Select a category")
                        : <span className="text-[#4A4A4A]">Select a category</span>}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="border-[#2A2A2A] bg-[#1A1A1A] text-white">
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                        className="hover:bg-[#2A2A2A]"
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.categoryId?.message} />
            {categories.length === 0 && (
              <p className="mt-2 text-xs text-yellow-400">
                No categories yet.{" "}
                <a
                  href="/admin/categories"
                  className="underline hover:text-yellow-300"
                >
                  Create one first →
                </a>
              </p>
            )}
          </Section>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#5DC600] font-semibold text-black hover:bg-[#4DAF00] active:bg-[#3D9000]"
              style={{
                boxShadow: "0 0 16px rgba(93,198,0,0.25)",
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating…" : "Saving…"}
                </>
              ) : mode === "create" ? (
                "Create Product"
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-[#2A2A2A] bg-transparent text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-white"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-5"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-[#A3A3A3]">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "mt-1 border-[#2A2A2A] bg-[#0D0D0D] text-white placeholder:text-[#4A4A4A] focus-visible:border-[#5DC600] focus-visible:ring-[#5DC600]/20",
    hasError && "border-red-500/50"
  );
}
