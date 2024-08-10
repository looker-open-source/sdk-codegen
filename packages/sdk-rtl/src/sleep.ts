/**
 * Copyright (c) 2024 Google LLC
 * SPDX-License-Identifier: MIT
 */

/**
 * Simple async sleep function using setTimeout
 * @param timeMs milliseconds to sleep
 */
export async function sleep(timeMs: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeMs);
  });
}
