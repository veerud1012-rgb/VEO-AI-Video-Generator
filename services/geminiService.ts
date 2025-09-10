// Fix: Changed GenerateVideosOperationResponse to GenerateVideosOperation as it is the correct type.
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";

const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [mimeTypePart, base64Part] = result.split(';base64,');
            const mimeType = mimeTypePart.split(':')[1];
            resolve({ base64: base64Part, mimeType });
        };
        reader.onerror = error => reject(error);
    });
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const LOADING_MESSAGES = [
    "AI is dreaming up your video...",
    "Composing the visual narrative...",
    "Rendering high-fidelity frames...",
    "This can take a few minutes, please stay tuned...",
    "Almost there, adding the final touches...",
    "Polishing the pixels...",
    "Orchestrating the sequence..."
];

export const generateVideo = async (
    prompt: string,
    imageFile: File | null,
    aspectRatio: string,
    onProgress: (message: string) => void
): Promise<Blob> => {
    try {
        onProgress("Preparing your request...");

        let imagePayload = null;
        if (imageFile) {
            const { base64, mimeType } = await fileToBase64(imageFile);
            imagePayload = {
                imageBytes: base64,
                mimeType: mimeType,
            };
        }

        const fullPrompt = `${prompt} (This video should be a high quality, realistic 10 second video with an aspect ratio of ${aspectRatio})`;

        onProgress("Sending request to Google VEO...");
        // Fix: Changed GenerateVideosOperationResponse to GenerateVideosOperation as it is the correct type.
        const initialOperation: GenerateVideosOperation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: fullPrompt,
            ...(imagePayload && { image: imagePayload }),
            config: {
                numberOfVideos: 1
            }
        });

        let operation = initialOperation;
        let progressCounter = 0;

        while (!operation.done) {
            onProgress(LOADING_MESSAGES[progressCounter % LOADING_MESSAGES.length]);
            progressCounter++;
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        if (operation.error) {
            throw new Error(`Video generation failed: ${operation.error.message}`);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        onProgress("Video generated! Downloading...");
        
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            const errorText = await videoResponse.text();
            throw new Error(`Failed to download video: ${videoResponse.statusText}. Details: ${errorText}`);
        }

        const videoBlob = await videoResponse.blob();
        
        onProgress("Done!");
        return videoBlob;

    } catch (error) {
        console.error("Error in generateVideo service:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred during video generation.");
    }
};