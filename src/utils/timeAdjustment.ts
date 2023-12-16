const adjustTimeFromUTC = (time: string, hours: number) => {
  const thoiGianDat = new Date(time);
  thoiGianDat.setHours(thoiGianDat.getHours() + hours);
  return thoiGianDat.toLocaleString();
};
export default adjustTimeFromUTC;
