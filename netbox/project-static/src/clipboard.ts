import Clipboard from 'clipboard';
import { getElements } from './util';

export function initClipboard(base?: Element): void {
  for (const element of getElements('a.copy-token', 'button.copy-secret', { base })) {
    new Clipboard(element);
  }
}
