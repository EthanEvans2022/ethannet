import type { Meta, StoryObj } from "@storybook/react";
import { Logo } from "./Logo";

const meta: Meta<typeof Logo> = {
  title: "Layout/Logo",
  component: Logo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'The "ethannet" text wordmark, linking to `/`. Replace the text with an image here when a logo exists.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Logo>;

export const Default: Story = {};
