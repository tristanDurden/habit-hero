

export function minutesAndSeconds(ms: number | undefined): string {
    if (!ms) return "00:00";
    const timeInSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    return formattedTime;
}

export function lastCompletedFormatted(lastCompleted: number): string {
    const lastCompletedDate = new Date(lastCompleted);
    const now = new Date();
    
    const day = lastCompletedDate.getDate();
    const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];
    const month = monthNames[lastCompletedDate.getMonth()];
    const year = lastCompletedDate.getFullYear();
    const currentYear = now.getFullYear();
    
    const hours = lastCompletedDate.getHours();
    const minutes = lastCompletedDate.getMinutes();
    const timeString = `${hours}:${minutes.toString().padStart(2, "0")}`;
    
    const dateString = year === currentYear 
        ? `${day} ${month}, ${timeString}`
        : `${day} ${month} ${year}, ${timeString}`;
    
    return dateString;
}