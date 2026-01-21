# Tài Liệu Dự Án - External Service CPMS

## 1. Tổng Quan Dự Án

**External Service CPMS** (Capstone Project Management System) là một RESTful API service được xây dựng để quản lý hệ thống quản lý dự án capstone. Dự án được phát triển bằng TypeScript, sử dụng Bun runtime, Express.js framework và Prisma ORM để tương tác với SQL Server database.

### 1.1. Công Nghệ Sử Dụng

- **Runtime**: Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: SQL Server
- **Authentication**: JWT (JSON Web Token) với RSA keys
- **Validation**: class-validator, class-transformer
- **Email**: Nodemailer
- **Password Hashing**: bcryptjs
- **Timezone**: moment-timezone

### 1.2. Cấu Trúc Dự Án

```
external.service.cpms/
├── src/
│   ├── controllers/        # Xử lý HTTP requests/responses
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer
│   ├── routes/             # API route definitions
│   ├── database/
│   │   ├── entities/       # Database entity definitions
│   │   └── connect.database.ts
│   ├── core/
│   │   ├── configs/        # Configuration files
│   │   ├── constants/      # Application constants
│   │   ├── decorators/     # Custom decorators
│   │   ├── helpers/        # Utility helpers
│   │   ├── interfaces/     # TypeScript interfaces
│   │   ├── middlewares/    # Express middlewares
│   │   └── utils/          # Utility functions
│   └── index.ts            # Application entry point
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding
├── scripts/                # Utility scripts
├── docs/                   # Documentation
└── package.json
```

## 2. Kiến Trúc Hệ Thống

### 2.1. Kiến Trúc Layered

Dự án tuân theo kiến trúc layered (phân lớp) với các tầng:

1. **Controller Layer**: Xử lý HTTP requests, validation đầu vào, và trả về responses
2. **Service Layer**: Chứa business logic và xử lý nghiệp vụ
3. **Repository Layer**: Tương tác trực tiếp với database thông qua Prisma
4. **Entity Layer**: Định nghĩa các model dữ liệu

### 2.2. Flow Xử Lý Request

```
HTTP Request
    ↓
Route Handler
    ↓
Middleware (Authentication, Validation)
    ↓
Controller
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Database (SQL Server)
```

## 3. Cài Đặt và Cấu Hình

### 3.1. Yêu Cầu Hệ Thống

- Bun runtime (latest version)
- SQL Server database
- Node.js (nếu cần thiết cho một số tools)

### 3.2. Cài Đặt Dependencies

```bash
# Cài đặt dependencies
bun install

# Generate Prisma client
bun run prisma:generate
```

### 3.3. Cấu Hình Environment Variables

Tạo file `.env` trong root directory với các biến sau:

```env
# Database
DB_URL="sqlserver://username:password@host:port/database?schema=public"

# Authentication (RSA Keys)
AUTH_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
AUTH_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Email Configuration
EMAIL_ADDRESS="your-email@example.com"
EMAIL_PASSCODE="your-email-password"

# Server
PORT=5000
```

**Lưu ý**: Để generate RSA keys, chạy lệnh:

```bash
bun run generate:keys
```

### 3.4. Database Setup

```bash
# Tạo migration và apply vào database
bun run prisma:migrate:dev

# Hoặc push schema trực tiếp (development only)
bun run prisma:db:push

# Seed database với dữ liệu mẫu
bun run prisma:db:seed

# Reset database và seed lại
bun run db:reset
```

## 4. Chạy Ứng Dụng

### 4.1. Development Mode

```bash
# Chạy với hot reload
bun run dev

# Chạy với debug mode
bun run dev:debug
```

### 4.2. Production Mode

```bash
# Build ứng dụng
bun run build

# Chạy production
bun run production
```

### 4.3. Docker

```bash
# Build Docker image
bun run docker-build

# Chạy Docker container
bun run docker-run
```

## 5. API Endpoints

### 5.1. Base Path

Tất cả API endpoints được prefix với `/api` (có thể cấu hình trong `APP_PATH` constant).

### 5.2. Các Module API

#### Authentication (`/api/auth`)

- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập

#### Role Management (`/api/role`)

- Quản lý roles và permissions

#### School Management (`/api/school`)

- CRUD operations cho schools

#### Curriculum Management (`/api/curriculum`)

- Quản lý chương trình đào tạo

#### Faculty Management (`/api/faculty`)

- Quản lý khoa/ngành

#### Course Management (`/api/course`)

- Quản lý khóa học

#### Course Requirement (`/api/course-requirement`)

- Quản lý yêu cầu của khóa học

#### User Management (`/api/user`)

- Quản lý users

#### News Management (`/api/news`)

- Quản lý tin tức

#### Admissions (`/api/admissions`)

- Quản lý đơn tuyển sinh

### 5.3. Authentication

Hệ thống sử dụng JWT authentication với RSA keys:

- Access token được sử dụng để xác thực các API requests
- Refresh token được sử dụng để lấy access token mới
- Middleware `auth.middleware.ts` xử lý việc verify JWT tokens

## 6. Database Schema

### 6.1. Các Entity Chính

#### User

- Thông tin người dùng (name, email, phone, address, birthday)
- Quan hệ với Role (many-to-many)
- Quan hệ với Course (many-to-many)

#### Role

- Định nghĩa các vai trò trong hệ thống
- Quan hệ với User (many-to-many)

#### School

- Thông tin trường học

#### Curriculum

- Chương trình đào tạo
- Quan hệ với Faculty (one-to-many)

#### Faculty

- Khoa/ngành
- Quan hệ với Curriculum (many-to-one)
- Quan hệ với Course (one-to-many)

#### Course

- Khóa học
- Quan hệ với Faculty (many-to-one)
- Quan hệ với User (many-to-many)
- Quan hệ với CourseRequirement (one-to-many)

#### CourseRequirement

- Yêu cầu của khóa học
- Quan hệ với Course (many-to-one)

#### UserCourse

- Bảng trung gian giữa User và Course
- Lưu trạng thái đăng ký khóa học

#### CourseRegister

- Đơn đăng ký khóa học

#### News

- Tin tức, thông báo

#### Admission

- Đơn tuyển sinh

#### Contact

- Thông tin liên hệ

### 6.2. Relationships

```
User ←→ Role (Many-to-Many via UserRole)
User ←→ Course (Many-to-Many via UserCourse)
Curriculum → Faculty (One-to-Many)
Faculty → Course (One-to-Many)
Course → CourseRequirement (One-to-Many)
User → CourseRegister (One-to-Many)
```

## 7. Core Features

### 7.1. Validation

Sử dụng `class-validator` và custom decorator `@Required` để validate request payloads:

```typescript
@Required(LoginPayloadFilterModel)
public async login(req: Request, res: Response)
```

### 7.2. Error Handling

- Exception controller xử lý các lỗi không được handle
- Response handler helper chuẩn hóa format response

### 7.3. CORS Configuration

Hệ thống hỗ trợ CORS với whitelist các origins:

- `http://localhost:3000`
- `http://localhost:5173`
- `https://external-portal-client-cpms.vercel.app`
- `https://external-portal-admin-cpms.vercel.app`
- `https://service-cpms.vercel.app`

### 7.4. Timezone

Sử dụng `moment-timezone` để xử lý timezone trong ứng dụng.

## 8. Development Workflow

### 8.1. Code Style

- Sử dụng Prettier để format code
- Format code: `bun run prettier:format`
- Format tất cả: `bun run prettier:format:all`

### 8.2. Database Migrations

```bash
# Tạo migration mới
bun run prisma:migrate:dev

# Xem trạng thái migrations
bun run prisma:migrate:status

# Deploy migrations (production)
bun run prisma:migrate:deploy

# Reset database
bun run prisma:migrate:reset
```

### 8.3. Prisma Studio

Xem và chỉnh sửa database trực quan:

```bash
bun run prisma:studio
```

## 9. Testing

```bash
# Chạy tests
bun test
```

## 10. Deployment

### 10.1. Vercel

Dự án có file `vercel.json` để deploy lên Vercel. Đảm bảo cấu hình environment variables trên Vercel dashboard.

### 10.2. Docker

Sử dụng Dockerfile và docker-compose để containerize ứng dụng:

```bash
# Build image
docker build -t external.services.cpms-docker-server .

# Run container
docker run -d -p 3000:3000 external.services.cpms-docker-server
```

## 11. Scripts Available

| Script               | Mô tả                                  |
| -------------------- | -------------------------------------- |
| `dev`                | Chạy development server với hot reload |
| `dev:debug`          | Chạy với debug mode                    |
| `build`              | Build ứng dụng cho production          |
| `start`              | Chạy production build                  |
| `test`               | Chạy tests                             |
| `prisma:generate`    | Generate Prisma client                 |
| `prisma:studio`      | Mở Prisma Studio                       |
| `prisma:migrate:dev` | Tạo và apply migration                 |
| `prisma:db:push`     | Push schema vào database               |
| `prisma:db:seed`     | Seed database                          |
| `db:reset`           | Reset và seed database                 |
| `generate:keys`      | Generate RSA keys cho JWT              |

## 12. Best Practices

1. **Validation**: Luôn validate input data ở controller layer
2. **Error Handling**: Sử dụng exception controller để handle errors
3. **Security**:
    - Không commit sensitive data (keys, passwords) vào git
    - Sử dụng environment variables cho configuration
    - Hash passwords với bcryptjs
4. **Database**:
    - Sử dụng migrations thay vì direct schema changes
    - Backup database trước khi chạy migrations quan trọng
5. **Code Organization**:
    - Tuân theo cấu trúc layered architecture
    - Tách biệt concerns (controller, service, repository)

## 13. Troubleshooting

### Database Connection Issues

- Kiểm tra `DB_URL` trong `.env`
- Đảm bảo SQL Server đang chạy và accessible
- Kiểm tra network/firewall settings

### JWT Authentication Issues

- Kiểm tra RSA keys đã được generate và cấu hình đúng
- Verify keys format (phải có newlines `\n`)

### CORS Issues

- Kiểm tra origin trong whitelist
- Verify CORS configuration trong `index.ts`

## 14. Tài Liệu Tham Khảo

- [Bun Documentation](https://bun.sh/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Lưu ý**: Tài liệu này được tạo tự động và có thể cần cập nhật khi có thay đổi trong dự án. Vui lòng cập nhật tài liệu khi thêm features mới hoặc thay đổi cấu trúc dự án.
