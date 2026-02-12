import prettyBytes from 'pretty-bytes';

export function formatSize(bytes: number): string {
  return prettyBytes(bytes);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function getDaysAgo(date: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function formatPath(fullPath: string, maxLength: number = 60): string {
  if (fullPath.length <= maxLength) {
    return fullPath;
  }

  const parts = fullPath.split('/');
  if (parts.length <= 3) {
    return fullPath;
  }

  const filename = parts[parts.length - 1];
  const parent = parts[parts.length - 2];

  return `.../${parent}/${filename}`;
}
