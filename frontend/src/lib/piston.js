import axiosInstance from "./axios.js";

/**
 * @param {string} language - programming language
 * @param {string} code - source code to execute
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    const res = await axiosInstance.post("/execute", { language, code });
    return res.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.msg || error.message,
    };
  }
}
