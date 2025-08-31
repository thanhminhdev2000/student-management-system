import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Loading,
  Modal,
  Select,
} from '@/components/ui';
import {
  Calendar,
  Eye,
  GraduationCap,
  MapPin,
  Search,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Student {
  id: number;
  full_name: string;
  birth_date: string;
  rank: string;
  position: string;
  join_date: string;
  party_membership: string;
  ethnicity: string;
  religion: string;
  unit: string;
  education: string;
  blood_type: string;
  health: string;
  father: {
    name: string;
    birth_year: string;
  };
  mother: {
    name: string;
    birth_year: string;
  };
  hometown: string;
  current_address: string;
  emergency_contact: {
    relationship: string;
    phone: string;
  };
  avatar: string;
  talents: string[];
  violations: string[];
  notes: string;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEthnicity, setFilterEthnicity] = useState('');
  const [filterEducation, setFilterEducation] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch students data from Supabase
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase.from('students').select('*');

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setStudents(data as Student[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search term and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.hometown.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEthnicity =
      !filterEthnicity || student.ethnicity === filterEthnicity;
    const matchesEducation =
      !filterEducation || student.education === filterEducation;

    return matchesSearch && matchesEthnicity && matchesEducation;
  });

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const getEducationDisplay = (education: string) => {
    const educationMap: { [key: string]: string } = {
      ĐH: 'Đại học',
      CĐ: 'Cao đẳng',
      TC: 'Trung cấp',
      '12/12': 'THPT',
      '10/12': 'Lớp 10',
      '9/12': 'THCS',
    };
    return educationMap[education] || education;
  };

  const getHealthDisplay = (health: string) => {
    const healthMap: { [key: string]: string } = {
      '1': 'Loại 1',
      '2': 'Loại 2',
      '3': 'Loại 3',
    };
    return healthMap[health] || health;
  };

  // Get unique values for filters
  const uniqueEthnicities = [...new Set(students.map((s) => s.ethnicity))];
  const uniqueEducationLevels = [...new Set(students.map((s) => s.education))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-6">
        <p>Lỗi: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý học viên</h1>
          <p className="text-gray-600 mt-1">
            Tổng số: {filteredStudents.length} học viên
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <Badge variant="secondary">{students.length} học viên</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Tìm kiếm và lọc</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo tên hoặc quê quán..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filterEthnicity}
              onChange={(e) => setFilterEthnicity(e.target.value)}
            >
              <option value="">Tất cả dân tộc</option>
              {uniqueEthnicities.map((ethnicity) => (
                <option key={ethnicity} value={ethnicity}>
                  {ethnicity}
                </option>
              ))}
            </Select>

            <Select
              value={filterEducation}
              onChange={(e) => setFilterEducation(e.target.value)}
            >
              <option value="">Tất cả trình độ</option>
              {uniqueEducationLevels.map((education) => (
                <option key={education} value={education}>
                  {getEducationDisplay(education)}
                </option>
              ))}
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterEthnicity('');
                setFilterEducation('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    STT
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Họ và tên
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Ngày sinh
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Dân tộc
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Trình độ
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Quê quán
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Đảng/Đoàn
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.full_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.rank} - {student.position}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {student.birth_date}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{student.ethnicity}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        {getEducationDisplay(student.education)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span
                          className="truncate max-w-48"
                          title={student.hometown}
                        >
                          {student.hometown}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          student.party_membership.includes('Đảng')
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {student.party_membership}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(student)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>Không tìm thấy học viên nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Thông tin chi tiết học viên"
        size="xl"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Header with Avatar */}
            <div className="flex items-start gap-6 p-4 bg-gray-50 rounded-lg">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.full_name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedStudent.full_name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedStudent.rank} - {selectedStudent.position}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge
                    variant={
                      selectedStudent.party_membership.includes('Đảng')
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {selectedStudent.party_membership}
                  </Badge>
                  <Badge variant="secondary">{selectedStudent.ethnicity}</Badge>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Thông tin cá nhân</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày sinh:</span>
                    <span className="font-medium">
                      {selectedStudent.birth_date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dân tộc:</span>
                    <span className="font-medium">
                      {selectedStudent.ethnicity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tôn giáo:</span>
                    <span className="font-medium">
                      {selectedStudent.religion}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trình độ văn hóa:</span>
                    <span className="font-medium">
                      {getEducationDisplay(selectedStudent.education)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sức khỏe:</span>
                    <span className="font-medium">
                      {getHealthDisplay(selectedStudent.health)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nhóm máu:</span>
                    <span className="font-medium">
                      {selectedStudent.blood_type || 'Chưa xác định'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Thông tin quân sự</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày nhập ngũ:</span>
                    <span className="font-medium">
                      {selectedStudent.join_date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đơn vị về học:</span>
                    <span className="font-medium text-sm">
                      {selectedStudent.unit}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Family Information */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Thông tin gia đình</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Thông tin bố:</h4>
                    <p className="text-sm">{selectedStudent.father.name}</p>
                    {selectedStudent.father.birth_year && (
                      <p className="text-sm text-gray-600">
                        Sinh năm: {selectedStudent.father.birth_year}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Thông tin mẹ:</h4>
                    <p className="text-sm">{selectedStudent.mother.name}</p>
                    {selectedStudent.mother.birth_year && (
                      <p className="text-sm text-gray-600">
                        Sinh năm: {selectedStudent.mother.birth_year}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Liên hệ khẩn cấp:</h4>
                  <p className="text-sm">
                    {selectedStudent.emergency_contact.relationship}:{' '}
                    {selectedStudent.emergency_contact.phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Thông tin địa chỉ</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Quê quán:</h4>
                  <p className="text-sm text-gray-600">
                    {selectedStudent.hometown}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Chỗ ở hiện tại:</h4>
                  <p className="text-sm text-gray-600">
                    {selectedStudent.current_address}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Năng khiếu</h3>
                </CardHeader>
                <CardContent>
                  {selectedStudent.talents.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.talents.map((talent, index) => (
                        <Badge key={index} variant="success">
                          {talent}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Chưa có thông tin</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Vi phạm</h3>
                </CardHeader>
                <CardContent>
                  {selectedStudent.violations.length > 0 ? (
                    <div className="space-y-2">
                      {selectedStudent.violations.map((violation, index) => (
                        <Badge key={index} variant="destructive">
                          {violation}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">Không có vi phạm</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {selectedStudent.notes && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Ghi chú</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {selectedStudent.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Students;
