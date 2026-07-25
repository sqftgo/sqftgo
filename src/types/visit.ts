export type VisitStatusUi =
  | "Pending Approval"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export interface VisitBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  locality: string;
  city: string;
  address: string;
  date: string;
  time: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  brokerName: string;
  brokerPhone: string;
  status: VisitStatusUi;
  notes?: string;
  createdAt: string;
}
