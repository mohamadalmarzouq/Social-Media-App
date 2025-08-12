import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function getRoundName(round: number): string {
  switch (round) {
    case 1:
      return 'Round 1';
    case 2:
      return 'Round 2';
    case 3:
      return 'Round 3 (Final Selection)';
    default:
      return `Round ${round}`;
  }
}

export async function syncContestAcceptedCount(contestId: string): Promise<number> {
  const { prisma } = await import('@/lib/prisma');
  
  // Count actual accepted submissions from database
  const totalAcceptedSubmissions = await prisma.submission.count({
    where: {
      contestId: contestId,
      status: 'ACCEPTED',
    },
  });

  // Update contest with accurate count
  await prisma.contest.update({
    where: { id: contestId },
    data: { acceptedCount: totalAcceptedSubmissions },
  });

  return totalAcceptedSubmissions;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isValidImageType(mimeType: string): boolean {
  return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType);
}

export function isValidVideoType(mimeType: string): boolean {
  return ['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(mimeType);
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function validateImageDimensions(platform: 'INSTAGRAM' | 'TIKTOK', width: number, height: number): boolean {
  if (platform === 'INSTAGRAM') {
    // Instagram posts should be 1080x1080 (square)
    return width === 1080 && height === 1080;
  } else if (platform === 'TIKTOK') {
    // TikTok should be 1080x1920 (9:16 aspect ratio)
    return width === 1080 && height === 1920;
  }
  return false;
}
