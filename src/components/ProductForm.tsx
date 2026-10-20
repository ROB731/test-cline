"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { createProduct, updateProduct, type ProductState } from "@/lib/actions/products";
import { Icon } from "@/components/icons";

type ProductInput = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  category: string | null;
  stock: number;
  active: boolean;
};

const initial: ProductState = {};

export function ProductForm({ product }: { product?: ProductInput }) {
  const isEdit = Boolean(product);
  const [state, action, pending] = useActionState(isEdit ? updateProduct : createProduct, initial);

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(undefined);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body });
        const json = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !json.url) {
          setUploadError(json.error || "Échec de l'envoi de la photo.");
          continue;
        }
        setImages((current) => (current.length >= 6 ? current : [...current, json.url as string]));
      }
    } catch {
      setUploadError("Connexion interrompue. Réessaie.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addUrl() {
    const value = urlInput.trim();
    if (!value || images.length >= 6) return;
    setImages((current) => [...current, value]);
    setUrlInput("");
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  function makeMain(index: number) {
    setImages((current) => {
      const copy = [...current];
      const [picked] = copy.splice(index, 1);
      return [picked, ...copy];
    });
  }

  return (
    <form action={action} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {state.error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="card space-y-4 p-5">
          <div>
            <label className="label" htmlFor="name">Nom du produit *</label>
            <input
              className="input"
              id="name"
              name="name"
              defaultValue={product?.name}
              placeholder="Ensemble wax « Abidjan »"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="price">Prix (FCFA) *</label>
              <input
                className="input"
                id="price"
                name="price"
                inputMode="numeric"
                defaultValue={product?.price}
                placeholder="15 000"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="compareAtPrice">Ancien prix</label>
              <input
                className="input"
                id="compareAtPrice"
                name="compareAtPrice"
                inputMode="numeric"
                defaultValue={product?.compareAtPrice ?? ""}
                placeholder="Optionnel"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="stock">Stock disponible</label>
              <input
                className="input"
                id="stock"
                name="stock"
                inputMode="numeric"
                defaultValue={product ? product.stock : 1}
                placeholder="1"
              />
            </div>
            <div>
              <label className="label" htmlFor="category">Catégorie</label>
              <input
                className="input"
                id="category"
                name="category"
                defaultValue={product?.category ?? ""}
                placeholder="Robes, Sacs…"
                list="categories"
              />
              <datalist id="categories">
                <option value="Vêtements" />
                <option value="Sacs & accessoires" />
                <option value="Beauté" />
                <option value="Chaussures" />
                <option value="Maison" />
                <option value="Alimentation" />
              </datalist>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              className="input min-h-28 resize-y"
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
              placeholder="Matière, tailles disponibles, couleurs, délai de livraison…"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3">
            <input
              type="checkbox"
              name="active"
              defaultChecked={product ? product.active : true}
              className="h-4 w-4 accent-brand-700"
            />
            <span className="text-sm">
              <span className="font-semibold">Visible dans la vitrine</span>
              <span className="block text-xs text-muted">
                Décoche pour masquer temporairement (rupture, vacances…).
              </span>
            </span>
          </label>
        </div>

        <div className="card space-y-4 p-5">
          <div>
            <p className="label">Photos du produit *</p>
            <p className="text-xs text-muted">
              Jusqu&apos;à 6 photos. La première est la photo principale. 5 Mo max par photo.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {images.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-paper"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded-full bg-brand-700 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    Principale
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/45 p-1 opacity-0 transition group-hover:opacity-100">
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => makeMain(index)}
                      className="rounded p-0.5 text-white"
                      title="Définir comme photo principale"
                    >
                      <Icon name="star" className="h-3 w-3" filled />
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="rounded p-0.5 text-white"
                    title="Supprimer"
                  >
                    <Icon name="close" className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}

            {images.length < 6 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-paper text-muted transition hover:border-brand-400 hover:text-brand-700"
              >
                <Icon name="plus" className="h-5 w-5" />
                <span className="mt-1 text-[10px] font-semibold">
                  {uploading ? "Envoi…" : "Ajouter"}
                </span>
              </button>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />

          {uploadError && <p className="text-xs font-medium text-rose-700">{uploadError}</p>}

          <div className="flex gap-2">
            <input
              className="input text-xs"
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              placeholder="…ou colle un lien d'image"
            />
            <button type="button" onClick={addUrl} className="btn btn-outline px-3 py-2 text-xs">
              Ajouter
            </button>
          </div>

          <div className="flex gap-2.5 rounded-lg border border-line bg-paper px-3 py-2.5">
            <Icon name="camera" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
            <p className="text-[11px] leading-relaxed text-muted">
              Photographiez près d&apos;une fenêtre, sur un fond uni : la matière et la couleur
              ressortent nettement mieux.
            </p>
          </div>
        </div>
      </div>


      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending || uploading}>
          {pending
            ? "Enregistrement…"
            : isEdit
              ? "Enregistrer les modifications"
              : "Publier le produit"}
        </button>
        <Link href="/tableau-de-bord/produits" className="btn btn-outline">
          Annuler
        </Link>
      </div>
    </form>
  );
}
