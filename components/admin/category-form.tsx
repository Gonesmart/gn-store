"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category";
import { createCategory, updateCategory } from "@/actions/categories";
import { CategoryImageUploader } from "@/components/admin/category-image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TopLevelCategory {
  id: string;
  name: string;
}

interface CategoryFormProps {
  topLevelCategories: TopLevelCategory[];
  initialData?: CategoryFormValues & { id: string };
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

function inputClass(hasError: boolean) {
  return cn(
    "mt-1 border-[#2A2A2A] bg-[#0D0D0D] text-white placeholder:text-[#4A4A4A] focus-visible:border-[#5DC600] focus-visible:ring-[#5DC600]/20",
    hasError && "border-red-500/50"
  );
}

export function CategoryForm({
  topLevelCategories,
  initialData,
  mode,
}: CategoryFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData ?? {
      name: "",
      slug: "",
      description: "",
      parentId: "",
      image: "",
      imagePublicId: "",
    },
  });

  const watchedImage = watch("image");
  const watchedPublicId = watch("imagePublicId");

  async function onSubmit(data: CategoryFormValues) {
    setServerError(null);
    const result =
      mode === "edit" && initialData
        ? await updateCategory(initialData.id, data)
        : await createCategory(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push("/admin/categories");
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
        {/* ── Left: main fields ── */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Section title="Category Details">
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-[#A3A3A3]">Name *</Label>
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
                  placeholder="e.g. Gadgets"
                  className={inputClass(!!errors.name)}
                />
                <FieldError message={errors.name?.message} />
              </div>

              <div>
                <Label className="text-[#A3A3A3]">Slug *</Label>
                <Input
                  {...register("slug", { onChange: () => setSlugTouched(true) })}
                  placeholder="gadgets"
                  className={inputClass(!!errors.slug)}
                />
                <FieldError message={errors.slug?.message} />
              </div>

              <div>
                <Label className="text-[#A3A3A3]">Description</Label>
                <Textarea
                  {...register("description")}
                  placeholder="Optional — describe this category for SEO and display"
                  rows={3}
                  className={cn(
                    "mt-1 resize-none border-[#2A2A2A] bg-[#0D0D0D] text-white placeholder:text-[#4A4A4A] focus-visible:border-[#5DC600] focus-visible:ring-[#5DC600]/20"
                  )}
                />
              </div>
            </div>
          </Section>

          {/* Category image */}
          <Section title="Category Image" description="Displayed on shop pages and category cards.">
            <Controller
              control={control}
              name="image"
              render={() => (
                <CategoryImageUploader
                  value={watchedImage ?? ""}
                  publicId={watchedPublicId ?? ""}
                  onChange={(url, pid) => {
                    setValue("image", url, { shouldValidate: true });
                    setValue("imagePublicId", pid, { shouldValidate: true });
                  }}
                />
              )}
            />
          </Section>
        </div>

        {/* ── Right: settings ── */}
        <div className="flex flex-col gap-5">
          <Section title="Parent Category">
            <Controller
              control={control}
              name="parentId"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                >
                  <SelectTrigger className="w-full border-[#2A2A2A] bg-[#0D0D0D] text-white">
                    <SelectValue placeholder="Top-level (no parent)" />
                  </SelectTrigger>
                  <SelectContent className="border-[#2A2A2A] bg-[#1A1A1A] text-white">
                    <SelectItem value="__none__" className="hover:bg-[#2A2A2A] text-[#A3A3A3]">
                      Top-level (no parent)
                    </SelectItem>
                    {topLevelCategories
                      .filter((c) => c.id !== initialData?.id)
                      .map((cat) => (
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
            <p className="mt-2 text-xs text-[#A3A3A3]">
              Leave empty for a top-level category. Select a parent to make this a subcategory.
            </p>
          </Section>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#5DC600] font-semibold text-black hover:bg-[#4DAF00] active:bg-[#3D9000]"
              style={{ boxShadow: "0 0 16px rgba(93,198,0,0.25)" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating…" : "Saving…"}
                </>
              ) : mode === "create" ? (
                "Create Category"
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
