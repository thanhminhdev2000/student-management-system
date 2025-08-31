import React from 'react';

import { Card, CardContent } from '@/components/ui';

const Dashboard: React.FC = () => {
  const awards = ['Bung lầm', 'Diện đạp nhận', 'Víc đỏ âm'];

  return (
    <div className="flex min-h-screen red-100">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Tổng số học viên
                  </h3>
                  <p className="text-4xl font-bold text-gray-800">51</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Số lần kiểm tra gần nhất
                  </h3>
                  <p className="text-4xl font-bold text-gray-800">4</p>
                </CardContent>
              </Card>
            </div>

            {/* Alert Students */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Cảnh báo học viên yếu
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm font-medium text-gray-600">
                          Họ tên
                        </th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">
                          Kết quả
                        </th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">
                          Phân hay sai
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3 text-sm text-gray-800">
                          Nguyễn Văn A
                        </td>
                        <td className="py-3 text-sm text-gray-800">3.5</td>
                        <td className="py-3 text-sm text-gray-800">
                          Chiến thuật đại đội
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-sm text-gray-800">
                          Trần Văn B
                        </td>
                        <td className="py-3 text-sm text-gray-800">4.0</td>
                        <td className="py-3 text-sm text-gray-800">
                          Kỹ thuật bắn súng
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-sm text-gray-800">
                          Hoàng Thị C
                        </td>
                        <td className="py-3 text-sm text-gray-800">5.5</td>
                        <td className="py-3 text-sm text-gray-800">
                          Chính trị
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-sm text-gray-800">Lê Văn D</td>
                        <td className="py-3 text-sm text-gray-800">6.0</td>
                        <td className="py-3 text-sm text-gray-800">
                          Kỹ thuật bộ binh
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Performance Pie Chart */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Tỷ lệ học lực
                </h3>

                {/* Simple CSS Pie Chart */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        background: `conic-gradient(
                        #4ade80 0deg 180deg,
                        #fbbf24 180deg 270deg,
                        #f87171 270deg 360deg
                      )`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                    <span className="text-sm text-gray-700">Giỏi</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                    <span className="text-sm text-gray-700">Khá</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                    <span className="text-sm text-gray-700">Yếu</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Awards */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Giải mức
                </h3>

                <div className="space-y-3">
                  {awards.map((award, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{award}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
