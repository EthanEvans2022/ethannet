import type { Meta, StoryObj } from "@storybook/react";
import { NavLinks } from "./NavLinks";
import { sampleNavLinks } from "./fixtures";

const meta: Meta<typeof NavLinks> = {
  title: "Layout/NavLinks",
  component: NavLinks,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A plain list of internal links, shared by the header, the mobile menu and the footer. Pass links in as props; don't import the nav config inside components.",
      },
    },
  },
  args: { links: sampleNavLinks },
};
export default meta;

type Story = StoryObj<typeof NavLinks>;

export const Row: Story = { args: { direction: "row" } };

export const Column: Story = { args: { direction: "column" } };

/** An empty list renders nothing. */
export const Empty: Story = { args: { links: [] } };
