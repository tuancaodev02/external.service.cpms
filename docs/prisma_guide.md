# Hướng dẫn sử dụng Prisma ORM

Tài liệu này giải thích các khái niệm cơ bản về Prisma, cách tích hợp và các pattern sử dụng phổ biến trong dự án này.

## 1. Prisma là gì?

**Prisma** là một ORM (Object-Relational Mapper) thế hệ mới cho Node.js và TypeScript. Điểm mạnh nhất của Prisma là **Type-safe** (an toàn kiểu dữ liệu).

- **Schema-First:** Mọi thứ bắt đầu từ file `schema.prisma`. Bạn định nghĩa model ở đây, Prisma sẽ tự động sinh ra câu lệnh SQL để tạo bảng DB và sinh ra Type cho TypeScript.
- **Prisma Client:** Thư viện giúp bạn query database giống như gọi hàm Javascript, không cần viết SQL thuần.
- **Auto-completion:** Nhờ Type-safe, khi code bạn chỉ cần gõ `prisma.users.` là IDE sẽ gợi ý `findMany`, `create`, `update`... và các trường trong bảng.

## 2. Cách tích hợp trong dự án

Trong dự án này, Prisma được tích hợp qua các bước sau:

1.  **Cài đặt:** Các package chính là `prisma` (CLI) và `@prisma/client` (Core).
2.  **Schema:** File `prisma/schema.prisma` chứ định nghĩa Database.
    - Ví dụ: `model Users { ... }` sẽ tạo bảng `users` trong SQL Server.
3.  **Client Instance:** File `src/database/prisma.client.ts` khởi tạo một instance duy nhất (Singleton) của Prisma Client để dùng chung cho toàn app.
    ```typescript
    import { PrismaClient } from '@prisma/client';
    export const prisma = new PrismaClient();
    ```
4.  **Sinh code (Generate):** Mỗi khi sửa file `schema.prisma`, phải chạy lệnh `bun prisma generate` để cập nhật lại file `node_modules/@prisma/client` (nơi chứa các Type).

## 3. Sử dụng với Single Model (Đơn model)

Các thao tác CRUD cơ bản trên 1 bảng đơn giản (ví dụ bảng `Roles`).

### Lấy danh sách (Read)

```typescript
// Lấy tất cả
const roles = await prisma.roles.findMany();

// Lấy có điều kiện (WHERE)
const adminRole = await prisma.roles.findFirst({
    where: { role: 1 }, // role id = 1
});
```

### Tạo mới (Create)

```typescript
const newRole = await prisma.roles.create({
    data: {
        title: 'Moderator',
        role: 3,
        description: 'Quản lý nội dung',
    },
});
```

### Cập nhật (Update)

```typescript
const updatedRole = await prisma.roles.update({
    where: { id: 'uuid-cua-role' }, // Phải update theo @id hoặc @unique
    data: {
        title: 'Super Moderator',
    },
});
```

### Xóa (Delete)

```typescript
await prisma.roles.delete({
    where: { id: 'uuid-cua-role' },
});
```

## 4. Làm việc với Relationships (Quan hệ lồng nhau)

Đây là phần mạnh mẽ nhất của Prisma. Bạn có thể thao tác với nhiều bảng liên quan cùng một lúc (Nested Writes).

### Query lồng nhau (Include)

Khi lấy User, muốn lấy luôn danh sách Role của user đó:

```typescript
const user = await prisma.users.findUnique({
    where: { id: 'user-id' },
    include: {
        userRoles: {
            // Relation tên là userRoles
            include: {
                role: true, // Lấy chi tiết thông tin từ bảng Roles
            },
        },
    },
});
```

### Tạo mới lồng nhau (Nested Create)

Tạo User mới và gán luôn Role cho user đó ngay lập tức:

```typescript
await prisma.users.create({
    data: {
        name: 'Nguyen Van A',
        email: 'a@test.com',
        // ... các field khác
        userRoles: {
            create: [
                {
                    // Tạo một row mới trong bảng UserRoles
                    // Row này sẽ tự động có userId là id của user đang tạo
                    role: {
                        connect: { id: 'role-id-admin' }, // Link row này với Role có sẵn
                    },
                },
            ],
        },
    },
});
```

### Cập nhật quan hệ (Nested Update) - Ví dụ UserRoles

Khi update roles của user, chúng ta thường muốn: **Xóa hết role cũ và Gán role mới**.

Prisma hỗ trợ cú pháp transaction ngầm trong 1 lệnh `update`:

```typescript
await prisma.users.update({
    where: { id: 'user-id' },
    data: {
        userRoles: {
            // 1. Xóa tất cả user_roles hiện có của user này
            deleteMany: {},

            // 2. Tạo các record user_roles mới
            create: [{ role: { connect: { id: 'role-id-1' } } }, { role: { connect: { id: 'role-id-2' } } }],
        },
    },
});
```

### Giải thích Data Flow khi Update Relation

1.  **Bắt đầu:** Lệnh `update` được gọi vào bảng `Users`.
2.  **Delete:** Prisma nhìn thấy `deleteMany` trong relation `userRoles`. Nó tự động chạy SQL: `DELETE FROM user_roles WHERE userId = 'user-id'`.
3.  **Insert:** Prisma nhìn thấy `create`. Nó chạy vòng lặp để `INSERT INTO user_roles (userId, roleId) ...`.
    - `userId` được lấy từ Context của User đang update.
    - `roleId` được lấy từ lệnh `connect: { id: ... }`.

Tất cả chạy trong 1 Database Transaction đảm bảo tính toàn vẹn dữ liệu (nếu bước tạo mới lỗi, bước xóa cũ sẽ được rollback).
