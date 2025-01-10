// client/src/utils/generateRandomId.ts
export default function generateRandomId(): string {
    return 'user-' + Math.random().toString(36).substr(2, 9);
  }
  