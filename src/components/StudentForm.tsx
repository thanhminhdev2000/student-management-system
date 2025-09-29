import type { Province, StudentFormData, Ward } from '@/types/studentTypes';
import { Home, MapPin, Plus, Save, User, X } from 'lucide-react';
import React from 'react';

interface StudentFormProps {
  formData: StudentFormData;
  provinces: Province[];
  hometownWards: Ward[];
  currentWards: Ward[];
  loading: boolean;
  showOptionalFields: boolean;
  setShowOptionalFields: React.Dispatch<React.SetStateAction<boolean>>;
  handleInputChange: (field: keyof StudentFormData, value: string) => void;
  handleSubmit: () => void;
  resetForm: () => void;
  isEdit?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
  formData,
  provinces,
  hometownWards,
  currentWards,
  loading,
  showOptionalFields,
  setShowOptionalFields,
  handleInputChange,
  handleSubmit,
  resetForm,
  isEdit = false,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Cập nhật học viên' : 'Thêm học viên mới'}
          </h1>
          <p className="text-gray-600">
            {isEdit
              ? 'Chỉnh sửa thông tin học viên'
              : 'Điền thông tin để thêm học viên vào hệ thống'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Phường/Xã
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.hometown_ward}
                    onChange={(e) =>
                      handleInputChange('hometown_ward', e.target.value)
                    }
                    disabled={!formData.hometown_province}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Phường/Xã
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.current_ward}
                    onChange={(e) =>
                      handleInputChange('current_ward', e.target.value)
                    }
                    disabled={!formData.current_province}
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
                {isEdit ? 'Cập nhật học viên' : 'Thêm học viên'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
