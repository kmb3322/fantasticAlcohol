// client/src/utils/generateRandomId.ts
export default function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 10);
}
