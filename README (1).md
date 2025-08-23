# Social Login Service (Prisma + JWT)

This service handles **Google/Facebook or any social login** by checking if a user already exists in the database and creating one if not. It then generates a **JWT access token** for authentication.

---


## ⚙️ socialLogin Service Code

```ts
import { prisma } from "../../../shared/prisma";
import { jwtHelpers } from "../../../helpers/jwtHelper";
import config from "../../../config";
import { Secret } from "jsonwebtoken";

export const socialLogin = async (email: string, name?: string, fcmToken?: string) => {
  try {
    if (!email) {
      throw new Error("Email is required");
    }

    let user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
        fullName: true,
        fcmToken: true,
        status: true,
        role: true,
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email,
          fullName: name || '',
          fcmToken: fcmToken,
          status: 'ACTIVE',
          role: 'USER',
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          fcmToken: true,
          status: true,
          role: true,
        }
      });
    }

    const accessToken = jwtHelpers.generateToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.jwt_secret as Secret,
      config.jwt.expires_in as string
    );

    return { user, token: accessToken };
  } catch (error: any) {
    console.error("Error in socialLogin service:", error.message);
    throw new Error(error.message || "Failed to login or register user via social login");
  }
};
```

---

## 🚀 How It Works
1. **Receive social login details** from client (email, name, fcmToken).
2. **Check if user exists** in database via Prisma.
3. **If user doesn’t exist**, create a new one.
4. **Generate JWT token** with `id`, `email`, and `role`.
5. **Return** user data + token to the controller.

---

## 🛠 Possible Errors & Handling
| Error | Cause | Solution |
|-------|-------|----------|
| `Email is required` | Email not provided from client | Ensure client sends email in request body |
| `PrismaClientValidationError` | Invalid Prisma query (e.g., undefined email) | Validate email before querying |
| `JWT Error` | JWT secret missing | Add `jwt_secret` in `.env` |
| `Database Connection Error` | Prisma can’t connect | Check DB connection & URL in `.env` |

---

## 📬 Example Request (Postman)
**POST** `http://localhost:5000/api/v1/auth/social-login`
```json
{
  "email": "johndoe@gmail.com",
  "name": "John Doe",
  "fcmToken": "your-device-fcm-token"
}
```

**Response**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "64f8a1234abcde",
      "email": "johndoe@gmail.com",
      "fullName": "John Doe",
      "fcmToken": "your-device-fcm-token",
      "status": "ACTIVE",
      "role": "USER"
    },
    "token": "jwt-generated-token"
  }
}
```
