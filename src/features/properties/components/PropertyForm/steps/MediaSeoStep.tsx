"use client";

import React from "react";
import { Upload, Plus, Trash } from "lucide-react";
import { FormField, TextInput, TextArea, Button } from "@/components/ui";
import type { FormState, SetFormField } from "../types";

type MediaSeoStepProps = {
  form: FormState;
  set: SetFormField;
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
}: MediaSeoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-lg font-serif font-black text-indigo">Media & SEO</h2>
        <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
          Manage listing images and configure search engine results representation.
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
              PNG, JPG, WebP, GIF ┬╖ max 5MB each ┬╖ or paste a URL below
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

        {form.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {form.images.map((img, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl overflow-hidden bg-sand/35 border border-indigo/5 relative group shadow-sm"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-rose-600/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150 cursor-pointer"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4 pt-4 border-t border-sand/40">
          <p className="text-[10px] font-black text-indigo/60 uppercase tracking-widest">
            Search Engine Optimization (SEO)
          </p>

          <div className="grid grid-cols-1 gap-4">
            <FormField label="SEO Title (Optional)">
              <TextInput
                value={form.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                placeholder={form.title || "Auto-filled from property title"}
              />
            </FormField>

            <FormField label="SEO Description (Optional)">
              <TextArea
                value={form.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                rows={3}
                placeholder="Max 160 chars for search engines..."
                maxLength={160}
              />
            </FormField>
          </div>

          <div className="bg-white border border-sand/60 rounded-3xl p-5 shadow-sm space-y-1.5">
            <p className="text-[9px] font-black text-indigo/60 uppercase tracking-widest mb-1.5">
              Google Snippet Preview
            </p>
            <p className="text-blue-700 hover:underline text-sm font-serif font-black truncate max-w-full">
              {form.seoTitle || form.title || "Untitled Property - SqftGo"}
            </p>
            <p className="text-emerald-700 text-xs font-semibold truncate leading-none">
              https://sqftgo.com/property/
              {form.title ? form.title.toLowerCase().replace(/\s+/g, "-") : "id"}
            </p>
            <p className="text-charcoal/70 text-xs line-clamp-2 leading-relaxed">
              {form.seoDescription ||
                form.description ||
                "Browse this premium property listing on SqftGo."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
