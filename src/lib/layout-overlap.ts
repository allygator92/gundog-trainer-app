export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** True when two boxes share interior pixels. Edges that only touch do not count. */
export function rectsOverlap(a: Rect, b: Rect, slop = 1) {
  return (
    a.x + slop < b.x + b.width &&
    a.x + a.width > b.x + slop &&
    a.y + slop < b.y + b.height &&
    a.y + a.height > b.y + slop
  );
}

export function assertNoOverlap(a: Rect | null, b: Rect | null, label: string) {
  if (!a || !b) {
    throw new Error(`${label}: missing bounding box`);
  }
  if (rectsOverlap(a, b)) {
    throw new Error(
      `${label}: overlap a=(${a.x},${a.y} ${a.width}x${a.height}) b=(${b.x},${b.y} ${b.width}x${b.height})`,
    );
  }
}
