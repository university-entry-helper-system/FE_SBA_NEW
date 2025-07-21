import axios from "../api/axios";

export async function downloadPdfFile(url: string, filename: string) {
  try {
    const response = await axios.get(url, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    throw error;
  }
} 