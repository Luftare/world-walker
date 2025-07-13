export class DebugLogger {
  private static instance: DebugLogger;
  private uiScene?: any; // UIScene reference

  private constructor() {}

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  setUIScene(uiScene: any): void {
    this.uiScene = uiScene;
  }

  log(message: string): void {
    if (this.uiScene && typeof this.uiScene.logDebug === "function") {
      this.uiScene.logDebug(message);
    } else {
      // Fallback to console if UI is not available
      console.log(`[DEBUG] ${message}`);
    }
  }

  clear(): void {
    if (this.uiScene && typeof this.uiScene.clearDebugLog === "function") {
      this.uiScene.clearDebugLog();
    }
  }
}

// Export a convenience function for easy access
export const debugLog = (message: string): void => {
  DebugLogger.getInstance().log(message);
};
