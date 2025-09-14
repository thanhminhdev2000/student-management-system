import React from 'react';
import type { Student } from '../types';

interface Props {
  students: Student[];
  onDeleteStudent: (id: number) => void;
}

const StudentList: React.FC<Props> = ({ students, onDeleteStudent }) => {
  const handleDelete = (student: Student) => {
    if (window.confirm(`Bạn có chắc muốn xóa học viên ${student.name}?`)) {
      onDeleteStudent(student.id);
    }
  };

  return (
    <div>
      <h3>Danh sách học viên ({students.length})</h3>

      {students.length === 0 ? (
        <p style={{ color: '#666' }}>Chưa có học viên nào</p>
      ) : (
        <div>
          {students.map((student) => (
            <div
              key={student.id}
              style={{
                border: '1px solid #ddd',
                margin: '10px 0',
                padding: '15px',
                borderRadius: '5px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>{student.name}</strong>
                  {student.unit && (
                    <span style={{ color: '#666', marginLeft: '10px' }}>
                      ({student.unit})
                    </span>
                  )}
                  <br />
                  <small style={{ color: '#888' }}>
                    Thêm ngày:{' '}
                    {new Date(student.createdAt).toLocaleDateString('vi-VN')}
                  </small>
                </div>
                <button
                  onClick={() => handleDelete(student)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentList;
