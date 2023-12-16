export type SachType = {
  id: number;
  ten: string;
  moTa: string;
  nxb: string;
  tacGia: string;
  anh: string;
  trangThai: boolean;
  soLuong: number;
  loaiDto: Loai;
  giaSach: Gia;
};

export type Loai = {
  ma: string;
  ten: string;
  parent: string;
};

export type Gia = {
  giaGoc: number;
  giaBan: number;
  thoiGian: GiamGiaPeriod;
  phanTramGiam: number;
};

export type GiamGiaPeriod = {
  startTime: string | null;
  endTime: string | null;
};
