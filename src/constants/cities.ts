export const CITIES = [
  "All India",
  "Udaipur", "Jaipur", "Jodhpur", "Kota", "Bikaner",
  "Jaisalmer", "Rajsamand", "Pali", "Pushkar", "Alwar",
  "Ahmedabad", "Surat", "Gandhinagar", "Kutch", "Anand",
  "Rajkot", "Shimla", "Chandigarh", "Dharamshala", "Agra",
  "Delhi", "Mumbai", "Pune"
] as const;

export const CITIES_WITHOUT_ALL = CITIES.filter((c) => c !== "All India");
