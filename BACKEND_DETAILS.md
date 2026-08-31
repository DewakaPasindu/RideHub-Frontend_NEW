# RideHub — Laravel Backend Integration Guide

> **Purpose:** This document is a complete reference for building the Laravel REST API backend for the RideHub frontend.  
> Paste this entire file into ChatGPT and ask it to generate each section of the Laravel codebase.

---

## 1. Project Overview

**Platform:** RideHub — Vehicle Rental & Driver Hiring Platform (Sri Lanka)  
**Core Services:**
1. Vehicle Rental (self-drive — no driver)
2. Vehicle Rental With Driver (full service)
3. Driver Hire (customer's own vehicle)

**Frontend:** React + TypeScript (Vite), deployed separately  
**Backend:** Laravel 11 REST API  
**AI Services:** Python microservice (separate, called from Laravel)  
**Real-Time:** Laravel Broadcasting + Pusher (WebSockets)  
**Database:** MySQL / PostgreSQL  

---

## 2. Tech Stack Requirements

| Layer | Technology |
|---|---|
| Framework | Laravel 11 |
| Auth | Laravel Sanctum (token-based) |
| Database | MySQL 8.0+ or PostgreSQL 15+ |
| File Storage | Laravel Storage (S3 or local) |
| Real-Time | Laravel Broadcasting + Pusher |
| Queue | Laravel Queues (Redis or database driver) |
| Cache | Redis |
| API Format | JSON REST API |
| CORS | `fruitcake/laravel-cors` (or Laravel built-in) |

---

## 3. Base API Configuration

### 3.1 Base URL Structure
```
https://api.ridehub.lk/api/v1/{endpoint}
```

### 3.2 Required CORS Headers (all responses)
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept
```

### 3.3 Standard Response Envelope
Every API response MUST follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 12,
    "total": 60
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

**Paginated List:**
```json
{
  "success": true,
  "data": [ ...items ],
  "count": 60,
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 12,
    "total": 60
  }
}
```

The frontend reads `data.data` for item arrays, `data.count` for total count.

---

## 4. Authentication Endpoints

> Auth uses **Laravel Sanctum** — token-based (not session).  
> Frontend sends `Authorization: Bearer {token}` on every protected request.

### 4.1 POST `/api/auth/register`
Register a new user (customer or driver).

**Request Body:**
```json
{
  "first_name": "Nuwan",
  "last_name": "Perera",
  "email": "nuwan@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "0771234567",
  "role": "customer"
}
```

**Response `data`:**
```json
{
  "token": "sanctum_token_here",
  "user": {
    "id": "uuid",
    "name": "Nuwan Perera",
    "email": "nuwan@example.com",
    "phone": "0771234567",
    "role": "customer",
    "isDriver": false,
    "isAdmin": false
  }
}
```

### 4.2 POST `/api/auth/login`

**Request Body:**
```json
{
  "email": "nuwan@example.com",
  "password": "password123"
}
```

**Response:** Same shape as register.

### 4.3 POST `/api/auth/logout` *(protected)*
Revoke current token. Returns `{ "success": true }`.

### 4.4 POST `/api/auth/refresh` *(protected)*
Refresh expired token. Returns `{ "data": { "token": "new_token" } }`.

### 4.5 POST `/api/auth/forgot-password`
Send password reset email.

### 4.6 POST `/api/auth/reset-password`
Reset password using token from email.

### 4.7 GET `/api/auth/me` *(protected)*
Returns current authenticated user object.

---

## 5. Database Schema

### 5.1 users
```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT (UUID()),
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  phone       VARCHAR(20),
  avatar      VARCHAR(500),
  role        ENUM('customer','driver','admin','superadmin') DEFAULT 'customer',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP,
  updated_at  TIMESTAMP
);
```

### 5.2 admin_users
```sql
CREATE TABLE admin_users (
  id            UUID PRIMARY KEY,
  user_id       UUID REFERENCES users(id),
  username      VARCHAR(100) UNIQUE NOT NULL,
  role          ENUM('admin','superadmin','manager') DEFAULT 'admin',
  is_active     BOOLEAN DEFAULT true,
  created_by    UUID REFERENCES admin_users(id),
  created_at    TIMESTAMP,
  updated_at    TIMESTAMP
);
```

### 5.3 vehicles
```sql
CREATE TABLE vehicles (
  id               UUID PRIMARY KEY,
  owner_id         UUID REFERENCES users(id),
  brand            VARCHAR(100) NOT NULL,
  model            VARCHAR(100) NOT NULL,
  year             SMALLINT NOT NULL,
  vehicle_number   VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type     ENUM('car','suv','van','minibus','bus','truck') NOT NULL,
  fuel_type        ENUM('petrol','diesel','electric','hybrid') NOT NULL,
  transmission     ENUM('manual','automatic') NOT NULL,
  seat_count       TINYINT NOT NULL,
  has_ac           BOOLEAN DEFAULT false,
  price_per_day    DECIMAL(10,2) NOT NULL,
  nearest_town     VARCHAR(100),
  location_lat     DECIMAL(10,7),
  location_lng     DECIMAL(10,7),
  features         JSON,
  images           JSON,
  description      TEXT,
  approval_status  ENUM('pending','approved','rejected') DEFAULT 'pending',
  rejection_reason VARCHAR(500),
  available_from   DATE,
  available_to     DATE,
  created_at       TIMESTAMP,
  updated_at       TIMESTAMP
);
```

### 5.4 driver_profiles
```sql
CREATE TABLE driver_profiles (
  id                UUID PRIMARY KEY,
  user_id           UUID REFERENCES users(id) UNIQUE,
  license_number    VARCHAR(100) NOT NULL,
  license_type      ENUM('light','heavy') NOT NULL,
  experience_years  SMALLINT NOT NULL,
  specialties       JSON,
  profile_photo     VARCHAR(500),
  nearest_town      VARCHAR(100),
  location_lat      DECIMAL(10,7),
  location_lng      DECIMAL(10,7),
  availability_status ENUM('available','unavailable','on_trip') DEFAULT 'available',
  rating            DECIMAL(3,2) DEFAULT 0.00,
  review_count      INT DEFAULT 0,
  approval_status   ENUM('pending','approved','rejected') DEFAULT 'pending',
  rejection_reason  VARCHAR(500),
  created_at        TIMESTAMP,
  updated_at        TIMESTAMP
);
```

### 5.5 bookings
```sql
CREATE TABLE bookings (
  id                UUID PRIMARY KEY,
  user_id           UUID REFERENCES users(id),
  booking_type      ENUM('vehicle','driver') NOT NULL,
  vehicle_id        UUID REFERENCES vehicles(id) NULLABLE,
  driver_profile_id UUID REFERENCES driver_profiles(id) NULLABLE,
  driver_assigned_id UUID REFERENCES driver_profiles(id) NULLABLE,
  target_name       VARCHAR(200),
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  start_time        TIME,
  end_time          TIME,
  pickup_location   TEXT NOT NULL,
  dropoff_location  TEXT,
  pickup_lat        DECIMAL(10,7),
  pickup_lng        DECIMAL(10,7),
  dropoff_lat       DECIMAL(10,7),
  dropoff_lng       DECIMAL(10,7),
  passenger_count   TINYINT DEFAULT 1,
  ac_preference     ENUM('any','required','none') DEFAULT 'any',
  total_amount      DECIMAL(10,2) DEFAULT 0,
  advance_amount    DECIMAL(10,2) DEFAULT 0,
  status            ENUM('pending','approved','rejected','active','completed','cancelled') DEFAULT 'pending',
  rejection_reason  VARCHAR(500),
  notes             TEXT,
  created_at        TIMESTAMP,
  updated_at        TIMESTAMP
);
```

### 5.6 reviews
```sql
CREATE TABLE reviews (
  id              UUID PRIMARY KEY,
  user_id         UUID REFERENCES users(id),
  booking_id      UUID REFERENCES bookings(id),
  reviewable_type ENUM('vehicle','driver') NOT NULL,
  reviewable_id   UUID NOT NULL,
  rating          TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMP,
  updated_at      TIMESTAMP,
  UNIQUE (booking_id, reviewable_type)
);
```

### 5.7 driver_availability
```sql
CREATE TABLE driver_availability (
  id                UUID PRIMARY KEY,
  driver_profile_id UUID REFERENCES driver_profiles(id),
  date              DATE NOT NULL,
  is_available      BOOLEAN DEFAULT true,
  start_time        TIME,
  end_time          TIME,
  notes             VARCHAR(500),
  created_at        TIMESTAMP,
  updated_at        TIMESTAMP,
  UNIQUE (driver_profile_id, date)
);
```

### 5.8 location_tracking
```sql
CREATE TABLE location_tracking (
  id          UUID PRIMARY KEY,
  entity_type ENUM('user','driver','vehicle') NOT NULL,
  entity_id   UUID NOT NULL,
  lat         DECIMAL(10,7) NOT NULL,
  lng         DECIMAL(10,7) NOT NULL,
  accuracy    DECIMAL(8,2),
  heading     DECIMAL(5,2),
  speed       DECIMAL(8,2),
  recorded_at TIMESTAMP NOT NULL,
  created_at  TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_recorded (recorded_at)
);
```

### 5.9 notifications
```sql
CREATE TABLE notifications (
  id         UUID PRIMARY KEY,
  user_id    UUID REFERENCES users(id),
  type       VARCHAR(100) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  data       JSON,
  read_at    TIMESTAMP NULLABLE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 6. Vehicle API Endpoints

### 6.1 GET `/api/vehicles`
List vehicles with filtering, pagination.

**Query Parameters (all optional):**
```
search          string    Search brand/model/number
vehicle_type    string    car|suv|van|minibus|bus|truck
vehicle_model   string    Specific model name (e.g. Toyota HiAce)
fuel_type       string    petrol|diesel|electric|hybrid
transmission    string    manual|automatic
has_ac          boolean   
min_seats       integer   
nearest_town    string    
min_price       number    Price per day minimum
max_price       number    Price per day maximum
budget_per_km   number    Calculate max price from km budget
with_driver     boolean   Filter for vehicles where driver is included/not
approval_status string    approved (default for public)
sort            string    created_at_desc|price_asc|price_desc|year_desc
page            integer   Default: 1
per_page        integer   Default: 12, max: 50
location_lat    float     For proximity sorting
location_lng    float     For proximity sorting
```

**`budget_per_km` logic in Laravel:**
```php
if ($request->budget_per_km) {
    // If distance is unknown, use 100km as reference
    $maxPriceFromKm = $request->budget_per_km * ($request->distance_km ?? 100);
    $query->where('price_per_day', '<=', $maxPriceFromKm);
}
```

**Response `data`:** Array of vehicle objects + `count` total.

**Vehicle Object:**
```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "brand": "Toyota",
  "model": "HiAce",
  "year": 2020,
  "vehicle_number": "CAB-1234",
  "vehicle_type": "van",
  "fuel_type": "diesel",
  "transmission": "manual",
  "seat_count": 14,
  "has_ac": true,
  "price_per_day": 12000.00,
  "nearest_town": "Colombo",
  "location_lat": 6.9271,
  "location_lng": 79.8612,
  "features": ["GPS", "Luggage Rack"],
  "images": ["https://..."],
  "description": "...",
  "approval_status": "approved",
  "avg_rating": 4.5,
  "review_count": 12,
  "created_at": "2024-01-15T10:00:00Z"
}
```

### 6.2 GET `/api/vehicles/{id}`
Returns single vehicle with owner info and recent reviews.

### 6.3 POST `/api/vehicles` *(protected)*
Create vehicle listing.

**Request (multipart/form-data or JSON):**
```json
{
  "brand": "Toyota",
  "model": "HiAce",
  "year": 2020,
  "vehicle_number": "CAB-1234",
  "vehicle_type": "van",
  "fuel_type": "diesel",
  "transmission": "manual",
  "seat_count": 14,
  "has_ac": true,
  "price_per_day": 12000,
  "nearest_town": "Colombo",
  "location_lat": 6.9271,
  "location_lng": 79.8612,
  "features": ["GPS"],
  "description": "...",
  "images": ["base64..."] 
}
```

### 6.4 PUT `/api/vehicles/{id}` *(protected, owner only)*
Update vehicle. Same fields as create.

### 6.5 DELETE `/api/vehicles/{id}` *(protected, owner only)*
Soft delete vehicle.

### 6.6 GET `/api/vehicles/my` *(protected)*
List vehicles owned by authenticated user.

### 6.7 POST `/api/admin/vehicles/{id}/approve` *(admin)*
Approve vehicle listing.

### 6.8 POST `/api/admin/vehicles/{id}/reject` *(admin)*
```json
{ "reason": "Documents incomplete" }
```

---

## 7. Driver API Endpoints

### 7.1 GET `/api/drivers`
List driver profiles with filtering.

**Query Parameters:**
```
search              string    Name, town
min_experience      integer   Minimum years
max_experience      integer   Maximum years
min_rating          float     e.g. 4.0
nearest_town        string    
specialty           string    Long Distance|Tour Guide|etc.
availability_status string    available|unavailable
license_type        string    light|heavy
budget_per_day      number    Max daily rate
location_lat        float     For proximity scoring
location_lng        float     For proximity scoring
approval_status     string    approved (default)
sort                string    rating_desc|experience_desc|experience_asc
page                integer
per_page            integer
```

**`budget_per_day` logic:**
```php
// Filter drivers whose daily rate is within budget
// Requires a daily_rate field on driver_profiles or a separate rate table
$query->where('daily_rate', '<=', $request->budget_per_day);
```

**`license_type` logic:**
- `light` → cars, SUVs, vans (seat count ≤ 8 typically)
- `heavy` → buses, trucks, lorries (commercial license required)

**Driver Profile Object:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "user": {
    "first_name": "Kasun",
    "last_name": "Silva",
    "phone": "0771234567"
  },
  "license_number": "B1234567",
  "license_type": "light",
  "experience_years": 8,
  "specialties": ["Long Distance", "Tour Guide"],
  "profile_photo": "https://...",
  "nearest_town": "Kandy",
  "location_lat": 7.2906,
  "location_lng": 80.6337,
  "availability_status": "available",
  "daily_rate": 3500.00,
  "rating": 4.8,
  "review_count": 24,
  "approval_status": "approved",
  "created_at": "2024-01-10T08:00:00Z"
}
```

### 7.2 GET `/api/drivers/{id}`
Single driver with reviews.

### 7.3 POST `/api/drivers/register` *(protected)*
Register as driver.

```json
{
  "license_number": "B1234567",
  "license_type": "light",
  "experience_years": 8,
  "specialties": ["Long Distance"],
  "nearest_town": "Kandy",
  "daily_rate": 3500,
  "profile_photo": "base64..."
}
```

### 7.4 PUT `/api/drivers/{id}` *(protected)*
Update driver profile.

### 7.5 POST `/api/admin/drivers/{id}/approve` *(admin)*
### 7.6 POST `/api/admin/drivers/{id}/reject` *(admin)*

---

## 8. Booking API Endpoints

### 8.1 POST `/api/bookings` *(protected)*
Create a new booking.

**Request Body:**
```json
{
  "booking_type": "vehicle",
  "vehicle_id": "uuid",
  "driver_profile_id": null,
  "driver_assigned_id": "uuid",
  "target_name": "Toyota HiAce",
  "start_date": "2024-03-15",
  "end_date": "2024-03-16",
  "start_time": "09:00",
  "end_time": "18:00",
  "pickup_location": "Colombo Fort Station, Colombo",
  "dropoff_location": "Kandy City Centre, Kandy",
  "pickup_lat": 6.9341,
  "pickup_lng": 79.8512,
  "dropoff_lat": 7.2906,
  "dropoff_lng": 80.6337,
  "passenger_count": 8,
  "ac_preference": "required",
  "total_amount": 24000.00,
  "advance_amount": 5000.00,
  "notes": "Need luggage space for 4 large bags"
}
```

**Validation rules:**
- `booking_type` required, enum vehicle|driver
- `vehicle_id` required if `booking_type = vehicle`
- `driver_profile_id` required if `booking_type = driver`
- `start_date` >= today
- `end_date` >= `start_date`
- Check vehicle/driver availability for date range (no overlapping approved bookings)

### 8.2 GET `/api/bookings` *(protected)*
List bookings for authenticated user.

**Response:** Array of booking objects with vehicle/driver details eager-loaded.

### 8.3 GET `/api/bookings/{id}` *(protected)*
Single booking.

### 8.4 PUT `/api/bookings/{id}/cancel` *(protected)*
Cancel booking (only if status = pending).

### 8.5 GET `/api/admin/bookings` *(admin)*
All bookings with filters (status, date range, user).

### 8.6 POST `/api/admin/bookings/{id}/approve` *(admin)*
### 8.7 POST `/api/admin/bookings/{id}/reject` *(admin)*
```json
{ "reason": "Vehicle not available on selected dates" }
```

---

## 9. Review API Endpoints

### 9.1 POST `/api/reviews` *(protected)*
```json
{
  "booking_id": "uuid",
  "reviewable_type": "vehicle",
  "reviewable_id": "uuid",
  "rating": 5,
  "comment": "Excellent vehicle, very clean."
}
```

Validation: User must have a completed booking for that vehicle/driver.

### 9.2 GET `/api/vehicles/{id}/reviews`
### 9.3 GET `/api/drivers/{id}/reviews`
Both return paginated review objects.

---

## 10. Location & Route API Endpoints

### 10.1 GET `/api/locations/search`
Forward geocoding proxy (calls Nominatim or Google Maps).

**Query:** `?q=Colombo Fort&limit=5`

**Response `data`:**
```json
[
  {
    "place_id": "12345",
    "display_name": "Colombo Fort, Colombo, Western Province, Sri Lanka",
    "lat": 6.9341,
    "lng": 79.8512
  }
]
```

### 10.2 GET `/api/locations/reverse`
**Query:** `?lat=6.9341&lng=79.8512`

**Response `data`:**
```json
{ "address": "Colombo Fort, Colombo 01, Sri Lanka" }
```

### 10.3 GET `/api/routes/distance`
Calculate route distance between two coordinates.

**Query:** `?from_lat=6.9341&from_lng=79.8512&to_lat=7.2906&to_lng=80.6337`

**Implementation:** Call OSRM public API or Google Maps Distance Matrix API.
```php
// Using OSRM (free, no API key)
$url = "http://router.project-osrm.org/route/v1/driving/{$from_lng},{$from_lat};{$to_lng},{$to_lat}?overview=false";
$response = Http::get($url);
$distance_km = $response['routes'][0]['distance'] / 1000;
$duration_min = $response['routes'][0]['duration'] / 60;
```

**Response `data`:**
```json
{
  "distance_km": 118.4,
  "duration_minutes": 143,
  "duration_label": "2 hrs 23 min"
}
```

### 10.4 POST `/api/drivers/{id}/location` *(protected)*
Update driver's current GPS location (called periodically from driver's device).

```json
{ "lat": 7.2906, "lng": 80.6337, "heading": 180, "speed": 60 }
```

This should:
1. Insert into `location_tracking`
2. Update `driver_profiles.location_lat/lng`
3. Broadcast `DriverLocationUpdated` event via Pusher

### 10.5 GET `/api/drivers/{id}/location`
Get current location of driver.

**Response `data`:** `{ "lat": 7.2906, "lng": 80.6337, "recorded_at": "..." }`

---

## 11. AI Recommendation API Endpoints

These are called by the frontend AI service layer. They can proxy to a Python AI microservice or implement scoring logic directly in Laravel.

### 11.1 POST `/api/ai/vehicle-recommendations`
AI-scored vehicle recommendations.

**Request:**
```json
{
  "passenger_count": 8,
  "budget": 15000,
  "distance_km": 128,
  "luggage_size": "medium",
  "vehicle_type": "van",
  "pickup_location": { "lat": 6.9341, "lng": 79.8512 },
  "destination": { "lat": 7.2906, "lng": 80.6337 }
}
```

**Scoring algorithm (implement in Laravel or Python):**

```php
// Seat capacity score (30 pts)
$seatScore = ($vehicle->seat_count >= $req->passenger_count) ? 
  max(15, 30 - ($vehicle->seat_count - $req->passenger_count) * 2) : 0;

// Budget fit score (25 pts)
$budgetScore = ($vehicle->price_per_day <= $req->budget) ? 
  min(25, 25 * ($req->budget / $vehicle->price_per_day)) : 
  max(0, 10 - (($vehicle->price_per_day - $req->budget) / $req->budget) * 20);

// Vehicle type match (25 pts)
$typeMatch = in_array($vehicle->vehicle_type, $recommendedTypes) ? 25 : 10;

// Luggage match (10 pts)
$luggageScore = ...; // 10|6|2 based on match

// Distance efficiency (10 pts)
$distScore = ($req->distance_km > 100 && in_array($vehicle->vehicle_type, ['van','suv'])) ? 10 : 5;

$score = $seatScore + $budgetScore + $typeMatch + $luggageScore + $distScore;
$confidence = min(95, round($score * 0.95 + ($seatScore > 0 ? 5 : 0)));
```

**Response `data`:** Array of:
```json
[
  {
    "vehicle": { ...vehicle object... },
    "score": 88,
    "confidence": 84,
    "reasons": [
      "Fits 14 passengers (8 needed)",
      "Daily rate LKR 12,000 fits your budget of LKR 15,000",
      "Van is ideal for this trip",
      "Best cost efficiency for 128 km long-distance trip"
    ],
    "rank": 1
  }
]
```

### 11.2 POST `/api/ai/driver-matching`
AI-scored driver matching.

**Request:**
```json
{
  "pickup_location": { "lat": 6.9341, "lng": 79.8512 },
  "distance_km": 128,
  "driver_ids": ["uuid1", "uuid2"]
}
```

**Scoring algorithm:**
```php
// Distance score (20%)
$distKm = $this->haversineDistance($pickup, $driver->location);
$distScore = max(0, 100 - $distKm * 6);

// Experience score (25%)
$expScore = min(100, ($driver->experience_years / 15) * 100);

// Rating score (35%)
$ratingScore = ($driver->rating / 5) * 100;

// Availability score (20%)
$availScore = $driver->availability_status === 'available' ? 100 : 20;

$finalScore = round(
  $distScore * 0.20 +
  $expScore * 0.25 +
  $ratingScore * 0.35 +
  $availScore * 0.20
);
```

**Response `data`:** Array of:
```json
[
  {
    "driver": { ...driver object with user... },
    "distance_score": 82,
    "experience_score": 75,
    "rating_score": 96,
    "availability_score": 100,
    "final_score": 89,
    "distance_km": 2.3,
    "reason": "Recommended: 2.3 km from pickup, 12y experience, 4.8 star rating, available immediately.",
    "estimated_arrival_min": 5
  }
]
```

### 11.3 POST `/api/ai/chat`
AI trip assistant chatbot.

**Request:**
```json
{
  "message": "I need a van for 10 people from Colombo to Kandy tomorrow",
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Implementation:** Forward to Python AI microservice or use OpenAI API.

---

## 12. Driver Availability API

### 12.1 GET `/api/availability`  *(protected, driver only)*
Get own availability schedule.

### 12.2 POST `/api/availability` *(protected, driver only)*
```json
{
  "date": "2024-03-20",
  "is_available": true,
  "start_time": "08:00",
  "end_time": "20:00",
  "notes": "Available for full-day trips"
}
```

### 12.3 PUT `/api/availability/{id}` *(protected, driver only)*
### 12.4 DELETE `/api/availability/{id}` *(protected, driver only)*

### 12.5 GET `/api/drivers/{id}/availability`
Public endpoint to check driver availability for a date range.

**Query:** `?from=2024-03-15&to=2024-03-20`

---

## 13. Admin API Endpoints

All admin endpoints require `Authorization: Bearer {admin_token}` and admin/superadmin role.

### 13.1 GET `/api/admin/dashboard/stats`
```json
{
  "data": {
    "total_users": 1250,
    "total_vehicles": 180,
    "total_drivers": 95,
    "total_bookings": 450,
    "pending_vehicles": 12,
    "pending_drivers": 8,
    "pending_bookings": 23,
    "monthly_revenue": 485000,
    "recent_bookings": [ ...5 bookings... ]
  }
}
```

### 13.2 GET `/api/admin/vehicles` — all vehicles (with approval_status filter)
### 13.3 GET `/api/admin/drivers` — all driver profiles
### 13.4 GET `/api/admin/bookings` — all bookings
### 13.5 GET `/api/admin/users` — all users
### 13.6 GET `/api/admin/reviews` — all reviews
### 13.7 GET `/api/admin/admins` *(superadmin only)* — list admin users
### 13.8 POST `/api/admin/admins` *(superadmin only)* — create admin user

---

## 14. Notification API

### 14.1 GET `/api/notifications` *(protected)*
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "booking_approved",
      "title": "Booking Approved!",
      "message": "Your booking for Toyota HiAce on 15 March has been approved.",
      "data": { "booking_id": "uuid" },
      "read_at": null,
      "created_at": "2024-03-14T10:30:00Z"
    }
  ],
  "unread_count": 3
}
```

### 14.2 PUT `/api/notifications/{id}/read` *(protected)*
### 14.3 PUT `/api/notifications/read-all` *(protected)*

---

## 15. Real-Time Events (Laravel Broadcasting + Pusher)

Configure `config/broadcasting.php` to use Pusher.

### 15.1 Pusher Config (`.env`)
```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=ap2
```

### 15.2 Events to Broadcast

| Event Class | Channel | Frontend Listener |
|---|---|---|
| `BookingStatusUpdated` | `private-user.{userId}` | UserBookingDashboard |
| `DriverLocationUpdated` | `presence-trip.{bookingId}` | TrackingMap |
| `NewNotification` | `private-user.{userId}` | NotificationBell |
| `BookingApprovalNeeded` | `private-admin` | Admin Dashboard |

### 15.3 Sample Event
```php
// app/Events/DriverLocationUpdated.php
class DriverLocationUpdated implements ShouldBroadcast
{
    public function __construct(
        public string $bookingId,
        public float $lat,
        public float $lng,
        public ?float $heading,
        public ?float $speed
    ) {}

    public function broadcastOn(): Channel
    {
        return new PresenceChannel("trip.{$this->bookingId}");
    }

    public function broadcastAs(): string
    {
        return 'driver.location.updated';
    }
}
```

### 15.4 Frontend WebSocket Integration
The frontend `RealtimeTrackingService.ts` should connect like this:

```typescript
// Expected by frontend:
import Pusher from 'pusher-js';

const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
});

const channel = pusher.subscribe(`presence-trip.${bookingId}`);
channel.bind('driver.location.updated', (data: { lat, lng, heading, speed }) => {
  // Update map marker
});
```

Add `VITE_PUSHER_KEY` and `VITE_PUSHER_CLUSTER` to the frontend `.env`.

---

## 16. File Upload

### 16.1 POST `/api/upload/image` *(protected)*
Upload a single image, returns public URL.

**Request:** `multipart/form-data`, field name `image`, max 5MB, types jpg/png/webp.

**Response `data`:**
```json
{ "url": "https://storage.ridehub.lk/images/vehicles/abc123.jpg" }
```

### 16.2 Storage Configuration
Use S3 or local with public symlink:
```php
// config/filesystems.php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

Run `php artisan storage:link` after deployment.

---

## 17. Middleware & Guards

### 17.1 Required Middleware
```php
// app/Http/Kernel.php — API middleware group
'api' => [
    \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
    \App\Http\Middleware\CorsMiddleware::class,
]

// Custom middleware:
// CheckAdmin — validates user has admin/superadmin role
// CheckDriver — validates user has driver role  
// CheckOwner — validates user owns the resource
```

### 17.2 Route Structure in `routes/api.php`
```php
// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
Route::get('/drivers', [DriverController::class, 'index']);
Route::get('/locations/search', [LocationController::class, 'search']);
Route::get('/routes/distance', [RouteController::class, 'distance']);

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::apiResource('/bookings', BookingController::class);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::post('/drivers/register', [DriverController::class, 'register']);
    Route::post('/drivers/{id}/location', [LocationController::class, 'updateDriver']);
    Route::apiResource('/reviews', ReviewController::class)->only(['store']);
    Route::post('/upload/image', [UploadController::class, 'image']);
    Route::apiResource('/availability', AvailabilityController::class);
    Route::get('/notifications', [NotificationController::class, 'index']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'check.admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard/stats', [AdminController::class, 'stats']);
    Route::post('/vehicles/{id}/approve', [AdminController::class, 'approveVehicle']);
    Route::post('/vehicles/{id}/reject', [AdminController::class, 'rejectVehicle']);
    Route::post('/drivers/{id}/approve', [AdminController::class, 'approveDriver']);
    Route::post('/drivers/{id}/reject', [AdminController::class, 'rejectDriver']);
    Route::post('/bookings/{id}/approve', [AdminController::class, 'approveBooking']);
    Route::post('/bookings/{id}/reject', [AdminController::class, 'rejectBooking']);
    Route::get('/admins', [AdminController::class, 'listAdmins']);
    Route::post('/admins', [AdminController::class, 'createAdmin']);
});

// AI Routes
Route::prefix('ai')->group(function () {
    Route::post('/vehicle-recommendations', [AIController::class, 'vehicleRecommendations']);
    Route::post('/driver-matching', [AIController::class, 'driverMatching']);
    Route::post('/chat', [AIController::class, 'chat']);
});
```

---

## 18. Environment Variables

```env
# App
APP_NAME=RideHub
APP_ENV=production
APP_KEY=base64:...
APP_URL=https://api.ridehub.lk

# Frontend URL (for CORS)
FRONTEND_URL=https://ridehub.lk

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ridehub
DB_USERNAME=ridehub_user
DB_PASSWORD=your_password

# Sanctum
SANCTUM_STATEFUL_DOMAINS=ridehub.lk

# Broadcasting / Pusher
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=ap2

# Queue
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Storage
FILESYSTEM_DISK=public
AWS_BUCKET=ridehub-storage  # if using S3

# Maps (optional — for server-side geocoding)
GOOGLE_MAPS_API_KEY=
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org

# Python AI Service (if separate)
AI_SERVICE_URL=http://localhost:5000
AI_SERVICE_SECRET=your_secret_key

# Mail
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_FROM_ADDRESS=noreply@ridehub.lk
```

---

## 19. Frontend Environment Variables

Add to frontend `.env`:

```env
VITE_API_BASE_URL=https://api.ridehub.lk/api
VITE_PUSHER_KEY=your_pusher_app_key
VITE_PUSHER_CLUSTER=ap2
VITE_PUSHER_CHANNEL_PREFIX=ridehub-
```

---

## 20. Key Laravel Patterns to Follow

### 20.1 Always return the standard envelope
```php
// app/Traits/ApiResponse.php
trait ApiResponse {
    protected function success($data, string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $data, 'message' => $message], $status);
    }

    protected function paginated($paginator): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $paginator->items(),
            'count' => $paginator->total(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ]
        ]);
    }

    protected function error(string $message, int $status = 422, array $errors = []): JsonResponse
    {
        return response()->json(['success' => false, 'message' => $message, 'errors' => $errors], $status);
    }
}
```

### 20.2 UUID Primary Keys
Use UUIDs for all models:
```php
use Illuminate\Support\Str;

protected static function boot() {
    parent::boot();
    static::creating(fn($model) => $model->id = Str::uuid());
}
```

### 20.3 Eager load relationships
Always eager-load to prevent N+1:
```php
Vehicle::with(['owner', 'reviews'])->paginate(12);
DriverProfile::with(['user', 'reviews'])->paginate(12);
Booking::with(['vehicle', 'driverProfile', 'driverAssigned.user'])->paginate(10);
```

### 20.4 Booking availability check
```php
public function checkVehicleAvailability(string $vehicleId, string $startDate, string $endDate): bool
{
    return !Booking::where('vehicle_id', $vehicleId)
        ->whereIn('status', ['pending', 'approved', 'active'])
        ->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
              ->orWhereBetween('end_date', [$startDate, $endDate])
              ->orWhere(fn($q) => $q->where('start_date', '<=', $startDate)->where('end_date', '>=', $endDate));
        })->exists();
}
```

---

## 21. ChatGPT Prompt Templates

When asking ChatGPT to build specific parts, use these prompts:

**For a controller:**
> "Build the Laravel 11 VehicleController with the API response trait above. It should handle index (with all query parameters from section 6.1), show, store, update, destroy methods. Use UUID primary keys, eager load owner and reviews, return paginated results using the standard envelope."

**For a migration:**
> "Write the Laravel migration for the `vehicles` table with exactly the schema from section 5.3 of the RideHub backend guide."

**For the AI scoring:**
> "Implement the AIController in Laravel for the `/api/ai/vehicle-recommendations` endpoint. Use the scoring algorithm from section 11.1. Return results sorted by score descending, max 8 results."

**For real-time:**
> "Set up Laravel Broadcasting for RideHub. Create the `DriverLocationUpdated` event from section 15.3, wire it to be dispatched from the `LocationController::updateDriver` method, and configure Pusher channels."

---

## 22. Frontend ↔ Backend Field Mapping

| Frontend Field | Laravel DB Column | Notes |
|---|---|---|
| `vehicle.brand` | `vehicles.brand` | |
| `vehicle.model` | `vehicles.model` | |
| `vehicle.vehicle_type` | `vehicles.vehicle_type` | enum |
| `vehicle.price_per_day` | `vehicles.price_per_day` | decimal |
| `vehicle.images` | `vehicles.images` | JSON array |
| `vehicle.avg_rating` | computed from reviews | `AVG(reviews.rating)` |
| `vehicle.review_count` | `vehicles.review_count` | denormalized counter |
| `driver.experience_years` | `driver_profiles.experience_years` | |
| `driver.license_type` | `driver_profiles.license_type` | light\|heavy |
| `driver.rating` | `driver_profiles.rating` | denormalized |
| `driver.user.first_name` | `users.first_name` | eager loaded |
| `booking.booking_type` | `bookings.booking_type` | vehicle\|driver |
| `booking.driver_assigned_id` | `bookings.driver_assigned_id` | AI-matched driver |

---

## 23. Deployment Checklist

- [ ] `php artisan key:generate`
- [ ] `php artisan migrate --seed`
- [ ] `php artisan storage:link`
- [ ] `php artisan config:cache`
- [ ] `php artisan route:cache`
- [ ] Set `APP_ENV=production`, `APP_DEBUG=false`
- [ ] Configure CORS `FRONTEND_URL` to production frontend domain
- [ ] Set up queue worker: `php artisan queue:work --daemon`
- [ ] Set up broadcasting: `php artisan queue:work --queue=broadcasting`
- [ ] Configure Pusher credentials
- [ ] Set up SSL certificate
- [ ] Configure web server (Nginx/Apache) to serve `public/index.php`

---

*Last updated: 2026-06-24 | RideHub v1.0 | Laravel 11*
