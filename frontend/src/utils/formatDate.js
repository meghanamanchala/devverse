export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000; 

  if (diff < 60) return "Just now";

  const minutes = diff / 60;
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;

  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;

  const days = hours / 24;
  if (days < 7) return `${Math.floor(days)}d ago`;

  const weeks = days / 7;
  if (weeks < 4) return `${Math.floor(weeks)}w ago`;

  const months = days / 30;
  if (months < 12) return `${Math.floor(months)}mo ago`;

  const years = days / 365;
  return `${Math.floor(years)}y ago`;
}
