import vm from "node:vm";

const SUPPORTED_LANGUAGES = ["javascript"];

export const executeCode = async (req, res) => {
  try {
    const { language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({ msg: "Language and code are required" });
    }

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return res.status(400).json({
        success: false,
        error: `Language "${language}" is not supported. Only JavaScript is currently available.`,
      });
    }

    if (language === "javascript") {
      return executeJavaScript(code, res);
    }
  } catch (error) {
    console.error("Execute code error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

function executeJavaScript(code, res) {
  let output = "";
  let error = "";

  const sandbox = {
    console: {
      log: (...args) => {
        output += args.map(String).join(" ") + "\n";
      },
      error: (...args) => {
        error += args.map(String).join(" ") + "\n";
      },
      warn: (...args) => {
        output += args.map(String).join(" ") + "\n";
      },
    },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  };

  const context = vm.createContext(sandbox);

  try {
    const script = new vm.Script(code, { timeout: 5000 });
    script.runInContext(context, { timeout: 5000 });
  } catch (err) {
    error += err.toString();
  }

  if (error) {
    return res.status(200).json({ success: false, output: output.trim(), error: error.trim() });
  }

  return res.status(200).json({ success: true, output: output.trim() || "No output" });
}
