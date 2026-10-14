import { Bike, Car, Martini, Sailboat, Sparkles, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { Category } from "@/generated/prisma/enums";

type CategoryInfo = {
  label: string;
  icon: LucideIcon;
  /** The first example pre-fills the title when the category is picked. */
  examples: string[];
};

export const CATEGORIES: Record<Category, CategoryInfo> = {
  dining: {
    label: "Dining",
    icon: UtensilsCrossed,
    examples: ["Private chef dinner", "Restaurant reservation"],
  },
  activities: {
    label: "Activities",
    icon: Bike,
    examples: ["Surf lesson", "Snorkeling", "ATV tour"],
  },
  wellness: {
    label: "Wellness",
    icon: Sparkles,
    examples: ["Spa treatment", "Yoga session", "Massage"],
  },
  excursions: {
    label: "Excursions",
    icon: Sailboat,
    examples: ["Whale watching", "Sailing charter", "Cultural tour"],
  },
  transport: {
    label: "Transport",
    icon: Car,
    examples: ["Airport transfer", "Private car", "Helicopter"],
  },
  experiences: {
    label: "Experiences",
    icon: Martini,
    examples: ["Sunset cocktails", "Bonfire on the beach", "Tequila tasting"],
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];
