import { getElements } from '../../util';
import { APISelect } from './apiSelect';

export function initApiSelect(base?: Element): void {
  for (const select of getElements<HTMLSelectElement>('.netbox-api-select', { base })) {
    new APISelect(select);
  }
}

export type { Trigger } from './types';
