import { exec } from 'child_process';

const PORT = 5000;

function killProcessOnPort() {
    if (process.platform === 'win32') {
        // Find process using port 5000
        exec(`netstat -ano | findstr :${PORT}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error finding process: ${error}`);
                return;
            }
            
            // Parse the output to get PID
            const lines = stdout.split('\n');
            for (const line of lines) {
                const match = line.match(/LISTENING\s+(\d+)/);
                if (match) {
                    const pid = match[1];
                    // Kill the process
                    exec(`taskkill /F /PID ${pid}`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error killing process: ${error}`);
                            return;
                        }
                        console.log(`Successfully killed process on port ${PORT}`);
                    });
                }
            }
        });
    }
}

killProcessOnPort();
