// Utility functions for filtering data
export const filterByExperience = (value: string, experience: number) => {
  const [min, max] = value.split('-').map(Number);
  if (max) {
    return experience >= min && experience <= max;
  }
  return experience >= min;
};

export const filterByRating = (minRating: string, rating: number) => {
  return rating >= Number(minRating);
};

export const filterBySpecialty = (searchSpecialty: string, specialties: string[]) => {
  return specialties.some(s => 
    s.toLowerCase().includes(searchSpecialty.toLowerCase())
  );
};

export const filterBySearchTerm = (term: string, name: string) => {
  return name.toLowerCase().includes(term.toLowerCase());
};