const fs = require("fs");
const { exec } = require("child_process");

async function handleCodeLive(req, res) {
    const { code, input } = req.body;

    if (!code) {
        return res.status(400).json({ error: "No C++ code provided" });
    }

    try {
        fs.writeFileSync("code.cpp", code);
        if (input) {
            fs.writeFileSync("input.txt", input);
        }

        const isWin = process.platform === "win32";
        const exeName = isWin ? "code.exe" : "./code.out";
        const compileCmd = isWin ? `g++ code.cpp -o code.exe` : `g++ code.cpp -o code.out`;
        const runCmd = input ? `${exeName} < input.txt` : `${exeName}`;
        const fullCmd = `${compileCmd} && ${runCmd}`;

        exec(fullCmd, (error, stdout, stderr) => {
            if (error) {
                console.error("Compilation or runtime error:", stderr);
                res.status(400).json({ error: stderr });
            } else {
                res.json({ output: stdout });
            }
            // Cleanup
            fs.unlinkSync("code.cpp");
            if (input) fs.unlinkSync("input.txt");
            if (fs.existsSync(isWin ? "code.exe" : "code.out")) {
                fs.unlinkSync(isWin ? "code.exe" : "code.out");
            }
        });
    } catch (err) {
        console.error("Error saving C++ code:", err);
        res.status(500).json({ error: "Failed to save C++ code" });
    }
}

module.exports = {
    handleCodeLive,
};
