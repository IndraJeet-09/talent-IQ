const PISTON_API = process.env.PISTON_API_URL || "http://localhost:2000";

const LANGUAGE_VERSIONS = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
};

const EXTENSIONS = {
  javascript: "js",
  python: "py",
  java: "java",
};

export const executeCode = async (req, res) => {
  try {
    const { language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({ msg: "Language and code are required" });
    }

    const languageConfig = LANGUAGE_VERSIONS[language];
    if (!languageConfig) {
      return res.status(400).json({ msg: `Unsupported language: ${language}` });
    }

    const response = await fetch(`${PISTON_API}/api/v2/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: languageConfig.language,
        version: languageConfig.version,
        files: [
          {
            name: `main.${EXTENSIONS[language] || "txt"}`,
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ msg: "Execution failed", error: errorText });
    }

    const data = await response.json();
    const output = data.run?.stdout || "";
    const stderr = data.run?.stderr || "";

    if (stderr) {
      return res.status(200).json({ success: false, output, error: stderr });
    }

    return res.status(200).json({ success: true, output: output || "No output" });
  } catch (error) {
    console.error("Execute code error:", error);
    return res.status(500).json({ msg: "Code execution service unavailable", error: error.message });
  }
};
