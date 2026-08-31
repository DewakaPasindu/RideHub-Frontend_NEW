// Common type definitions
export interface FilterState {
  experience: string;
  rating: string;
  specialty: string;
  searchTerm: string;
}

export interface FilterChangeHandler {
  (filters: FilterState): void;
}