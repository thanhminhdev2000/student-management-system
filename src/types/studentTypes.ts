export interface Province {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  latitude: string;
  longitude: string;
}

export interface District {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  latitude: string;
  longitude: string;
}

export interface Ward {
  code: number;
  province_code: number;
  name: string;
  full_name: string;
}

export interface StudentFormData {
  full_name: string;
  birth_date: string;
  hometown_province: string;
  hometown_district: string;
  hometown_ward: string;
  current_province: string;
  current_district: string;
  current_ward: string;
  unit: string;
  ethnicity: string;
  religion: string;
  rank: string;
  position: string;
  join_date: string;
  party_membership: string;
  education: string;
  blood_type: string;
  health: string;
  father_name: string;
  father_birth_year: string;
  mother_name: string;
  mother_birth_year: string;
  emergency_relationship: string;
  emergency_phone: string;
  talents: string[];
  violations: string[];
  notes: string;
}
