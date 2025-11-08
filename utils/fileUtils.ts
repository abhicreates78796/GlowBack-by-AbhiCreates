
export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64] = result.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
      if (base64) {
        resolve({ base64, mimeType });
      } else {
        reject(new Error("Failed to parse base64 string from file."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}
