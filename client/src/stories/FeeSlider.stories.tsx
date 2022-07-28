import { ComponentStory, ComponentMeta } from '@storybook/react';

import FeeSlider from '../components/FeeSlider';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/FeeSlider',
    component: FeeSlider,
} as ComponentMeta<typeof FeeSlider>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof FeeSlider> = (args) => <FeeSlider />;

export const Primary = Template.bind({});
