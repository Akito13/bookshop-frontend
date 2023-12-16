export type OrderType = {
  donhangId: number;
  sdt: string;
  diaChi: string;
  tenNguoiNhan: string;
  thoiGianDat: string;
  thoiGianXuat: string;
  nguoiDungId: number;
  trangThai: OrderStatusType;
  tongTien: number;
  orderDetails: OrderDetailsType[];
};
export type OrderStatusType = {
  trangThaiId: string;
  tenTrangThai: string;
};

export type OrderDetailsType = {
  sachId: number;
  tenSach: string;
  soLuong: number;
  donGia: number;
  tongTien: number;
  phanTramGiam: number;
};
