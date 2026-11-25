import type { RestaurantSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: RestaurantSettings = {
  restaurantName: "Khaleej Restaurant",
  logoUrl: "/images/logo.png",
  tagline: "A modern coastal kitchen",
  address: "Khaleej Restaurant, Prashanth Buildings, 19/2222, Medical College Rd, near Ambulance Stand, Vikas Nagar, Ummalathoor, Kozhikode 673008",
  mapUrl: "https://maps.app.goo.gl/7VvhQFpyoXEKeWcGA",
  mapEmbedUrl: "https://maps.google.com/maps?q=11.2700893,75.8378943&z=17&output=embed",
  phone: "+91 90487 00557",
  email: "hello@kaleejrestaurant.com",
  whatsapp: "https://wa.me/919048700557",
  instagram: "https://www.instagram.com/khaleej_restaurant?utm_source=ig_web_button_share_sheet&cnvx=ZDNlZDc0MzIxNw==",
  facebook: "https://facebook.com",
  openingHours: "Mon – Sun · 6:00 AM – 2:00 AM",
  taxPercent: 5,
  deliveryFee: 40,
  freeDeliveryAbove: 500,
  currency: "INR",
  heroTitle: "Discover Our Unique Flavours",
  heroScript: "Crafted With Passion, Served With Love",
  heroIntro:
    "Coastal ingredients, time-honoured recipes and a little theatre. Welcome to a dining experience made for slow evenings and good company.",
  aboutTitle: "A table worth coming back to",
  aboutStory:
    "Kaleej began with a simple idea: the food we remember most is the food shared. Our kitchen brings together the warmth of a coastal home and the discipline of a fine-dining kitchen — honest ingredients, patient technique and flavours that stay with you.",
  chefName: "Chef Ajeer",
  chefTitle: "Head Chef & Founder",
  chefBio:
    "Trained in the old kitchens of Kozhikode and refined across India, Chef Ajeer believes great cooking begins with great produce and ends with a full table.",
  promoTitle: "The Kaleej Experience",
  promoText: "Fresh from our kitchen to your table, every single day.",
  timeSlots: [
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
  ],
};
