import StudentForm from '@/components/StudentForm';
import { supabase } from '@/lib/supabase';
import type { Province, StudentFormData, Ward } from '@/types/studentTypes';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditStudent: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<StudentFormData | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [hometownWards, setHometownWards] = useState<Ward[]>([]);
  const [currentWards, setCurrentWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Fetch provinces and wards
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

  // Fetch student data by id
  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        alert('Không tìm thấy học viên!');
        navigate('/students');
        return;
      }
      // Map data to formData structure if needed
      setFormData({
        ...data,
        hometown_province: data.hometown_province || '',
        hometown_ward: data.hometown_ward || '',
        current_province: data.current_province || '',
        current_ward: data.current_ward || '',
      });
      setLoading(false);
    };
    if (id) fetchStudent();
  }, [id, navigate]);

  // Update hometown wards when province changes
  useEffect(() => {
    if (formData?.hometown_province) {
      const filteredWards = wards.filter(
        (ward) => ward.province_code?.toString() === formData.hometown_province,
      );
      setHometownWards(filteredWards);
    }
  }, [formData?.hometown_province, wards]);

  // Update current wards when province changes
  useEffect(() => {
    if (formData?.current_province) {
      const filteredWards = wards.filter(
        (ward) => ward.province_code?.toString() === formData.current_province,
      );
      setCurrentWards(filteredWards);
    }
  }, [formData?.current_province, wards]);

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleUpdate = async () => {
    if (
      !formData?.full_name ||
      !formData.birth_date ||
      !formData.hometown_province ||
      !formData.current_province ||
      !formData.unit
    ) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }
    setLoading(true);

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

    const updateData = {
      ...formData,
      hometown,
      current_address: currentAddress,
    };

    const { error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id);

    setLoading(false);

    if (error) {
      alert('Cập nhật thất bại!');
    } else {
      alert('Cập nhật thành công!');
      navigate('/students');
    }
  };

  const resetForm = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu đã nhập sẽ bị mất.')) {
      navigate('/students');
    }
  };

  if (!formData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">Đang tải dữ liệu học viên...</div>
      </div>
    );
  }

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
      handleSubmit={handleUpdate}
      resetForm={resetForm}
      isEdit={true}
    />
  );
};

export default EditStudent;
