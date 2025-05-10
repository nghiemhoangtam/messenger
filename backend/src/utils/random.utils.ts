export function randomString(amount: number, pattern?: string): string {
  const defaultPattern =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const characters = pattern || defaultPattern;
  const charactersLength = characters.length;
  let result = '';

  for (let i = 0; i < amount; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
