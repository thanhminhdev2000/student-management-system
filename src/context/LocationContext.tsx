/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useEffect, useState } from 'react';

interface LocationContextType {
  provinces: any[];
  wards: any[];
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Kiểm tra localStorage
      const provincesLS = localStorage.getItem('provinces');
      const wardsLS = localStorage.getItem('wards');
      if (provincesLS && wardsLS) {
        setProvinces(JSON.parse(provincesLS));
        setWards(JSON.parse(wardsLS));
        return;
      }
      // Fetch nếu chưa có
      const [provincesRes, wardsRes] = await Promise.all([
        fetch('https://provinces.open-api.vn/api/v2/p/'),
        fetch('https://provinces.open-api.vn/api/v2/w/'),
      ]);
      const provincesData = await provincesRes.json();
      const wardsData = await wardsRes.json();
      setProvinces(provincesData);
      setWards(wardsData);
      localStorage.setItem('provinces', JSON.stringify(provincesData));
      localStorage.setItem('wards', JSON.stringify(wardsData));
    };
    fetchData();
  }, []);

  return (
    <LocationContext.Provider value={{ provinces, wards }}>
      {children}
    </LocationContext.Provider>
  );
};

export { LocationContext };
