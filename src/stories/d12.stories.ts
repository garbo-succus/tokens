import type { Meta, StoryObj } from '@storybook/html';
import { d12 } from '../assets/d12';
import { createAssetStory } from './createAssetStory';

const meta: Meta = {
  title: 'Assets/d12',
  parameters: {
    docs: {
      description: {
        component: `
# ${d12.name}

## Properties
- **Scale**: ${d12.scale.join(' × ')}
- **Faces**: ${d12.faces?.length || 'N/A'} faces
- **Format**: GLTF with textures
        `
      }
    }
  }
};

export default meta;

export const Default: StoryObj = createAssetStory(d12, 'd12');
