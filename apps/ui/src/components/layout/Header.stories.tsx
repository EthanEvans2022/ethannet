import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "./Header";
import { sampleNavLinks } from "./fixtures";

const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Site header: logo on the left, navigation on the right. Mobile-first: below 768px the links live in the hamburger menu; from 768px they're shown inline. Use the viewport toolbar to switch between the two.",
      },
    },
  },
  args: { links: sampleNavLinks },
};
export default meta;

type Story = StoryObj<typeof Header>;

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const Desktop: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
};
