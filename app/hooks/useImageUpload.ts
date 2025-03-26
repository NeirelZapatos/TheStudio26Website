import { useState } from "react";

const useImageUpload = () => {

    const [files, setFiles] = useState<File[]>([]); // Array of files
    const [previewUrls, setPreviewUrls] = useState<string[]>([]); // Array of preview URLs

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFiles = Array.from(event.target.files); // Convert FileList to array

            // Generate preview URLs for the new files
            const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
            const newFileNames = selectedFiles.map((file) => file.name.replace(/\s+/g, "-"));

            // Check if only image is placeholder
            const placeholderOnly = 
                previewUrls.length === 1 &&
                previewUrls[0].includes("ProductPlaceholder");
            
            if (placeholderOnly) {
                setFiles([...selectedFiles]);
                setPreviewUrls([...newPreviewUrls]);
            } else {
                setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
                setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
            }

            return placeholderOnly ? 0 : previewUrls.length;
        }
        return -1;
    };

    const uploadImages = async (folder: string): Promise<string[]> => {
        if (!files.length) return []; // Return an empty array if no files are uploaded

        const uploadedImageUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("file", files[i]);
            formData.append("folder", folder); // Upload to folder
            try {
                const response = await fetch("/api/imageupload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Upload failed");
                }

                const data = await response.json();
                uploadedImageUrls.push(data.url); // Add the uploaded URL to the array
            } catch (error) {
                console.error("Error uploading image:", error);
                return []; // Return an empty array if an error occurs
            }
        }

        return uploadedImageUrls; // Return the array of uploaded URLs
    };

    const cleanupPreviewUrls = () => {
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };

    return {
        files,
        setFiles,
        previewUrls,
        setPreviewUrls,
        handleFileChange,
        uploadImages,
        cleanupPreviewUrls,
    };
}

export default useImageUpload;