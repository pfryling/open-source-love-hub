
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onChange: (url: string | null) => void;
  value?: string | null;
  label?: string;
}

const ImageUpload = ({ onChange, value, label = "Project Image" }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `project-images/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("projects")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("projects")
        .getPublicUrl(filePath);

      onChange(publicUrlData.publicUrl);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload" className="text-base">
        {label}
      </Label>
      {value ? (
        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border border-gray-200">
          <img
            src={value}
            alt="Project image"
            className="h-full w-full object-cover"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute right-2 top-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed border-gray-300 p-6">
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">
              Drag and drop an image, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Recommended: 1200 x 630px (16:9). Max 5MB.
            </p>
          </div>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
          />
          <Label htmlFor="image-upload" className="cursor-pointer">
            <Button
              variant="outline"
              type="button"
              disabled={isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </Label>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
