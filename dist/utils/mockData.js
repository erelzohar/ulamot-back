"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockBookings = exports.mockUsers = exports.mockVenues = void 0;
const date_fns_1 = require("date-fns");
// Generate mock availability dates
const generateAvailability = () => {
    const today = new Date();
    const availability = [];
    // Generate 30 date ranges for the next 90 days
    for (let i = 0; i < 30; i++) {
        const startDate = (0, date_fns_1.addDays)(today, Math.floor(Math.random() * 90));
        const endDate = (0, date_fns_1.addDays)(startDate, 1);
        availability.push({
            startDate,
            endDate,
            isBooked: Math.random() > 0.7, // 30% chance of being booked
        });
    }
    return availability;
};
exports.mockVenues = [
    {
        id: '1',
        name: 'Rosewood Manor',
        description: 'A stunning historic mansion surrounded by lush gardens and a picturesque lake. Perfect for elegant weddings and sophisticated events with a touch of old-world charm.',
        location: {
            address: '123 Rosewood Lane',
            city: 'Charleston',
            state: 'South Carolina',
            zipCode: '29401',
            country: 'USA',
            coordinates: {
                latitude: 32.7765,
                longitude: -79.9311,
            },
        },
        type: ['historic', 'garden', 'outdoor'],
        capacity: {
            min: 50,
            max: 200,
        },
        pricing: {
            basePrice: 5000,
            currency: 'USD',
            packages: [
                {
                    id: 'p1',
                    name: 'Essential Package',
                    description: 'Basic venue rental with minimal amenities',
                    price: 5000,
                    items: ['Venue rental (8 hours)', 'Basic setup and cleanup', 'Parking'],
                },
                {
                    id: 'p2',
                    name: 'Premium Package',
                    description: 'Enhanced venue experience with additional services',
                    price: 8000,
                    items: ['Venue rental (10 hours)', 'Setup and cleanup', 'Parking', 'Basic catering', 'Basic floral arrangements'],
                },
                {
                    id: 'p3',
                    name: 'Luxury Package',
                    description: 'All-inclusive luxury experience',
                    price: 12000,
                    items: ['Venue rental (full day)', 'Premium setup and cleanup', 'Valet parking', 'Full catering', 'Premium floral arrangements', 'Photography', 'DJ services'],
                },
            ],
        },
        amenities: ['catering', 'parking', 'wifi', 'bridal-suite', 'outdoor-ceremony'],
        images: [
            {
                id: 'img1',
                url: 'https://images.pexels.com/photos/1619860/pexels-photo-1619860.jpeg',
                alt: 'Rosewood Manor exterior',
                isPrimary: true,
            },
            {
                id: 'img2',
                url: 'https://images.pexels.com/photos/265920/pexels-photo-265920.jpeg',
                alt: 'Rosewood Manor garden',
            },
            {
                id: 'img3',
                url: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg',
                alt: 'Rosewood Manor ballroom',
            },
        ],
        availability: generateAvailability(),
        reviews: [
            {
                id: 'r1',
                userId: 'u1',
                userName: 'Emily Johnson',
                rating: 5,
                comment: 'Absolutely magical venue! Our wedding was perfect in every way.',
                date: (0, date_fns_1.subDays)(new Date(), 30),
            },
            {
                id: 'r2',
                userId: 'u2',
                userName: 'Michael Smith',
                rating: 4,
                comment: 'Beautiful location and great staff. Slightly pricey but worth it.',
                date: (0, date_fns_1.subDays)(new Date(), 60),
            },
        ],
        contactInfo: {
            phone: '(843) 555-1234',
            email: 'info@rosewoodmanor.com',
            website: 'www.rosewoodmanor.com',
            socialMedia: {
                facebook: 'facebook.com/rosewoodmanor',
                instagram: 'instagram.com/rosewoodmanor',
                pinterest: 'pinterest.com/rosewoodmanor',
            },
        },
        virtualTourUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
        id: '2',
        name: 'Crystal Ballroom',
        description: 'A luxurious modern ballroom with crystal chandeliers and state-of-the-art facilities. Ideal for grand weddings and corporate events requiring sophistication and modern amenities.',
        location: {
            address: '456 Crystal Drive',
            city: 'Miami',
            state: 'Florida',
            zipCode: '33101',
            country: 'USA',
            coordinates: {
                latitude: 25.7617,
                longitude: -80.1918,
            },
        },
        type: ['indoor', 'ballroom', 'modern'],
        capacity: {
            min: 100,
            max: 500,
        },
        pricing: {
            basePrice: 7500,
            currency: 'USD',
            packages: [
                {
                    id: 'p1',
                    name: 'Standard Package',
                    description: 'Basic ballroom rental',
                    price: 7500,
                    items: ['Venue rental (6 hours)', 'Basic setup', 'Sound system'],
                },
                {
                    id: 'p2',
                    name: 'Deluxe Package',
                    description: 'Enhanced ballroom experience',
                    price: 10000,
                    items: ['Venue rental (8 hours)', 'Full setup and cleanup', 'Premium sound and lighting', 'Basic catering'],
                },
                {
                    id: 'p3',
                    name: 'Elite Package',
                    description: 'All-inclusive luxury experience',
                    price: 15000,
                    items: ['Venue rental (12 hours)', 'Premium setup and cleanup', 'Full A/V package', 'Premium catering', 'Open bar', 'Valet parking'],
                },
            ],
        },
        amenities: ['catering', 'parking', 'av-equipment', 'wifi', 'bar-service', 'indoor-ceremony'],
        images: [
            {
                id: 'img1',
                url: 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg',
                alt: 'Crystal Ballroom interior',
                isPrimary: true,
            },
            {
                id: 'img2',
                url: 'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg',
                alt: 'Crystal Ballroom setup',
            },
            {
                id: 'img3',
                url: 'https://images.pexels.com/photos/3171770/pexels-photo-3171770.jpeg',
                alt: 'Crystal Ballroom event',
            },
        ],
        availability: generateAvailability(),
        reviews: [
            {
                id: 'r1',
                userId: 'u3',
                userName: 'Jessica Williams',
                rating: 5,
                comment: 'The ballroom was stunning and the staff was incredibly helpful!',
                date: (0, date_fns_1.subDays)(new Date(), 15),
            },
            {
                id: 'r2',
                userId: 'u4',
                userName: 'David Brown',
                rating: 3,
                comment: 'Beautiful venue but the acoustics could be better.',
                date: (0, date_fns_1.subDays)(new Date(), 45),
            },
        ],
        contactInfo: {
            phone: '(305) 555-6789',
            email: 'events@crystalballroom.com',
            website: 'www.crystalballroom.com',
            socialMedia: {
                facebook: 'facebook.com/crystalballroom',
                instagram: 'instagram.com/crystalballroom',
            },
        },
    },
    {
        id: '3',
        name: 'Sunset Beach Resort',
        description: 'A breathtaking beachfront venue with panoramic ocean views. Perfect for romantic beach weddings and relaxed celebrations with a tropical atmosphere.',
        location: {
            address: '789 Shoreline Highway',
            city: 'Malibu',
            state: 'California',
            zipCode: '90265',
            country: 'USA',
            coordinates: {
                latitude: 34.0259,
                longitude: -118.7798,
            },
        },
        type: ['beach', 'outdoor', 'modern'],
        capacity: {
            min: 50,
            max: 150,
        },
        pricing: {
            basePrice: 6000,
            currency: 'USD',
            packages: [
                {
                    id: 'p1',
                    name: 'Beach Ceremony',
                    description: 'Simple beach ceremony setup',
                    price: 6000,
                    items: ['Beach ceremony setup', 'Basic chairs and arch', '2-hour access'],
                },
                {
                    id: 'p2',
                    name: 'Beach Ceremony & Reception',
                    description: 'Complete beach wedding experience',
                    price: 9000,
                    items: ['Beach ceremony setup', 'Reception area', '6-hour access', 'Basic catering', 'Basic decor'],
                },
                {
                    id: 'p3',
                    name: 'Luxury Beach Wedding',
                    description: 'Premium beach wedding experience',
                    price: 14000,
                    items: ['Premium beach ceremony setup', 'Luxury reception pavilion', 'Full day access', 'Premium catering', 'Open bar', 'Photography', 'Live music'],
                },
            ],
        },
        amenities: ['catering', 'parking', 'accommodation', 'bar-service', 'outdoor-ceremony'],
        images: [
            {
                id: 'img1',
                url: 'https://images.pexels.com/photos/1024967/pexels-photo-1024967.jpeg',
                alt: 'Sunset Beach Resort view',
                isPrimary: true,
            },
            {
                id: 'img2',
                url: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg',
                alt: 'Beach wedding setup',
            },
            {
                id: 'img3',
                url: 'https://images.pexels.com/photos/169192/pexels-photo-169192.jpeg',
                alt: 'Resort reception area',
            },
        ],
        availability: generateAvailability(),
        reviews: [
            {
                id: 'r1',
                userId: 'u5',
                userName: 'Amanda Garcia',
                rating: 5,
                comment: 'Our beach wedding was like a dream come true! Highly recommend!',
                date: (0, date_fns_1.subDays)(new Date(), 20),
            },
            {
                id: 'r2',
                userId: 'u6',
                userName: 'Robert Martinez',
                rating: 4,
                comment: 'Beautiful location but be prepared for wind! Overall great experience.',
                date: (0, date_fns_1.subDays)(new Date(), 90),
            },
        ],
        contactInfo: {
            phone: '(310) 555-9876',
            email: 'weddings@sunsetbeachresort.com',
            website: 'www.sunsetbeachresort.com',
            socialMedia: {
                facebook: 'facebook.com/sunsetbeachresort',
                instagram: 'instagram.com/sunsetbeachresort',
                pinterest: 'pinterest.com/sunsetbeachresort',
            },
        },
        virtualTourUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
        id: '4',
        name: 'Rustic Barn Retreat',
        description: 'An authentic restored barn in the countryside offering a charming rustic atmosphere. Ideal for country-themed weddings and events with a warm, intimate feel.',
        location: {
            address: '1010 Country Road',
            city: 'Nashville',
            state: 'Tennessee',
            zipCode: '37203',
            country: 'USA',
            coordinates: {
                latitude: 36.1627,
                longitude: -86.7816,
            },
        },
        type: ['rustic', 'outdoor', 'indoor'],
        capacity: {
            min: 50,
            max: 180,
        },
        pricing: {
            basePrice: 4000,
            currency: 'USD',
            packages: [
                {
                    id: 'p1',
                    name: 'Basic Barn Package',
                    description: 'Simple barn venue rental',
                    price: 4000,
                    items: ['Barn venue (8 hours)', 'Basic tables and chairs', 'Parking'],
                },
                {
                    id: 'p2',
                    name: 'Country Celebration',
                    description: 'Enhanced rustic experience',
                    price: 6500,
                    items: ['Barn venue (10 hours)', 'Rustic decor package', 'Tables and chairs', 'Outdoor ceremony area', 'Basic catering'],
                },
                {
                    id: 'p3',
                    name: 'Deluxe Country Wedding',
                    description: 'Complete rustic wedding experience',
                    price: 9000,
                    items: ['Barn venue (full day)', 'Premium rustic decor', 'Outdoor ceremony', 'Full catering', 'Live country band', 'Photography', 'Bonfire'],
                },
            ],
        },
        amenities: ['catering', 'parking', 'outdoor-ceremony', 'indoor-ceremony', 'wifi'],
        images: [
            {
                id: 'img1',
                url: 'https://images.pexels.com/photos/226144/pexels-photo-226144.jpeg',
                alt: 'Rustic Barn exterior',
                isPrimary: true,
            },
            {
                id: 'img2',
                url: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg',
                alt: 'Barn interior setup',
            },
            {
                id: 'img3',
                url: 'https://images.pexels.com/photos/1405528/pexels-photo-1405528.jpeg',
                alt: 'Countryside views',
            },
        ],
        availability: generateAvailability(),
        reviews: [
            {
                id: 'r1',
                userId: 'u7',
                userName: 'Sarah Thompson',
                rating: 5,
                comment: 'The barn was absolutely perfect for our rustic wedding! So many great photo opportunities.',
                date: (0, date_fns_1.subDays)(new Date(), 40),
            },
            {
                id: 'r2',
                userId: 'u8',
                userName: 'James Wilson',
                rating: 4,
                comment: 'Great venue with lots of character. Just be aware it can get hot in summer.',
                date: (0, date_fns_1.subDays)(new Date(), 120),
            },
        ],
        contactInfo: {
            phone: '(615) 555-3456',
            email: 'events@rusticbarnretreat.com',
            website: 'www.rusticbarnretreat.com',
            socialMedia: {
                facebook: 'facebook.com/rusticbarnretreat',
                instagram: 'instagram.com/rusticbarnretreat',
            },
        },
    },
    {
        id: '5',
        name: 'Grand Plaza Hotel',
        description: 'A sophisticated urban hotel with multiple elegant event spaces. Perfect for upscale weddings and corporate events with convenient downtown location and luxury accommodations.',
        location: {
            address: '555 Main Street',
            city: 'Chicago',
            state: 'Illinois',
            zipCode: '60601',
            country: 'USA',
            coordinates: {
                latitude: 41.8781,
                longitude: -87.6298,
            },
        },
        type: ['indoor', 'ballroom', 'modern'],
        capacity: {
            min: 100,
            max: 400,
        },
        pricing: {
            basePrice: 8000,
            currency: 'USD',
            packages: [
                {
                    id: 'p1',
                    name: 'Classic Wedding',
                    description: 'Standard hotel wedding package',
                    price: 8000,
                    items: ['Ballroom rental (6 hours)', 'Basic setup', 'Basic catering menu', 'Cash bar'],
                },
                {
                    id: 'p2',
                    name: 'Premium Celebration',
                    description: 'Enhanced hotel wedding experience',
                    price: 12000,
                    items: ['Ballroom rental (8 hours)', 'Premium setup', 'Enhanced catering menu', 'Limited open bar', 'Bridal suite'],
                },
                {
                    id: 'p3',
                    name: 'Luxury Grand Wedding',
                    description: 'All-inclusive luxury hotel wedding',
                    price: 18000,
                    items: ['Ballroom rental (full day)', 'Luxury setup', 'Premium catering', 'Full open bar', 'Bridal suite', 'Guest room block discount', 'Day-of coordinator'],
                },
            ],
        },
        amenities: ['catering', 'parking', 'av-equipment', 'wifi', 'bridal-suite', 'accommodation', 'wheelchair-access', 'bar-service', 'indoor-ceremony'],
        images: [
            {
                id: 'img1',
                url: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg',
                alt: 'Grand Plaza Hotel exterior',
                isPrimary: true,
            },
            {
                id: 'img2',
                url: 'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg',
                alt: 'Hotel ballroom',
            },
            {
                id: 'img3',
                url: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg',
                alt: 'Hotel suite',
            },
        ],
        availability: generateAvailability(),
        reviews: [
            {
                id: 'r1',
                userId: 'u9',
                userName: 'Jennifer Davis',
                rating: 5,
                comment: 'The hotel staff made our wedding day absolutely perfect! The ballroom was stunning.',
                date: (0, date_fns_1.subDays)(new Date(), 25),
            },
            {
                id: 'r2',
                userId: 'u10',
                userName: 'Thomas Anderson',
                rating: 4,
                comment: 'Great venue with professional service. Food was excellent.',
                date: (0, date_fns_1.subDays)(new Date(), 75),
            },
        ],
        contactInfo: {
            phone: '(312) 555-7890',
            email: 'events@grandplazahotel.com',
            website: 'www.grandplazahotel.com',
            socialMedia: {
                facebook: 'facebook.com/grandplazahotel',
                instagram: 'instagram.com/grandplazahotel',
            },
        },
        virtualTourUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }
];
exports.mockUsers = [
    {
        id: 'u1',
        email: 'emily@example.com',
        name: 'Emily Johnson',
        phone: '555-123-4567',
        favoriteVenues: ['1', '3'],
        bookings: [
            {
                id: 'b1',
                venueId: '1',
                userId: 'u1',
                eventDate: (0, date_fns_1.addDays)(new Date(), 60),
                packageId: 'p2',
                guestCount: 150,
                status: 'confirmed',
                totalPrice: 8000,
                paymentStatus: 'paid',
                createdAt: (0, date_fns_1.subDays)(new Date(), 90),
                specialRequests: 'Extra floral arrangements and vegetarian menu options.',
            }
        ]
    },
    {
        id: 'u2',
        email: 'michael@example.com',
        name: 'Michael Smith',
        phone: '555-987-6543',
        favoriteVenues: ['2', '5'],
        bookings: [
            {
                id: 'b2',
                venueId: '2',
                userId: 'u2',
                eventDate: (0, date_fns_1.addDays)(new Date(), 45),
                packageId: 'p3',
                guestCount: 300,
                status: 'confirmed',
                totalPrice: 15000,
                paymentStatus: 'partial',
                createdAt: (0, date_fns_1.subDays)(new Date(), 120),
                specialRequests: 'Special lighting setup and extended bar service.',
            }
        ]
    }
];
exports.mockBookings = [
    {
        id: 'b1',
        venueId: '1',
        userId: 'u1',
        eventDate: (0, date_fns_1.addDays)(new Date(), 60),
        packageId: 'p2',
        guestCount: 150,
        status: 'confirmed',
        totalPrice: 8000,
        paymentStatus: 'paid',
        createdAt: (0, date_fns_1.subDays)(new Date(), 90),
        specialRequests: 'Extra floral arrangements and vegetarian menu options.',
    },
    {
        id: 'b2',
        venueId: '2',
        userId: 'u2',
        eventDate: (0, date_fns_1.addDays)(new Date(), 45),
        packageId: 'p3',
        guestCount: 300,
        status: 'confirmed',
        totalPrice: 15000,
        paymentStatus: 'partial',
        createdAt: (0, date_fns_1.subDays)(new Date(), 120),
        specialRequests: 'Special lighting setup and extended bar service.',
    },
    {
        id: 'b3',
        venueId: '3',
        userId: 'u1',
        eventDate: (0, date_fns_1.addDays)(new Date(), 120),
        packageId: 'p2',
        guestCount: 100,
        status: 'pending',
        totalPrice: 9000,
        paymentStatus: 'unpaid',
        createdAt: (0, date_fns_1.subDays)(new Date(), 30),
        specialRequests: 'Sunset ceremony timing is important.',
    }
];
