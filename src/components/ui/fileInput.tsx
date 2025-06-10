import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onImageChange?: (file: File | null) => void;
  previewUrl?: string;
  className?: string;
  buttonText?: string;
}

export function FileInput({
  className,
  onImageChange,
  previewUrl,
  buttonText = "Seleccionar imagen",
  ...props
}: FileInputProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
   
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageChange?.(file);
    }
  };
  console.log("previewUrl", previewUrl);
  const handleClearImage = () => {
    
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
        console.log("Image cleared");
    onImageChange?.(null);

  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)} onClick={()=>{console.log("preview", preview)}}>
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          onClick={triggerFileInput}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {buttonText}
        </Button>
        {preview !== "../../../../public/Images/default-no-image.png" && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleClearImage}
            className="text-destructive hover:text-destructive/90"
          >
            <X className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        )}
      </div>
      
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        {...props}
      />
      
      {preview && (
        <div 
          className="relative mt-2 rounded-md overflow-hidden border border-input cursor-pointer"
          onClick={triggerFileInput}
        >
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
        </div>
      )}
    </div>
  );
}