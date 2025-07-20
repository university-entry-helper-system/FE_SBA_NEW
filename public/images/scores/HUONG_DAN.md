# Hướng dẫn thêm ảnh phổ điểm

## Cách 1: Tải ảnh về và lưu locally (Khuyến khích)

### Bước 1: Tải ảnh từ link

- Truy cập: https://xdcs.cdnchinhphu.vn/446259493575335936/2025/7/15/phodiemmontoan-1752569735706647198002.jpg
- Click chuột phải → "Save image as" / "Lưu ảnh"
- Đặt tên file: `toan-2025.jpg`

### Bước 2: Lưu ảnh vào thư mục phù hợp

- **Cho THPT**: Copy vào `public/images/scores/thpt/toan-2025.jpg`
- **Cho DGNL HCM**: Copy vào `public/images/scores/dgnl-hcm/toan-2025.jpg`
- **Cho DGNL Hanoi**: Copy vào `public/images/scores/dgnl-hanoi/toan-2025.jpg`

### Bước 3: Thêm các ảnh khác

Tương tự với các môn khác:

- `van-2025.jpg` (Văn)
- `anh-2025.jpg` (Tiếng Anh)
- `ly-2025.jpg` (Vật Lý)
- `hoa-2025.jpg` (Hóa Học)
- `sinh-2025.jpg` (Sinh Học)
- `su-2025.jpg` (Lịch Sử)
- `dia-2025.jpg` (Địa Lý)
- `gdcd-2025.jpg` (GDCD)
- `ktpl-2025.jpg` (Kinh tế pháp luật)
- `cncn-2025.jpg` (Công nghệ công nghiệp)
- `cnnn-2025.jpg` (Công nghệ nông nghiệp)
- `tin-2025.jpg` (Tin Học)

## Cách 2: Sử dụng link trực tiếp (Không khuyến khích)

Nếu muốn sử dụng link trực tiếp, có thể chỉnh sửa code như sau:

```tsx
const subjects = [
  {
    name: "Toán",
    image:
      selectedYear === "2025" && subject === "Toán"
        ? "https://xdcs.cdnchinhphu.vn/446259493575335936/2025/7/15/phodiemmontoan-1752569735706647198002.jpg"
        : "/images/scores/thpt/toan-" + selectedYear + ".jpg",
  },
  // ... các môn khác
];
```

## Lưu ý:

- Tên file phải đúng format: `[tenmon]-[nam].jpg`
- Sử dụng ảnh local tốt hơn cho hiệu suất và độ tin cậy
- Kiểm tra kích thước ảnh để tối ưu tải trang
