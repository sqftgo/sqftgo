import type { AssistanceRequest, GeneralEnquiry, CustomerReview } from "@/types/inquiry";
import type { PropertyInquiry } from "@/types/property";

export const initialAssistanceRequests: AssistanceRequest[] = [
    {
      id: "req-1",
      name: "Rohan Verma",
      email: "rohan@example.com",
      phone: "+91 98765 12345",
      budget: "₹25,000 - ₹35,000 / month",
      areas: ["Shobhagpura", "Panchwati"],
      bhk: "3 BHK",
      familySize: 4,
      moveInDate: "2026-07-01",
      notes: "Looking for an apartment near DPS school with park view and security.",
      status: "Assigned to Agent",
    }
  ];

export const initialInquiries: { [key: string]: PropertyInquiry[] } = {
    "prop-1": [
      {
        name: "Suresh Patidar",
        email: "suresh@patidar.com",
        phone: "+91 94141 99999",
        message: "Hi, I am interested in viewing this lakeview villa this Sunday. Is it available for a visit?",
        date: "2026-06-14",
      }
    ],
    "prop-3": [
      {
        name: "Aishwarya Sen",
        email: "aishwarya@sen.com",
        phone: "+91 98888 12345",
        message: "Is the rent negotiable? I am looking to move in by next month.",
        date: "2026-07-12",
      }
    ],
    "prop-9": [
      {
        name: "Ramesh Kumar",
        email: "ramesh@kumar.com",
        phone: "+91 91234 56789",
        message: "We want to schedule a visit for our team of 15 people. Please let us know when is convenient.",
        date: "2026-07-15",
      }
    ]
  };

export const initialEnquiries: GeneralEnquiry[] = [
    {
      id: "enq-1",
      name: "Aditya Vardhan",
      city: "Udaipur",
      propertyType: "Villa",
      budget: "₹3 Crore - ₹5 Crore",
      email: "aditya@vardhan.com",
      mobile: "+91 98290 11111",
      remarks: "Looking for a heritage-style lakefront property with a clean title.",
      date: "2026-06-15",
    }
  ];

export const initialReviews: CustomerReview[] = [
    {
      id: "rev-1",
      name: "Priyanjali Rathore",
      feedback: "Khamagani Sa! The service provided by Sun Valley when relocating from Mumbai to Jaipur was outstanding. They verified all haveli deeds thoroughly.",
      rating: 5,
      date: "2026-06-12",
    },
    {
      id: "rev-2",
      name: "Mehul Patel",
      feedback: "Found an excellent commercial office space in SG Highway Ahmedabad. The lease process was smooth and entirely handled by the brokerage team.",
      rating: 5,
      date: "2026-06-14",
    }
  ];
