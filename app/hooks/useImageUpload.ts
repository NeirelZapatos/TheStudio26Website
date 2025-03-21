import { set } from "mongoose";
import { useState } from "react";

const useImageUpload = () => {

    const [files, setFiles] = useState<File[]>([]); // Array of files
    const [previewUrls, setPreviewUrls] = useState<string[]>([]); // Array of preview URLs
    const [editableFileNames, setEditableFileNames] = useState<string[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFiles = Array.from(event.target.files); // Convert FileList to array
            const newFiles = [...files, ...selectedFiles]; // Add new files to existing files

            // Generate preview URLs for the new files
            const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
            const newFileNames = selectedFiles.map((file) => file.name.replace(/\s+/g, "-"));

            // Update state
            setFiles(newFiles);
            setPreviewUrls([...previewUrls, ...newPreviewUrls]);
            setEditableFileNames([...editableFileNames, ...newFileNames]);
        }
    };

    const handleFileNameChange = (index: number, newName: string) => {
        const updatedFileNames = [...editableFileNames];
        updatedFileNames[index] = newName;
        setEditableFileNames(updatedFileNames);
    };

    const uploadImages = async (folder: string): Promise<string[]> => {
        if (!files.length) return []; // Return an empty array if no files are uploaded

        const uploadedImageUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("file", files[i]);
            formData.append("fileName", editableFileNames[i]); // Use the editable file name
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
        editableFileNames,
        setEditableFileNames,
        handleFileChange,
        handleFileNameChange,
        uploadImages,
        cleanupPreviewUrls,
    };
}

export default useImageUpload;