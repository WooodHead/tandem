import {
  ApplicationFragment
} from 'editor/fragment/types';

import { create as createPreviewFragment } from './preview';
import { create as createLayerFragment } from './layers-pane';
import { create as createPasteFragment } from './clipboard-handle-paste';

export function create({ app }) {
  return [
    ...createPreviewFragment({ app }),
    ...createLayerFragment({ app }),
    ...createPasteFragment({ app })
  ];
}