export interface Plan {
  name: string; // name like monthly weekly yearly
  amount: number; // price of or plan
  currency: string; // INR ,USD
  interval: string; //  interval in lowerletter strip has for coutdown
  description: string;
  isPopular?: boolean; //  plan brought by many user
  features: string[]; // featuer of plan
}

export const availablePlans: Plan[] = [
  {
    name: "Weekly Plan",
    amount: 150,
    currency: "INR",
    interval: "week",
    description:
      "Ideal for testing our resume parser before a long-term commitment.",
    features: [
      "Parse up to 100 resumes",
      "JSON, CSV, and Excel export",
      "Supports PDF & DOCX formats",
      "Cancel anytime",
    ],
  },
  {
    name: "Monthly Plan",
    amount: 400,
    currency: "INR",
    interval: "month",
    description: "Perfect for recruiters and devs with regular parsing needs.",
    isPopular: true,
    features: [
      "Parse up to 1,000 resumes",
      "OCR support for images & scans",
      "Custom field schema",
      "JSON, CSV, Excel export",
      "Priority support",
      "Cancel anytime",
    ],
  },
  {
    name: "Yearly Plan",
    amount: 3000,
    currency: "INR",
    interval: "year",
    description: "Maximum savings for high-volume parsing over the year.",
    features: [
      "Unlimited resume parsing",
      "OCR & custom field schema",
      "Full API access with webhooks",
      "Bulk parsing & automation",
      "Priority support",
      "Export in JSON, CSV, Excel",
    ],
  },
];

const priceIDMAP: Record<string, string> = {
  week: process.env.STRIPE_PRICE_WEEKLY!,
  month: process.env.STRIPE_PRICE_MONTHLY!,
  year: process.env.STRIPE_PRICE_YEARLY!,
};
export const getPriceIDFromType = (planType: string) => priceIDMAP[planType];
