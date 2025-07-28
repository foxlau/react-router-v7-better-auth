import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { formatBytes } from "~/hooks/use-file-upload";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from "~/lib/validations/settings";
import { Spinner } from "./spinner";

export function AvatarSelector({
  avatarUrl,
  placeholderUrl,
}: {
  avatarUrl: string | null;
  placeholderUrl: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher();
  const isUploading = fetcher.state !== "idle";

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size must be less than ${formatBytes(MAX_FILE_SIZE)}.`);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only .jpg, .jpeg, .png and .webp formats are supported.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("intent", "set-avatar");
    fetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
  };

  const handleDeleteAvatar = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    fetcher.submit({ intent: "delete-avatar" }, { method: "post" });
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="relative flex size-24 overflow-hidden rounded-full bg-muted">
      <img
        src={previewUrl || placeholderUrl}
        alt="Current avatar"
        className="size-full object-cover"
      />

      <input
        tabIndex={-1}
        name="image"
        type="file"
        className="sr-only"
        accept={ACCEPTED_IMAGE_TYPES.join(", ")}
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {isUploading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-black/50 p-2 text-white backdrop-blur-md">
            <Spinner className="size-4" />
          </span>
        </div>
      ) : (
        <div className="absolute inset-0">
          <div className="grid size-full overflow-clip rounded-full bg-black/50 opacity-0 backdrop-blur-md transition-opacity duration-300 ease-out hover:opacity-100">
            {previewUrl ? (
              <>
                <button
                  type="button"
                  aria-label="Change avatar"
                  className="grid font-medium text-white/60 text-xs hover:bg-black/10 hover:text-white"
                  onClick={triggerFileInput}
                >
                  <span className="mb-3 self-end">Change</span>
                </button>
                <button
                  type="button"
                  aria-label="Delete avatar"
                  className="grid font-medium text-white/60 text-xs hover:bg-black/10 hover:text-white"
                  onClick={handleDeleteAvatar}
                >
                  <span className="mt-3 self-start">Delete</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                aria-label="Add avatar"
                className="font-medium text-white/60 text-xs hover:bg-black/20 hover:text-white"
                onClick={triggerFileInput}
              >
                Add avatar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
