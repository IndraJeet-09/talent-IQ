import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router"
import { PROBLEMS } from "../data/problems.js";
import Navbar from "../components/Navbar";
import { executeCode } from "../lib/piston.js"

import { Group, Panel, Separator } from "react-resizable-panels";

import ProblemDescription from "../components/ProblemDescription.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import OutputPanel from "../components/OutputPanel.jsx";
import toast from "react-hot-toast"
import confetti from "canvas-confetti"

function ProblemPage() {

    const { id } = useParams();
    const navigate = useNavigate()

    const [currentProbId, setCurrentProbId] = useState("two-sum")
    const [selectedLang, setSelectedLang] = useState("javascript")
    const [code, setCode] = useState(PROBLEMS[currentProbId].starterCode.javascript)
    const [output, setOutput] = useState(null)
    const [isRunning, setIsRunning] = useState(false)

    const currentProblem = PROBLEMS[currentProbId]

    // update problem when URL param changes
    useEffect(() => {
        if (id && PROBLEMS[id]) {
            setCurrentProbId(id)
            setCode(PROBLEMS[id].starterCode[selectedLang])
            setOutput(null)
        }
    }, [id, selectedLang])

    const handleLangChange = (e) => {
        const newLang = e.target.value
        setSelectedLang(newLang)
        setCode(currentProblem.starterCode[newLang])
        setOutput(null)
    }
    const handleProbChange = (newProblemId) => navigate(`/problem/${newProblemId}`)

    const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.2, y: 0.6 },
    });

    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.8, y: 0.6 },
    });
  };

    const normalizeOutput = (output) => {
    // normalize output for comparison (trim whitespace, handle different spacing)
    return output
        .trim()
        .split("\n")
        .map((line) =>
            line
                .trim()
                // remove spaces after [ and before ]
                .replace(/\[\s+/g, "[")
                .replace(/\s+\]/g, "]")
                // normalize spaces around commas to single space after comma
                .replace(/\s*,\s*/g, ",")
        )
        .filter((line) => line.length > 0)
        .join("\n");
    }

    const checkIfTestsPassed = (actualOutput, expectedOutput) => {
        const normalizedActual = normalizeOutput(actualOutput)
        const normalizedExpected = normalizeOutput(expectedOutput)

        return normalizedActual == normalizedExpected;
    }

    const handleRunCode = async () => {
        setIsRunning(true)
        setOutput(null)

        const result = await executeCode(selectedLang, code)
        setOutput(result)
        setIsRunning(false)

        //check if code executed successfully
        if (result.success) {
            const expectedOutput = currentProblem.expectedOutput[selectedLang]
            const testsPassed = checkIfTestsPassed(result.output, expectedOutput)

            if (testsPassed) {
                triggerConfetti();
                toast.success("All tests passed! Great job!")
            } else {
                toast.error("Tests failed. Check your output!")
            }
        }else{
            toast.error("Code execution failed!")
        }

    }


    return (
        <div className="h-screen bg-base-100 flex flex-col">
            <Navbar />

            <div className="flex-1 h-full">
                <Group orientation="horizontal" className="h-full">
                    {/* LEFT PANEL-PROBLEM DESC */}
                    <Panel defaultSize={40} minSize={30} className="h-full">
                        <ProblemDescription
                            problem={currentProblem}
                            currentProbId={currentProbId}
                            onProblemChange={handleProbChange}
                            allProblems={Object.values(PROBLEMS)}
                        />
                    </Panel>

                    <Separator className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

                    {/* RIGHT PANEL-CODE EDITOR */}
                    <Panel defaultSize={60} minSize={30} className="h-full">
                        <Group orientation="vertical" className="h-full">
                            {/* Top panel - code editor */}
                            <Panel defaultSize={70} minSize={30} className="h-full">
                                <CodeEditor
                                    selectedLang={selectedLang}
                                    onLanguageChange={handleLangChange}
                                    code={code}
                                    isRunning={isRunning}
                                    onCodeChange={setCode}
                                    onRunCode={handleRunCode}
                                />
                            </Panel>

                            <Separator className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                            <Panel defaultSize={30} minSize={30} className="h-full">
                                <OutputPanel output={output}/>
                            </Panel>
                        </Group>
                    </Panel>
                </Group>
            </div>
        </div>
    )
}

export default ProblemPage