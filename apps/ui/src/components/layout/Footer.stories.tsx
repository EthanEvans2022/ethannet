import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "./Footer";
import { sampleNavLinks, sampleSocialLinks } from "./fixtures";

const meta: Meta<typeof Footer> = {
  title: "Layout/Footer",
  component: Footer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Site footer: repeats the main navigation and lists social links, which open in a new tab. Stacked on phones, a single row from 768px.",
      },
    },
  },
  args: { navLinks: sampleNavLinks, socialLinks: sampleSocialLinks },
};
export default meta;

type Story = StoryObj<typeof Footer>;

export const Default: Story = {};

/** The social list is omitted entirely when there are no social links. */
export const NoSocialLinks: Story = { args: { socialLinks: [] } };
