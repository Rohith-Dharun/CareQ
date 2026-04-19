import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import girlImg from "./girl.png";
import boyImg from "./boy.png";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateAvatar(gender: "MALE" | "FEMALE") {
  if (gender === "FEMALE") return girlImg;
  return boyImg;
}

export const formatIndianPhoneNumber = (value: string) => {
  if (!value) return value;

  // Remove all non-digits
  const phoneNumber = value.replace(/\D/g, "");

  // Handle country code +91
  let cleaned = phoneNumber;

  if (cleaned.startsWith("91") && cleaned.length > 10) {
    cleaned = cleaned.slice(-10);
  }

  if (cleaned.length <= 5) return cleaned;

  return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
};

export const getNext5Days = () => {
  const dates = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 0; i < 5; i++) {
    const date = new Date(tomorrow);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
};

