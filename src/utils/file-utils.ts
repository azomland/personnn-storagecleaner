import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

export const execAsync = promisify(exec);

export async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    // Usa du en Mac para calcular el tamaño de forma eficiente
    const { stdout } = await execAsync(`du -sk "${dirPath}"`);
    const sizeInKB = parseInt(stdout.split('\t')[0], 10);
    return sizeInKB * 1024; // Convertir a bytes
  } catch (error) {
    // Fallback manual si falla du
    return await getDirectorySizeManual(dirPath);
  }
}

async function getDirectorySizeManual(dirPath: string): Promise<number> {
  let totalSize = 0;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        totalSize += await getDirectorySizeManual(fullPath);
      } else {
        try {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        } catch {
          // Ignorar archivos que no se pueden leer
        }
      }
    }
  } catch {
    // Ignorar directorios que no se pueden leer
  }

  return totalSize;
}

export async function getLastModified(dirPath: string): Promise<Date> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.mtime;
  } catch {
    return new Date(0);
  }
}

export async function deleteDirectory(dirPath: string): Promise<void> {
  await fs.rm(dirPath, { recursive: true, force: true });
}

export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export function getHomeDirectory(): string {
  return process.env.HOME || process.env.USERPROFILE || '/';
}

export function expandPath(inputPath: string): string {
  if (inputPath.startsWith('~')) {
    return path.join(getHomeDirectory(), inputPath.slice(1));
  }
  return inputPath;
}
