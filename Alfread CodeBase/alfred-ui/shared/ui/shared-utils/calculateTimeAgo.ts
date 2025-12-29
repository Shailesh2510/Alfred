const calculateTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? "A minute ago" : `${diffInMinutes} minutes ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  const remainingMinutes = diffInMinutes % 60;
  if (diffInHours < 24) {
    const hourText = diffInHours === 1 ? "1 hour" : `${diffInHours} hours`;
    const minuteText = remainingMinutes === 0 ? "" : ` ${remainingMinutes} minutes`;
    return `${hourText}${minuteText} ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);

  return diffInDays === 1 ? "A day ago" : `${diffInDays} days ago`;
};

export default calculateTimeAgo;
