import StudentForm from '@/components/StudentForm';
import { createStudentInitialFormData } from '@/constants/studentConstants';
import type { Province, StudentFormData, Ward } from '@/types/studentTypes';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const CreateStudent: React.FC = () => {
  const [formData, setFormData] = useState<StudentFormData>(
    createStudentInitialFormData,
  );

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [hometownWards, setHometownWards] = useState<Ward[]>([]);
  const [currentWards, setCurrentWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvincesAndWards = async () => {
      try {
        const [provincesRes, wardsRes] = await Promise.all([
          fetch('https://provinces.open-api.vn/api/v2/p/'),
          fetch('https://provinces.open-api.vn/api/v2/w/'),
        ]);
        const provincesData = await provincesRes.json();
        const wardsData = await wardsRes.json();
        setProvinces(provincesData);
        setWards(wardsData);
      } catch (error) {
        console.error('Error fetching provinces or wards:', error);
      }
    };

    fetchProvincesAndWards();
  }, []);

  // Fetch districts when hometown province changes
  useEffect(() => {
    if (formData.hometown_province) {
      const filteredWards = wards.filter(
        (ward) => ward.province_code?.toString() === formData.hometown_province,
      );
      setHometownWards(filteredWards);
      setFormData((prev) => ({
        ...prev,
        hometown_ward: '',
      }));
    }
  }, [formData.hometown_province, wards]);

  useEffect(() => {
    if (formData.current_province) {
      const filteredWards = wards.filter(
        (ward) => ward.province_code?.toString() === formData.current_province,
      );
      setCurrentWards(filteredWards);
      setFormData((prev) => ({
        ...prev,
        current_ward: '',
      }));
    }
  }, [formData.current_province, wards]);

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (
      !formData.full_name ||
      !formData.birth_date ||
      !formData.hometown_province ||
      !formData.current_province ||
      !formData.unit
    ) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }

    setLoading(true);

    try {
      // Build full addresses (province + ward only)
      const hometownProvince = provinces.find(
        (p) => p.code.toString() === formData.hometown_province,
      );
      const hometownWard = hometownWards.find(
        (w) => w.code.toString() === formData.hometown_ward,
      );
      const currentProvince = provinces.find(
        (p) => p.code.toString() === formData.current_province,
      );
      const currentWard = currentWards.find(
        (w) => w.code.toString() === formData.current_ward,
      );

      const hometown = [hometownWard?.name, hometownProvince?.name]
        .filter(Boolean)
        .join(', ');

      const currentAddress = [currentWard?.name, currentProvince?.name]
        .filter(Boolean)
        .join(', ');

      const studentData = {
        full_name: formData.full_name,
        birth_date: formData.birth_date,
        hometown,
        current_address: currentAddress,
        unit: formData.unit,
        ethnicity: formData.ethnicity,
        religion: formData.religion,
        rank: formData.rank || '',
        position: formData.position || '',
        join_date: formData.join_date ? formData.join_date : null,
        party_membership: formData.party_membership || '',
        education: formData.education || '',
        blood_type: formData.blood_type || '',
        health: formData.health || '',
        father_name: formData.father_name || '',
        father_birth_year: formData.father_birth_year
          ? Number(formData.father_birth_year)
          : null,
        mother_name: formData.mother_name || '',
        mother_birth_year: formData.mother_birth_year
          ? Number(formData.mother_birth_year)
          : null,
        emergency_relationship: formData.emergency_relationship || '',
        emergency_phone: formData.emergency_phone || '',
        talents: formData.talents,
        violations: formData.violations,
        notes: formData.notes,
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      };

      console.log('Student data to be saved:', studentData);

      const { error } = await supabase.from('students').insert([studentData]); // studentData là object chứa dữ liệu học viên

      if (error) {
        // Xử lý lỗi
        alert('Có lỗi xảy ra khi thêm học viên!');
      } else {
        alert('Thêm học viên thành công!');
      }

      setFormData(createStudentInitialFormData);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Có lỗi xảy ra khi thêm học viên!');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (confirm('Bạn có chắc muốn hủy? Dữ liệu đã nhập sẽ bị mất.')) {
      setFormData(createStudentInitialFormData);
    }
  };

  return (
    <StudentForm
      formData={formData}
      provinces={provinces}
      hometownWards={hometownWards}
      currentWards={currentWards}
      loading={loading}
      showOptionalFields={showOptionalFields}
      setShowOptionalFields={setShowOptionalFields}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      resetForm={resetForm}
      isEdit={false}
    />
  );
};

export default CreateStudent;
