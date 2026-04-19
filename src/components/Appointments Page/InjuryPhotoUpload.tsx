"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadIcon, XIcon, ImageIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react";

interface InjuryPhotoUploadProps {
    appointmentId?: string;
    onUploadComplete?: (reportId: string) => void;
}

export default function InjuryPhotoUpload({ appointmentId, onUploadComplete }: InjuryPhotoUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        if (!selectedFile.type.startsWith("image/")) {
            setUploadResult({ success: false, message: "Please select an image file." });
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
            setUploadResult({ success: false, message: "File too large. Maximum size is 5MB." });
            return;
        }
        setFile(selectedFile);
        setUploadResult(null);

        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append("image", file);
            if (description) formData.append("description", description);
            if (appointmentId) formData.append("appointmentId", appointmentId);

            const res = await fetch("/api/upload-injury-photo", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setUploadResult({ success: true, message: data.message || "Photo uploaded successfully!" });
                onUploadComplete?.(data.reportId);
                setFile(null);
                setPreview(null);
                setDescription("");
            } else {
                setUploadResult({ success: false, message: data.error || "Upload failed." });
            }
        } catch {
            setUploadResult({ success: false, message: "Network error. Please try again." });
        } finally {
            setUploading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setUploadResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Upload Injury Photo
                </h3>
                <p className="text-sm text-muted-foreground">
                    Upload a photo of your injury for the doctor to review before your appointment.
                </p>

                {/* Drop Zone */}
                {!preview && (
                    <div
                        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadIcon className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-1">
                            Drag & drop an image here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                            PNG, JPG, WEBP up to 5MB
                        </p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileSelect(f);
                    }}
                />

                {/* Preview */}
                {preview && (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Injury preview"
                            className="w-full max-h-64 object-contain rounded-lg border"
                        />
                        <button
                            onClick={clearFile}
                            className="absolute top-2 right-2 p-1 bg-background/80 rounded-full border hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Description */}
                {file && (
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your injury (optional)..."
                        className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                        rows={3}
                    />
                )}

                {/* Upload Button */}
                {file && (
                    <Button onClick={handleUpload} disabled={uploading} className="w-full">
                        {uploading ? (
                            <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                        ) : (
                            <><UploadIcon className="w-4 h-4 mr-2" />Upload Photo</>
                        )}
                    </Button>
                )}

                {/* Result Message */}
                {uploadResult && (
                    <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${uploadResult.success
                            ? "bg-green-500/10 text-green-600 border border-green-500/20"
                            : "bg-red-500/10 text-red-600 border border-red-500/20"
                        }`}>
                        {uploadResult.success && <CheckCircle2Icon className="w-4 h-4 shrink-0" />}
                        {uploadResult.message}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
