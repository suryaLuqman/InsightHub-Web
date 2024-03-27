# Insight Hub Web API Documentation

[![PostgreSQL Logo](https://img.icons8.com/color/24/000000/postgreesql.png)](#) PostgreSQL v16.2 
&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;[![Node.js Logo](https://img.icons8.com/color/24/000000/nodejs.png)](#) Node.js v16.17.0


## How To Use
### Base url : `https://insight-hub-web.vercel.app`
- [User Authentication](#user-authentication)
  - [Register User](#register-user)
  - [User Login](#user-login)
  - [Forgot Password](#forgot-password)
  - [Change Password](#change-password)
  - [Register Superadmin](#register-superadmin)
  - [Superadmin Login](#superadmin-login)
  - [Register Admin](#register-admin)
  - [Admin Login](#admin-login)
- [Categories](#categories)
  - [Add New Category](#add-new-category)
  - [Get All Categories](#get-all-categories)
  - [Delete Category](#delete-category)
- [Articles](#articles)
  - [Add New Article](#add-new-article)
  - [Get All Articles](#get-all-articles)
  - [Update Article](#update-article)
  - [Delete Article](#delete-article)
  - [Search Article](#search-article)
  - [Save Article](#save-article)
  - [Get Saved Articles](#get-saved-articles)
  - [Rate Article](#rate-article)
  - [Report Article](#report-article)

## User Authentication

### Register User
- **Endpoint:** `/api/v1/auth/register/user`
- **Method:** `POST`
- **Request Body:**
  - `email`: string
  - `password`: string
  - `username`: string
  - `no_hp`: string

### User Login
- **Endpoint:** `/api/v1/auth/login`
- **Method:** `POST`
- **Request Body:**
  - `email`: string
  - `password`: string

### Forgot Password
- **Endpoint:** `/api/v1/auth/forgotPassword`
- **Method:** `POST`
- **Request Body:**
  - `email`: string

### Change Password
- **Endpoint:** `/api/v1/auth/change-password?token={link email params}`
- **Method:** `POST`
- **Request Params:**
  - `token`: string
- **Request Body:**
  - `password`: string
  - `confirm_password`: string

### Register Superadmin
- **Endpoint:** `/api/v1/auth/register/su`
- **Method:** `POST`
- **Request Body:**
  - `email`: string
  - `password`: string
  - `nama`: string

### Superadmin Login
- **Endpoint:** `/api/v1/auth/login`
- **Method:** `POST`
- **Request Body:**
  - `email`: string
  - `password`: string

### Register Admin
- **Endpoint:** `/api/v1/auth/register/admin`
- **Method:** `POST`
- **Request Body:**
  - `email`: string
  - `password`: string
  - `nama`: string
- **Request Headers:**
  - `Authorization: Bearer <token_didapat_saat_login_dengan_superUser_dan_token_akan_nonAktif_lebih_dari_1_hari>`

### Admin Login
- **Endpoint:** `/api/v1/auth/login`
- **Method:** `POST`
- **Request Body:**
  - `email`: string
  - `password`: string

## Categories

### Add New Category
- **Endpoint:** `/api/v1/kategori/add`
- **Method:** `POST`
- **Request Body:**
  - `nama`: string
  - `deskripsi`: string

### Get All Categories
- **Endpoint:** `/api/v1/kategori/get-all`
- **Method:** `GET`

### Delete Category
- **Endpoint:** `/api/v1/kategori/delete/:id`
- **Method:** `DELETE`

## Articles

### Add New Article
- **Endpoint:** `/api/v1/artikel/upload`
- **Method:** `POST`
- **Request Body:**
  - `judul`: string
  - `deskripsi`: string
  - `link`: string
  - `gambar_artikel`: file
  - `kategoriId`: number
- **Request Headers:**
  - `Authorization: Bearer <user_token_here>`

### Get All Articles
- **Endpoint:** `/api/v1/artikel/get-all`
- **Method:** `GET`

### Update Article
- **Endpoint:** `/api/v1/artikel/updateArtikel/:id`
- **Method:** `PUT`
- **Request Body:**
  - `judul`: string
  - `deskripsi`: string
  - `link`: string
  - `kategoriId`: number
  - `gambar_artikel`: file
- **Request Headers:**
  - `Authorization: Bearer <user_token_here>`

### Delete Article
- **Endpoint:** `/api/v1/artikel/delete/:id`
- **Method:** `DELETE`

### Search Article
- **Endpoint:** `/api/v1/search-artikel/search?:param=key`
- **Method:** `GET`

### Save Article
- **Endpoint:** `/api/v1/artikel/save/:artikelId`
- **Method:** `POST`
- **Request Headers:**
  - `Authorization: Bearer <user_token_here>`

### Get Saved Articles
- **Endpoint:** `/api/v1/artikel/saved`
- **Method:** `GET`
- **Request Headers:**
  - `Authorization: Bearer <user_token_here>`

### Rate Article
- **Endpoint:** `/api/v1/artikel/rate/:artikelId`
- **Method:** `POST`
- **Request Body:**
  - `nilai`: number
- **Request Headers:**
  - `Authorization: Bearer <user_token_here>`

### Report Article
- **Endpoint:** `/api/v1/artikel/report/:artikelId`
- **Method:** `POST`
- **Request Body:**
  - `alasan`: string
- **Request Headers:**
  - `Authorization: Bearer <user_token_here>`
