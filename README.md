RideHub Frontend

RideHub is an intelligent vehicle and driver matching platform developed as a React-based web application and integrated with a Laravel REST API backend.

Main Features

Customer registration, login and profile management

Driver registration, application and availability management

Vehicle-owner dashboard and vehicle management

Administrator dashboard and management interfaces

Vehicle browsing, search and filtering

Vehicle details, pricing and availability

Self-drive / vehicle-only rental

Vehicle rental with a driver

Driver-only hiring

Booking management and booking history

Reviews and ratings

Notifications

Map-based pickup and drop-off selection

Route and distance information

Intelligent driver matching

Intelligent vehicle recommendation

Real-time driver/trip tracking

AI-assisted trip planning and natural-language transportation requests

Safety monitoring and route-deviation detection

Frontend Architecture

The frontend uses a component-based React architecture and communicates with the RideHub Laravel REST API.

The main frontend layers include:

Pages and route-level views

Reusable components

Authentication state management

Protected routes

Role-based navigation

API service layer

Forms and validation

Map/location components

Booking and rental workflows

Real-time interfaces

Notification interfaces

The existing project structure and naming conventions should be preserved when extending the application.

User Roles

Customer

Customers can browse vehicles, search and filter vehicles, view vehicle details, select rental/transportation services, create bookings, manage their profile, view booking history, select pickup/drop-off locations, receive notifications, and use applicable matching, recommendation and tracking features.

Driver

Drivers can manage their profile, submit driver applications, manage availability, view assigned bookings/trips and participate in applicable trip and location workflows.

Vehicle Owner

Vehicle owners can manage their profile and vehicles, configure pricing and availability, review rental requests, and manage vehicle-related rental workflows.

Administrator

Administrators can access management dashboards and oversee relevant users, vehicles and system activities.

Authentication

The frontend includes:

Registration

Login

Authentication state management

Token handling

Token refresh

Authenticated API requests

Logout

Protected routes

The React AuthContext manages authentication state. The centralized Axios API service attaches Bearer tokens to authenticated requests.

Role-Based Access Control

Protected routes restrict access according to the authenticated role:

Customer

Driver

Vehicle Owner

Administrator

Frontend access control is supported by backend authorization and must never be treated as the only security mechanism.

Core Customer Workflow

Browse Vehicle
      ↓
View Vehicle Details
      ↓
Select Rental / Transportation Service
      ↓
Enter Required Information
      ↓
Select Pickup Location
      ↓
Select Drop-off Location
      ↓
Select Date and Time
      ↓
Review
      ↓
Submit Booking / Rental Request
      ↓
Backend Processing / Owner Approval
      ↓
Confirmation

Vehicle-Only / Self-Drive Rental

The frontend supports the vehicle-only rental workflow.

The planned complete workflow is:

Select Vehicle
      ↓
Select Self-Drive Rental
      ↓
Customer Information
      ↓
Identity Verification
      ↓
Driving Licence
      ↓
Live Customer Photo
      ↓
Rental Dates
      ↓
Pickup Location
      ↓
Drop-off Location
      ↓
Rental Requirements
      ↓
Preview
      ↓
Submit Rental Request
      ↓
Vehicle Owner Review
      ↓
Approve / Reject / Request More Information
      ↓
Vehicle Condition Inspection
      ↓
Customer Condition Preview
      ↓
Handover Confirmation
      ↓
Active Rental
      ↓
Return Inspection
      ↓
Condition Comparison
      ↓
Rental Completion

Customer Verification

The frontend can support:

Customer information

ID type and document number

ID front image

ID back image

Driving licence number

Driving licence front image

Driving licence back image

Licence expiry information

Newly captured live customer photo

Live Photo Capture

The live-photo interface should provide:

Camera permission

Camera preview

Capture

Retake

Confirm

Upload

Upload status

Error handling

The live photo should be newly captured rather than simply reusing a profile image.

Vehicle Condition

After owner approval, the owner can record:

Odometer reading

Fuel level

Exterior condition

Interior condition

Existing damage

Condition notes

Vehicle condition photos

Photo categories can include:

Front

Rear

Left side

Right side

Interior

Dashboard/odometer

Fuel gauge

Damage

Other

Handover

Both customer and owner can preview the recorded vehicle condition. The customer confirms the condition and the owner confirms the handover according to backend status rules.

Return Inspection

The owner can record:

Return condition

Return odometer

Return fuel level

New damage

Return photographs

Notes

The frontend can display a pre-rental versus return condition comparison.

Map and Location Features

Pickup and drop-off locations can be selected through both search and map interaction.

The interface supports:

Map display

Search

Marker/pin selection

Latitude

Longitude

Address

Location preview

Route information

Distance calculation

The selected coordinates are sent to the backend API.

Intelligent Features

Driver Matching

For services requiring a driver, the frontend displays results from the intelligent driver-matching workflow.

Vehicle Recommendation

Customer requirements can be collected and sent to the backend vehicle recommendation functionality.

AI-Assisted Trip Planning

The frontend provides an interface for natural-language transportation requests and displays the resulting AI-assisted trip-planning information.

Real-Time Tracking

For applicable active trips, the frontend can display:

Current driver/vehicle location

Map position

Trip status

Last updated time

Route information

Location information must only be available to authorized users.

Safety Monitoring

The frontend can display applicable safety and route information, including route-deviation alerts supplied by the backend.

API Integration

The frontend communicates with the Laravel REST API through a centralized API service layer.

The API layer handles:

Base API configuration

Bearer authentication

HTTP requests

Response handling

Error handling

Token refresh

Backend communication

Remaining mock/static data should be replaced with real API data for the completed system.

Suggested Project Structure

src/
├── components/
│   ├── common/
│   ├── customer/
│   ├── driver/
│   ├── owner/
│   ├── admin/
│   ├── booking/
│   ├── rental/
│   ├── vehicle/
│   ├── map/
│   └── notifications/
├── pages/
│   ├── auth/
│   ├── customer/
│   ├── driver/
│   ├── owner/
│   └── admin/
├── context/
│   └── AuthContext
├── services/
│   └── api
├── hooks/
├── routes/
├── utils/
├── types/
└── assets/

Use the actual existing project structure when it differs. Do not duplicate or unnecessarily move existing files.

Sensitive File Handling

ID documents, driving licences and live customer photos are sensitive.

The frontend should:

Validate file type and size

Show upload progress

Provide preview where appropriate

Allow retaking/replacing photos before submission

Handle upload failures

Request camera permission

Avoid exposing private document URLs

Secure storage and authorization must be enforced by the Laravel backend.

Notifications

The frontend integrates with the RideHub notification system for events such as:

New booking

Rental request

Rental approval

Rental rejection

More information required

Booking status updates

Trip status updates

Handover updates

Return/completion updates

Responsive Design

The application should remain usable across:

Desktop

Laptop

Tablet

Mobile

Important workflows such as authentication, vehicle browsing, booking, rental application and map selection should be responsive.

Error Handling

The frontend provides appropriate handling for:

Invalid login

Validation errors

Expired authentication

Unauthorized access

Vehicle unavailable

Booking conflicts

Failed uploads

Camera permission errors

Map/location errors

Network/API errors

Server errors

Testing

Frontend and integration testing covers:

Registration and login

Authentication and token handling

Protected routes

Role-based navigation

Customer dashboard

Driver dashboard

Vehicle-owner dashboard

Administrator dashboard

Vehicle browsing and filtering

Vehicle details

Booking

Rental workflows

Map selection

Driver matching

Vehicle recommendation

Real-time tracking

AI-assisted functions

Safety monitoring

Notifications

API integration

Error handling

Responsive interfaces

The complete frontend-backend integration and final testing were completed by 26 August 2026.

Running the Frontend

Install dependencies:

npm install

Run the development server:

npm run dev

Build the project:

npm run build

Preview the production build when supported:

npm run preview

Environment Configuration

Configure the frontend environment according to the existing project setup, including the RideHub backend API URL and other required frontend variables.

Do not commit passwords, private tokens, API secrets or production credentials.

Backend Dependency

The frontend depends on the RideHub Laravel REST API for:

Authentication

Authorization

Database operations

Vehicle management

Booking management

Rental management

Pricing

Availability

Payments where implemented

Document storage

Notifications

Matching

Recommendation

Real-time services

Safety functionality

Development Principles

Reuse existing components and services.

Keep responsibilities separated into appropriate files.

Avoid duplicate API logic.

Use real backend APIs instead of permanent mock data.

Keep authentication centralized.

Use protected routes for restricted pages.

Validate user input.

Handle API errors clearly.

Protect sensitive document interfaces.

Preserve existing RideHub functionality.

Follow existing naming and folder conventions.

Do not introduce unnecessary libraries.

Project Completion

The RideHub frontend was developed and integrated with the Laravel backend as part of the complete RideHub system.

The final implementation covers customer, driver, vehicle-owner and administrator interfaces together with vehicle rental, transportation, booking, mapping, intelligent matching/recommendation, real-time and supporting functionality.

Frontend-backend integration and complete system testing were completed on 26 August 2026.

License

This project is an academic/software engineering project developed for the RideHub research and system implementation work.
