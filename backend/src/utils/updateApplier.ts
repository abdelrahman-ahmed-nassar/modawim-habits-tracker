import fs from "fs";
import path from "path";
import { execSync } from "child_process";

/**
 * Check for pending updates on app startup and apply them
 */
export function applyPendingUpdate(): boolean {
  try {
    const updateDir = path.join(process.cwd(), "updates");

    // Check if there's a pending update directory
    if (!fs.existsSync(updateDir)) {
      return false;
    }

    console.log("📦 Checking for pending updates...");

    // Get the executable name for the current platform
    const executableName = getExecutableName();

    // Try to find the update executable (could be with or without platform suffix)
    let newExecutablePath = path.join(updateDir, executableName);

    // If not found with simple name, try with platform suffix
    if (!fs.existsSync(newExecutablePath)) {
      const executableWithPlatform = getExecutableNameWithPlatform();
      newExecutablePath = path.join(updateDir, executableWithPlatform);
    }

    if (!fs.existsSync(newExecutablePath)) {
      console.log("⚠️  No update executable found");
      return false;
    }

    console.log("📦 Pending update found, preparing to apply...");

    // Get current executable path
    const currentExecutable = process.execPath;

    // On Windows, we need to use a batch script to replace the running executable
    if (process.platform === "win32") {
      createWindowsUpdateScript(
        currentExecutable,
        newExecutablePath,
        updateDir
      );
      console.log("✅ Update ready - will be applied on next restart");
      console.log(
        "💡 Close the app and run apply-update.bat to complete the update"
      );
      return true;
    } else {
      // On Unix systems (macOS, Linux), we can replace the file directly
      // Replace with new executable
      fs.copyFileSync(newExecutablePath, currentExecutable);

      // Set execute permissions
      fs.chmodSync(currentExecutable, 0o755);

      // Clean up
      fs.rmSync(updateDir, { recursive: true, force: true });

      console.log("✅ Update applied successfully!");
      return true;
    }
  } catch (error) {
    console.error("❌ Failed to apply update:", error);
    return false;
  }
}

/**
 * Create a Windows batch script that will replace the executable after it exits
 */
function createWindowsUpdateScript(
  currentExecutable: string,
  newExecutablePath: string,
  updateDir: string
): void {
  const scriptPath = path.join(
    path.dirname(currentExecutable),
    "apply-update.bat"
  );

  const script = `@echo off
echo Applying update...
timeout /t 2 /nobreak > nul

REM Replace with new version
copy /Y "${newExecutablePath}" "${currentExecutable}"

REM Clean up
rmdir /S /Q "${updateDir}"
del "%~f0"

echo Update completed! Starting application...
start "" "${currentExecutable}"
`;

  fs.writeFileSync(scriptPath, script, "utf-8");
  console.log(`📝 Update script created at: ${scriptPath}`);
  console.log("💡 To apply update: Close the app and run apply-update.bat");
}

/**
 * Get the executable name for the current platform
 */
function getExecutableName(): string {
  switch (process.platform) {
    case "win32":
      return "modawim-habits-tracker.exe";
    case "darwin":
    case "linux":
      return "modawim-habits-tracker";
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

/**
 * Get the executable name with platform suffix (as downloaded from GitHub)
 */
function getExecutableNameWithPlatform(): string {
  switch (process.platform) {
    case "win32":
      return "modawim-habits-tracker-win.exe";
    case "darwin":
      return "modawim-habits-tracker-macos";
    case "linux":
      return "modawim-habits-tracker-linux";
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

/**
 * Recursively copy a directory
 */
function copyDirectory(source: string, destination: string): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Check if there's an update script waiting to be run (Windows only)
 */
export function checkForUpdateScript(): boolean {
  if (process.platform !== "win32") {
    return false;
  }

  const scriptPath = path.join(
    path.dirname(process.execPath),
    "apply-update.bat"
  );
  return fs.existsSync(scriptPath);
}
