import type { Meta, StoryObj } from '@storybook/html';
import { d6 } from '../assets/d6';
import { createAssetStory } from './createAssetStory';

const meta: Meta = {
  title: 'Assets/d6',
  parameters: {
    docs: {
      description: {
        component: `
# ${d6.name}

## Properties
- **Scale**: ${d6.scale.join(' × ')}
- **Faces**: ${d6.faces?.length || 'N/A'} faces
- **Format**: GLTF with textures
        `
      }
    }
  }
};

export default meta;

export const Default: StoryObj = createAssetStory(d6, 'd6');
