

export function minutesAndSeconds(ms: number | undefined): string {
    if (!ms) return "00:00";
    const timeInSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    return formattedTime;
}