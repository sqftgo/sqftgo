export interface AssistanceRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  budget: string;
  areas: string[];
  bhk: string;
  familySize: number;
  moveInDate: string;
  notes: string;
  status: "Received" | "Assigned to Agent" | "Properties Suggested";
}

export interface GeneralEnquiry {
  id: string;
  name: string;
  city: string;
  propertyType: string;
  budget: string;
  email: string;
  mobile: string;
  remarks: string;
  message?: string;
  date: string;
  payload?: Record<string, unknown> | null;
}

export interface CustomerReview {
  id: string;
  name: string;
  feedback: string;
  rating: number;
  date: string;
}
