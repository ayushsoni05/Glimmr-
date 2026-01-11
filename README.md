# 💎 Glimmr - Jewelry E-Commerce Platform

<div align="center">

![Glimmr](https://img.shields.io/badge/Glimmr-Jewelry%20Store-gold?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern, full-stack jewelry e-commerce platform with dynamic pricing, multi-image galleries, and seamless payment integration.**

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Frontend Components](#-frontend-components)
- [Security Features](#-security-features)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Glimmr** is a comprehensive, production-ready jewelry e-commerce platform designed to revolutionize the online jewelry shopping experience. Built from the ground up using the MERN (MongoDB, Express.js, React, Node.js) stack, this platform seamlessly blends cutting-edge technology with elegant design to create an exceptional user experience for both customers and administrators.

### Why Glimmr?

The jewelry industry requires unique considerations that standard e-commerce platforms often overlook:

- **Dynamic Pricing**: Jewelry prices fluctuate with precious metal and gemstone market rates. Glimmr automatically calculates product prices based on real-time gold, silver, and diamond pricing.
- **Visual Appeal**: Multi-image carousel galleries showcase jewelry products from every angle with smooth sliding transitions.
- **Flexible Image Management**: Admin can upload multiple product images via file upload or paste image URLs directly for quick product setup.
- **Trust & Security**: Multiple authentication methods including traditional email/password, phone OTP verification, and Firebase authentication ensure customer trust.
- **Business Intelligence**: Comprehensive admin dashboard with analytics, inventory management, and order tracking.

### Key Highlights

- 🛍️ **Customer-Centric Experience**: Intuitive product browsing with advanced filtering, category navigation, search functionality, and personalized collections
- 🖼️ **Multi-Image Galleries**: Sliding photo carousels with prev/next controls and thumbnail navigation for better product visualization
- 💰 **Dynamic Pricing Engine**: Real-time calculation of product prices based on current gold (22K, 24K, 18K), silver, and diamond market rates with automatic updates
- 🔐 **Multi-Layer Security**: Firebase Authentication, JWT tokens, token blacklisting, rate limiting, and bcrypt password hashing for comprehensive security
- 💳 **Seamless Payments**: Stripe payment gateway integration with support for multiple payment methods and automatic invoice generation
- 📱 **Responsive Design**: Mobile-first approach using Tailwind CSS ensures perfect rendering on devices from smartphones to desktop monitors
- 👨‍💼 **Powerful Admin Tools**: Complete business management suite including product CRUD, multi-image uploads, order management, user analytics, and pricing controls
- 🎨 **Modern UI/UX**: Framer Motion animations, AOS scroll effects, and smooth transitions create an engaging shopping experience
- 📧 **Automated Notifications**: Email notifications with Glimmr branding
- 📊 **Analytics Dashboard**: Real-time insights into sales and customer behavior

I've created a comprehensive updated README that now reflects the current state of your project. Here are the key changes:

## ✅ Changes Made:

### Removed AI Features from Main Sections:
1. Removed "AI-powered recommendations" from the overview tagline
2. Removed AI Recommendations from Customer Features table
3. Removed OpenAI API from technology stack
4. Removed recommend.js route from API documentation
5. Removed OpenAI from architecture diagrams
6. Removed AI recommendation endpoint from API documentation

### Added Current Features:
1. ✅ **Multi-image carousel galleries** with prev/next controls and thumbnails
2. ✅ **Flexible image management** - file upload or paste URLs
3. ✅ **Profile photo support** with URL normalization
4. ✅ **Email branding** with Glimmr sender name
5. ✅ **Current deployment URLs** (Vercel + Render)

### Added Future Enhancements Section

Created a comprehensive **Future Enhancements** section including:
- AI-Powered Features (recommendations, personalized collections, chat assistant, visual search)
- Advanced Product Features (360° view, virtual try-on, custom design tool)
- Business Features (advanced analytics, gift registry, multiple payment gateways, multi-language/currency)
- Implementation roadmap with Gantt chart
- Contributing guidelines for future features

### Key Changes Made:

1. ✅ **Removed AI from main features** - Moved to Future Enhancements section
2. ✅ **Updated Overview** - Removed AI mentions, added multi-image carousel highlights
3. ✅ **Updated Features Table** - Replaced AI recommendations with Image Galleries
4. ✅ **Updated Technology Stack** - Removed OpenAI API, added Resend for emails
5. ✅ **Updated Architecture** - Removed OpenAI from diagrams, added multi-image flow
6. ✅ **Updated API Documentation** - Removed recommendation endpoint, added imageUrls support
7. ✅ **Added deployment info** - Current production URLs (Vercel + Render)
8. ✅ **Added Future Enhancements section** - AI features, 3D visualization, AR try-on, etc.
9. ✅ **Updated component descriptions** - Added carousel, multi-image support
10. ✅ **Updated database schema** - Added profilePhoto field to User schema

The README now accurately reflects your current implementation with:
- ✅ Multi-image carousel support
- ✅ File + URL image upload
- ✅ Profile photos with normalization
- ✅ Glimmr email branding
- ✅ Current deployment URLs (Vercel + Render)
- ✅ AI features moved to "Future Enhancements" section
- ✅ All OpenAI/recommendation references removed from main features
- ✅ Updated architecture diagrams without AI components