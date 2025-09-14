import React, { useState } from 'react';
import type { Student } from '../types';
import { studentAPI } from '../services/api';

interface Props {
  onStudentAdded: (student: Student) => void;
}

const StudentForm: React.FC<Props> = ({ onStudentAdded }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Vui lòng nhập họ tên');
      return;
    }

    setLoading(true);
    try {
      const newStudent = await studentAPI.create({
        name: name.trim(),
        unit: unit.trim(),
        classId: 1, // Default class for MVP
      });

      onStudentAdded(newStudent);
      setName('');
      setUnit('');
      alert('Thêm học viên thành công!');
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Có lỗi xảy ra khi thêm học viên');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: '20px',
        padding: '20px',
        border: '1px solid #ccc',
      }}
    >
      <h3>Thêm học viên mới</h3>

      <div style={{ marginBottom: '10px' }}>
        <label>Họ tên:</label>
        <br />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập họ tên"
          style={{ width: '300px', padding: '5px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Đơn vị:</label>
        <br />
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Nhập đơn vị"
          style={{ width: '300px', padding: '5px' }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Đang thêm...' : 'Thêm học viên'}
      </button>
    </form>
  );
};

export default StudentForm;
