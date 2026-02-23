import * as Clipboard from 'expo-clipboard';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export async function getFromClipboard(): Promise<string> {
  try {
    const text = await Clipboard.getStringAsync();
    return text;
  } catch (error) {
    console.error('Failed to get from clipboard:', error);
    return '';
  }
}
