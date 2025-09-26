import { Home, MapPin, Plus, Save, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Province {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  latitude: string;
  longitude: string;
}

interface District {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  latitude: string;
  longitude: string;
}

interface Ward {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  latitude: string;
  longitude: string;
}

interface StudentFormData {
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

const AddStudent: React.FC = () => {
  const [formData, setFormData] = useState<StudentFormData>({
    full_name: '',
    birth_date: '',
    hometown_province: '',
    hometown_district: '',
    hometown_ward: '',
    current_province: '',
    current_district: '',
    current_ward: '',
    unit: '',
    ethnicity: 'Kinh',
    religion: 'Không',
    rank: '',
    position: '',
    join_date: '',
    party_membership: '',
    education: '',
    blood_type: '',
    health: '',
    father_name: '',
    father_birth_year: '',
    mother_name: '',
    mother_birth_year: '',
    emergency_relationship: '',
    emergency_phone: '',
    talents: [],
    violations: [],
    notes: '',
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [hometownDistricts, setHometownDistricts] = useState<District[]>([]);
  const [hometownWards, setHometownWards] = useState<Ward[]>([]);
  const [currentDistricts, setCurrentDistricts] = useState<District[]>([]);
  const [currentWards, setCurrentWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/v2/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch districts when hometown province changes
  useEffect(() => {
    if (formData.hometown_province) {
      const fetchDistricts = async () => {
        try {
          const response = await fetch(
            `https://provinces.open-api.vn/api/v2/p/${formData.hometown_province}?depth=2`,
          );
          const data = await response.json();
          setHometownDistricts(data.districts || []);
          setFormData((prev) => ({
            ...prev,
            hometown_district: '',
            hometown_ward: '',
          }));
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };
      fetchDistricts();
    }
  }, [formData.hometown_province]);

  // Fetch wards when hometown district changes
  useEffect(() => {
    if (formData.hometown_district) {
      const fetchWards = async () => {
        try {
          const response = await fetch(
            `https://provinces.open-api.vn/api/v2/d/${formData.hometown_district}?depth=2`,
          );
          const data = await response.json();
          setHometownWards(data.wards || []);
          setFormData((prev) => ({ ...prev, hometown_ward: '' }));
        } catch (error) {
          console.error('Error fetching wards:', error);
        }
      };
      fetchWards();
    }
  }, [formData.hometown_district]);

  // Fetch districts when current province changes
  useEffect(() => {
    if (formData.current_province) {
      const fetchDistricts = async () => {
        try {
          const response = await fetch(
            `https://provinces.open-api.vn/api/v2/p/${formData.current_province}?depth=2`,
          );
          const data = await response.json();
          setCurrentDistricts(data.districts || []);
          setFormData((prev) => ({
            ...prev,
            current_district: '',
            current_ward: '',
          }));
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };
      fetchDistricts();
    }
  }, [formData.current_province]);

  // Fetch wards when current district changes
  useEffect(() => {
    if (formData.current_district) {
      const fetchWards = async () => {
        try {
          const response = await fetch(
            `https://provinces.open-api.vn/api/v2/d/${formData.current_district}?depth=2`,
          );
          const data = await response.json();
          setCurrentWards(data.wards || []);
          setFormData((prev) => ({ ...prev, current_ward: '' }));
        } catch (error) {
          console.error('Error fetching wards:', error);
        }
      };
      fetchWards();
    }
  }, [formData.current_district]);

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
      // Build full addresses
      const hometownProvince = provinces.find(
        (p) => p.code.toString() === formData.hometown_province,
      );
      const hometownDistrict = hometownDistricts.find(
        (d) => d.code.toString() === formData.hometown_district,
      );
      const hometownWard = hometownWards.find(
        (w) => w.code.toString() === formData.hometown_ward,
      );

      const currentProvince = provinces.find(
        (p) => p.code.toString() === formData.current_province,
      );
      const currentDistrict = currentDistricts.find(
        (d) => d.code.toString() === formData.current_district,
      );
      const currentWard = currentWards.find(
        (w) => w.code.toString() === formData.current_ward,
      );

      const hometown = [
        hometownWard?.name,
        hometownDistrict?.name,
        hometownProvince?.name,
      ]
        .filter(Boolean)
        .join(', ');

      const currentAddress = [
        currentWard?.name,
        currentDistrict?.name,
        currentProvince?.name,
      ]
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
        join_date: formData.join_date || '',
        party_membership: formData.party_membership || '',
        education: formData.education || '',
        blood_type: formData.blood_type || '',
        health: formData.health || '',
        father: {
          name: formData.father_name || '',
          birth_year: formData.father_birth_year || '',
        },
        mother: {
          name: formData.mother_name || '',
          birth_year: formData.mother_birth_year || '',
        },
        emergency_contact: {
          relationship: formData.emergency_relationship || '',
          phone: formData.emergency_phone || '',
        },
        talents: formData.talents,
        violations: formData.violations,
        notes: formData.notes,
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      };

      console.log('Student data to be saved:', studentData);
      // Here you would typically send data to your backend/Supabase
      // await supabase.from('students').insert(studentData);

      alert('Thêm học viên thành công!');
      // Reset form
      setFormData({
        full_name: '',
        birth_date: '',
        hometown_province: '',
        hometown_district: '',
        hometown_ward: '',
        current_province: '',
        current_district: '',
        current_ward: '',
        unit: '',
        ethnicity: 'Kinh',
        religion: 'Không',
        rank: '',
        position: '',
        join_date: '',
        party_membership: '',
        education: '',
        blood_type: '',
        health: '',
        father_name: '',
        father_birth_year: '',
        mother_name: '',
        mother_birth_year: '',
        emergency_relationship: '',
        emergency_phone: '',
        talents: [],
        violations: [],
        notes: '',
      });
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Có lỗi xảy ra khi thêm học viên!');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (confirm('Bạn có chắc muốn hủy? Dữ liệu đã nhập sẽ bị mất.')) {
      setFormData({
        full_name: '',
        birth_date: '',
        hometown_province: '',
        hometown_district: '',
        hometown_ward: '',
        current_province: '',
        current_district: '',
        current_ward: '',
        unit: '',
        ethnicity: 'Kinh',
        religion: 'Không',
        rank: '',
        position: '',
        join_date: '',
        party_membership: '',
        education: '',
        blood_type: '',
        health: '',
        father_name: '',
        father_birth_year: '',
        mother_name: '',
        mother_birth_year: '',
        emergency_relationship: '',
        emergency_phone: '',
        talents: [],
        violations: [],
        notes: '',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Thêm học viên mới
          </h1>
          <p className="text-gray-600">
            Điền thông tin để thêm học viên vào hệ thống
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Required Fields */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Thông tin bắt buộc</h2>
              <span className="text-red-500">*</span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.full_name}
                  onChange={(e) =>
                    handleInputChange('full_name', e.target.value)
                  }
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.birth_date}
                  onChange={(e) =>
                    handleInputChange('birth_date', e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị về học tập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                placeholder="Nhập đơn vị về học tập"
              />
            </div>

            {/* Hometown Address */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Quê quán <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.hometown_province}
                    onChange={(e) =>
                      handleInputChange('hometown_province', e.target.value)
                    }
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Quận/Huyện
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.hometown_district}
                    onChange={(e) =>
                      handleInputChange('hometown_district', e.target.value)
                    }
                    disabled={!formData.hometown_province}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {hometownDistricts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Phường/Xã
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.hometown_ward}
                    onChange={(e) =>
                      handleInputChange('hometown_ward', e.target.value)
                    }
                    disabled={!formData.hometown_district}
                  >
                    <option value="">Chọn phường/xã</option>
                    {hometownWards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Current Address */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Nơi ở hiện tại <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.current_province}
                    onChange={(e) =>
                      handleInputChange('current_province', e.target.value)
                    }
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Quận/Huyện
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.current_district}
                    onChange={(e) =>
                      handleInputChange('current_district', e.target.value)
                    }
                    disabled={!formData.current_province}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {currentDistricts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Phường/Xã
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.current_ward}
                    onChange={(e) =>
                      handleInputChange('current_ward', e.target.value)
                    }
                    disabled={!formData.current_district}
                  >
                    <option value="">Chọn phường/xã</option>
                    {currentWards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dân tộc
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.ethnicity}
                  onChange={(e) =>
                    handleInputChange('ethnicity', e.target.value)
                  }
                  placeholder="Dân tộc"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tôn giáo
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.religion}
                  onChange={(e) =>
                    handleInputChange('religion', e.target.value)
                  }
                  placeholder="Tôn giáo"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Optional Fields Toggle */}
        <div className="flex justify-center">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
          >
            {showOptionalFields ? (
              <>
                <X className="h-4 w-4" />
                Ẩn thông tin bổ sung
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Thêm thông tin bổ sung
              </>
            )}
          </button>
        </div>

        {/* Optional Fields */}
        {showOptionalFields && (
          <>
            {/* Military Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Thông tin quân sự</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cấp bậc
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.rank}
                      onChange={(e) =>
                        handleInputChange('rank', e.target.value)
                      }
                      placeholder="Cấp bậc"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chức vụ
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.position}
                      onChange={(e) =>
                        handleInputChange('position', e.target.value)
                      }
                      placeholder="Chức vụ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày nhập ngũ
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.join_date}
                      onChange={(e) =>
                        handleInputChange('join_date', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đảng/Đoàn
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.party_membership}
                    onChange={(e) =>
                      handleInputChange('party_membership', e.target.value)
                    }
                  >
                    <option value="">Chọn</option>
                    <option value="Đảng viên">Đảng viên</option>
                    <option value="Đoàn viên">Đoàn viên</option>
                    <option value="Quần chúng">Quần chúng</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Thông tin cá nhân</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trình độ văn hóa
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.education}
                      onChange={(e) =>
                        handleInputChange('education', e.target.value)
                      }
                    >
                      <option value="">Chọn</option>
                      <option value="ĐH">Đại học</option>
                      <option value="CĐ">Cao đẳng</option>
                      <option value="TC">Trung cấp</option>
                      <option value="12/12">THPT</option>
                      <option value="10/12">Lớp 10</option>
                      <option value="9/12">THCS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhóm máu
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.blood_type}
                      onChange={(e) =>
                        handleInputChange('blood_type', e.target.value)
                      }
                    >
                      <option value="">Chọn</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sức khỏe
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.health}
                      onChange={(e) =>
                        handleInputChange('health', e.target.value)
                      }
                    >
                      <option value="">Chọn</option>
                      <option value="1">Loại 1</option>
                      <option value="2">Loại 2</option>
                      <option value="3">Loại 3</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Thông tin gia đình</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">
                      Thông tin bố
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.father_name}
                        onChange={(e) =>
                          handleInputChange('father_name', e.target.value)
                        }
                        placeholder="Họ và tên bố"
                      />
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.father_birth_year}
                        onChange={(e) =>
                          handleInputChange('father_birth_year', e.target.value)
                        }
                        placeholder="Năm sinh"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">
                      Thông tin mẹ
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.mother_name}
                        onChange={(e) =>
                          handleInputChange('mother_name', e.target.value)
                        }
                        placeholder="Họ và tên mẹ"
                      />
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.mother_birth_year}
                        onChange={(e) =>
                          handleInputChange('mother_birth_year', e.target.value)
                        }
                        placeholder="Năm sinh"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 mb-3">
                    Liên hệ khẩn cấp
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.emergency_relationship}
                      onChange={(e) =>
                        handleInputChange(
                          'emergency_relationship',
                          e.target.value,
                        )
                      }
                      placeholder="Mối quan hệ"
                    />
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.emergency_phone}
                      onChange={(e) =>
                        handleInputChange('emergency_phone', e.target.value)
                      }
                      placeholder="Số điện thoại"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Thông tin bổ sung</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Ghi chú thêm về học viên..."
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onClick={resetForm}
          >
            Hủy
          </button>

          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Thêm học viên
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
