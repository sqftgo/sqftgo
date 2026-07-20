export const formatIndianCurrency = (price: number, purpose: "buy" | "sell" | "rent" | "lease"): string => {
  if (purpose === "rent" || purpose === "lease") {
    return `₹${price.toLocaleString("en-IN")} / mo`;
  }
  
  if (price >= 10000000) {
    const cr = price / 10000000;
    return `₹${cr.toFixed(2).replace(/\.00$/, "")} Crore`;
  } else if (price >= 100000) {
    const lakh = price / 100000;
    return `₹${lakh.toFixed(2).replace(/\.00$/, "")} Lakh`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
};
