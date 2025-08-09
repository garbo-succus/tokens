import type { Meta, StoryObj } from '@storybook/html';
import { die } from '../assets/die';
import { createAssetStory } from './createAssetStory';

const meta: Meta = {
  title: 'Assets/Die',
  parameters: {
    docs: {
      description: {
        component: `
# ${die.name}

## Usage
\`\`\`
template: die
\`\`\`

## Properties
- **Scale**: ${die.scale.join(' × ')}
- **Faces**: ${die.faces?.length || 'N/A'} faces
- **Format**: GLTF with textures
        `
      }
    }
  }
};

export default meta;

export const Default: StoryObj = createAssetStory(die, 'die');
