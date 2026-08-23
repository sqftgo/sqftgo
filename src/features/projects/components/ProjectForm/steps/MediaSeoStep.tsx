"use client";

import React from "react";
import { Upload, Plus, Trash } from "lucide-react";
import { FormField, TextInput, TextArea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { ProjectFormValues, SetProjectField } from "../types";

type Props = {
  form: ProjectFormValues;
  set: SetProjectField;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  uploadError: string | null;
  newImageUrl: string;
  setNewImageUrl: (url: string) => void;
  handleFileUpload: (files: FileList | null) => void;
  addImageUrl: (url: string) => void;
  removeImage: (index: number) => void;
};

export function MediaSeoStep({
  form,
  set,
  fileInputRef,
  uploading,
  uploadError,
  newImageUrl,
  setNewImageUrl,
  handleFileUpload,
  addImageUrl,
  removeImage,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-lg font-serif font-black text-indigo">Media & SEO</h2>
        <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
          Upload project photos and optional search metadata.
        </p>
      </div>

      <div className="space-y-5 text-left">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => void handleFileUpload(e.target.files)}
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!uploading) fileInputRef.current?.click();
            }
          }}
          className="bg-sand/15 border border-dashed border-indigo/20 rounded-3xl p-6 text-center space-y-3 cursor-pointer hover:border-terracotta/40 transition-colors"
        >
          <Upload className="w-10 h-10 text-indigo/35 mx-auto" />
          <div>
            <p className="text-charcoal/60 text-xs font-bold">
              {uploading ? "Uploading..." : "Click to upload images"}
            </p>
            <p className="text-charcoal/40 text-[10px] font-semibold mt-0.5">
              PNG, JPG, WebP, GIF · max 5MB each · or paste a URL below
            </p>
          </div>
        </div>

        {uploadError ? (
          <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {uploadError}
          </p>
        ) : null}

        <div className="flex gap-2">
          <TextInput
            type="text"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Add image URL (optional fallback)"
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addImageUrl(newImageUrl)}
            className="shrink-0"
          >
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>

        {form.images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {form.images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative rounded-2xl overflow-hidden border border-indigo/10 aspect-[4/3] bg-sand/20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-charcoal/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <FormField label="SEO Title">
          <TextInput
            value={form.seoTitle ?? ""}
            onChange={(e) => set("seoTitle", e.target.value || undefined)}
            placeholder={form.title || "Project title for search"}
          />
        </FormField>

        <FormField label="SEO Description">
          <TextArea
            value={form.seoDescription ?? ""}
            onChange={(e) => set("seoDescription", e.target.value || undefined)}
            rows={3}
            placeholder="Short description for search results"
          />
        </FormField>

        <div className="bg-white border border-sand/65 rounded-3xl p-5 shadow-sm space-y-1.5">
          <p className="text-[9px] font-black text-indigo/60 uppercase tracking-widest mb-1.5">
            Google Snippet Preview
          </p>
          <p className="text-blue-700 hover:underline text-sm font-serif font-black truncate max-w-full leading-none">
            {form.seoTitle || form.title || "Untitled Project - SqftGo"}
          </p>
          <p className="text-emerald-700 text-xs font-semibold truncate leading-none">
            https://sqftgo.com/projects/
            {form.title ? form.title.toLowerCase().replace(/\s+/g, "-") : "id"}
          </p>
          <p className="text-charcoal/70 text-xs line-clamp-2 leading-relaxed">
            {form.seoDescription ||
              form.description ||
              "Browse this premium project listing on SqftGo."}
          </p>
        </div>
      </div>
    </div>
  );
}
