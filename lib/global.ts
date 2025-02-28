// lib/global.ts

// This object will hold your global variables
const globalVars: { [key: string]: any } = {}

// Function to set a global variable
export function setGlobalVar(key: string, value: any): void {
  globalVars[key] = value
}

// Function to get a global variable
export function getGlobalVar(key: string): any {
  return globalVars[key]
}

// Initialize global variable if not set
if (!getGlobalVar("lastTimeCheckedRanked")) {
  setGlobalVar("lastTimeCheckedRanked", Date.now())
}
