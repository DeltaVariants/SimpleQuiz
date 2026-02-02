# JWT (JSON Web Token)

## Giới thiệu

JWT là một chuẩn mở (RFC 7519) để truyền thông tin an toàn giữa các bên dưới dạng JSON object. JWT thường được sử dụng cho xác thực và trao đổi thông tin.

## Cấu trúc JWT

JWT bao gồm **3 phần** được phân tách bởi dấu chấm (`.`):

```
xxxxx.yyyyy.zzzzz
```

### 1. Header (Phần đầu)

**Header** thường bao gồm 2 phần:

- `alg`: Thuật toán mã hóa được sử dụng (ví dụ: HS256, RS256)
- `typ`: Loại token (thường là "JWT")

**Ví dụ:**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Header này sẽ được **Base64Url encode** để tạo thành phần đầu tiên của JWT.

### 2. Payload (Phần dữ liệu)

**Payload** chứa các **claims** (tuyên bố) - là thông tin về entity (thường là user) và các metadata khác.

Có 3 loại claims:

- **Registered claims**: Các claims được đề xuất (không bắt buộc) như `iss` (issuer), `exp` (expiration time), `sub` (subject), `aud` (audience)
- **Public claims**: Các claims tự định nghĩa nhưng phải tránh xung đột
- **Private claims**: Các claims tùy chỉnh để chia sẻ thông tin giữa các bên

**Ví dụ:**

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true,
  "iat": 1516239022
}
```

Payload cũng được **Base64Url encode** để tạo thành phần thứ hai của JWT.

**Lưu ý**: Thông tin trong Header và Payload có thể decode dễ dàng, vì vậy **KHÔNG nên** lưu thông tin nhạy cảm (như mật khẩu) trong đó.

### 3. Signature (Chữ ký)

**Signature** được tạo ra bằng cách:

1. Lấy encoded header
2. Lấy encoded payload
3. Kết hợp chúng với dấu chấm
4. Mã hóa bằng thuật toán đã chọn cùng với secret key

**Công thức:**

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

**Mục đích của Signature:**

- Xác minh rằng thông tin không bị thay đổi trong quá trình truyền
- Nếu sử dụng private key để ký, signature cũng xác minh người gửi

## Ví dụ JWT hoàn chỉnh

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Phân tích:

- **Header**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- **Payload**: `eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ`
- **Signature**: `SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

## Cách hoạt động

1. **Đăng nhập**: User gửi credentials → Server xác thực và tạo JWT
2. **Lưu trữ**: Client lưu JWT (thường trong localStorage hoặc cookie)
3. **Gửi request**: Client gửi JWT trong header `Authorization: Bearer <token>`
4. **Xác thực**: Server verify signature và kiểm tra expiration
5. **Phản hồi**: Nếu hợp lệ, server xử lý request và trả về dữ liệu

## Ưu điểm

- **Stateless**: Server không cần lưu session
- **Có thể mở rộng**: Phù hợp với kiến trúc microservices
- **Bảo mật**: Không thể giả mạo do có signature
- **Đa nền tảng**: Hoạt động tốt với mobile, web, API

## Lưu ý bảo mật

- Luôn sử dụng HTTPS để truyền JWT
- Đặt thời gian hết hạn hợp lý (`exp`)
- Bảo vệ secret key cẩn thận
- Không lưu thông tin nhạy cảm trong payload
- Sử dụng refresh token cho session dài hạn
