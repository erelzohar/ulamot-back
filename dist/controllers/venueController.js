"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBasePrice = exports.updateDynamicPricing = exports.updatePackages = exports.createVenueAsHost = exports.searchVenues = exports.deleteVenue = exports.updateVenue = exports.createVenue = exports.getVenueById = exports.getAllVenues = void 0;
const Venue_1 = __importDefault(require("../models/Venue"));
const Host_1 = __importDefault(require("../models/Host"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const mongoose_1 = __importDefault(require("mongoose"));
// Ensure the uploads directory exists
const uploadsDir = path_1.default.join(__dirname, '../../uploads/venues');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Get all venues
const getAllVenues = async (req, res) => {
    try {
        const venues = await Venue_1.default.find();
        const backendBaseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
        const venuesWithFullImageUrls = venues.map(venue => {
            const venueObject = venue.toObject();
            if (venueObject.images && venueObject.images.length > 0) {
                venueObject.images = venueObject.images.map(image => {
                    if (image.url && !image.url.startsWith('http')) {
                        return { ...image, url: `${backendBaseUrl}${image.url}` };
                    }
                    return image;
                });
            }
            return venueObject;
        });
        const response = {
            success: true,
            data: venuesWithFullImageUrls,
            message: 'Venues retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to retrieve venues',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getAllVenues = getAllVenues;
// Get venue by ID
const getVenueById = async (req, res) => {
    try {
        const venue = await Venue_1.default.findById(req.params.id);
        if (!venue) {
            const response = {
                success: false,
                error: 'Venue not found',
            };
            return res.status(404).json(response);
        }
        const backendBaseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
        const venueObject = venue.toObject();
        if (venueObject.images && venueObject.images.length > 0) {
            venueObject.images = venueObject.images.map(image => {
                if (image.url && !image.url.startsWith('http')) {
                    return { ...image, url: `${backendBaseUrl}${image.url}` };
                }
                return image;
            });
        }
        const response = {
            success: true,
            data: venueObject,
            message: 'Venue retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to retrieve venue',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getVenueById = getVenueById;
// Create a new venue
const createVenue = async (req, res) => {
    try {
        const newVenue = new Venue_1.default(req.body);
        const savedVenue = await newVenue.save();
        const response = {
            success: true,
            data: savedVenue,
            message: 'Venue created successfully'
        };
        res.status(201).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to create venue',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.createVenue = createVenue;
// Update a venue
const updateVenue = async (req, res) => {
    try {
        console.log('updateVenue starting - headers:', req.headers);
        console.log('req.user in updateVenue:', JSON.stringify(req.user, null, 2)); // Added for debugging
        console.log('req.body keys:', Object.keys(req.body));
        console.log('req.body types:', Object.keys(req.body).map(key => `${key}: ${typeof req.body[key]}`));
        console.log('req.files:', req.files);
        const venueId = req.params.id;
        console.log('venueId:', venueId);
        const hostId = req.user.id; // Assuming host authentication from middleware
        console.log('hostId:', hostId);
        const files = req.files;
        const body = req.body;
        const existingVenueDoc = await Venue_1.default.findById(venueId);
        console.log('existingVenueDoc found:', !!existingVenueDoc);
        if (!existingVenueDoc) {
            return res.status(404).json({ success: false, error: 'Venue not found' });
        }
        // Ensure the user updating is the host who owns the venue
        if (existingVenueDoc.hostId?.toString() !== hostId) {
            console.log('Host ID mismatch', {
                docHostId: existingVenueDoc.hostId?.toString(),
                requestHostId: hostId
            });
            return res.status(403).json({ success: false, error: 'Forbidden: You do not own this venue.' });
        }
        // Deep copy existing venue data to work with plain objects
        const existingVenue = existingVenueDoc.toObject();
        // --- Parse other fields from body or use existing ---
        console.log('Parsing fields from body or using existing');
        const name = body.name || existingVenue.name;
        const description = body.description || existingVenue.description;
        console.log('About to parse location');
        let parsedLocation;
        try {
            parsedLocation = body.location ? JSON.parse(body.location) : existingVenue.location;
            console.log('location parsed successfully');
        }
        catch (error) {
            console.error('Error parsing location:', error);
            console.log('body.location type:', typeof body.location);
            console.log('body.location value:', body.location);
            // If JSON.parse fails, try to use the location fields directly from body
            parsedLocation = {
                address: body['location[address]'] || existingVenue.location.address,
                city: body['location[city]'] || existingVenue.location.city,
                state: body['location[state]'] || existingVenue.location.state,
                zipCode: body['location[zipCode]'] || existingVenue.location.zipCode,
                country: body['location[country]'] || existingVenue.location.country,
                coordinates: {
                    latitude: parseFloat(body['location[coordinates][latitude]']) || existingVenue.location.coordinates.latitude,
                    longitude: parseFloat(body['location[coordinates][longitude]']) || existingVenue.location.coordinates.longitude
                }
            };
            console.log('Using manually constructed location:', parsedLocation);
        }
        console.log('About to handle type');
        // For type and amenities, check if they are arrays directly in body or need to be extracted
        let parsedType;
        if (Array.isArray(body.type)) {
            parsedType = body.type;
        }
        else if (body['type[]']) {
            parsedType = Array.isArray(body['type[]']) ? body['type[]'] : [body['type[]']];
        }
        else {
            try {
                parsedType = body.type ? JSON.parse(body.type) : existingVenue.type;
            }
            catch (error) {
                console.error('Error parsing type, using existing:', error);
                parsedType = existingVenue.type;
            }
        }
        console.log('parsedType:', parsedType);
        console.log('About to parse capacity');
        let parsedCapacity;
        try {
            parsedCapacity = body.capacity ? JSON.parse(body.capacity) : existingVenue.capacity;
        }
        catch (error) {
            console.error('Error parsing capacity:', error);
            parsedCapacity = {
                min: parseInt(body['capacity[min]']) || existingVenue.capacity.min,
                max: parseInt(body['capacity[max]']) || existingVenue.capacity.max
            };
            console.log('Using manually constructed capacity:', parsedCapacity);
        }
        console.log('About to parse pricing');
        let parsedPricing = existingVenue.pricing; // Initialize with existing pricing
        // Debug logs for dynamic pricing FormData fields
        console.log('Dynamic pricing form fields:', {
            weekendEnabled: body['pricing[dynamicPricing][weekendPricing][enabled]'],
            weekendType: body['pricing[dynamicPricing][weekendPricing][type]'],
            weekendValue: body['pricing[dynamicPricing][weekendPricing][value]'],
            lastMinuteEnabled: body['pricing[dynamicPricing][lastMinuteDiscount][enabled]'],
            lastMinuteType: body['pricing[dynamicPricing][lastMinuteDiscount][type]'],
            lastMinuteValue: body['pricing[dynamicPricing][lastMinuteDiscount][value]'],
            lastMinuteDays: body['pricing[dynamicPricing][lastMinuteDiscount][daysBeforeEvent]']
        });
        // Debug logs for packages FormData fields
        let packageFieldsFound = [];
        for (let i = 0; i < 10; i++) {
            if (body[`pricing[packages][${i}][name]`] !== undefined) {
                packageFieldsFound.push({
                    index: i,
                    name: body[`pricing[packages][${i}][name]`],
                    description: body[`pricing[packages][${i}][description]`],
                    price: body[`pricing[packages][${i}][price]`],
                    itemCount: Object.keys(body).filter(key => key.startsWith(`pricing[packages][${i}][items]`)).length
                });
            }
        }
        console.log('Package fields found in FormData:', packageFieldsFound);
        if (body.pricing) {
            try {
                // This will likely only work if the client sends a JSON string for pricing
                // For FormData, individual fields are typically used
                parsedPricing = JSON.parse(body.pricing);
            }
            catch (error) {
                console.error('Error parsing pricing JSON, attempting to read from individual fields:', error);
                // Fallback to reading individual fields if JSON.parse fails or body.pricing is not a string
                parsedPricing = {
                    basePrice: parseFloat(body['pricing[basePrice]']) || existingVenue.pricing.basePrice,
                    currency: body['pricing[currency]'] || existingVenue.pricing.currency,
                    packages: existingVenue.pricing.packages, // Keep existing packages by default
                    dynamicPricing: existingVenue.pricing.dynamicPricing // Keep existing dynamic pricing by default
                };
            }
        }
        // Handle pricing data from FormData if not provided as a single JSON string in body.pricing
        // This is the typical case for FormData
        if (body['pricing[basePrice]']) {
            parsedPricing.basePrice = parseFloat(body['pricing[basePrice]']);
            parsedPricing.currency = body['pricing[currency]'] || parsedPricing.currency || 'USD';
        }
        // Parse dynamic pricing options if available from FormData
        if (body['pricing[dynamicPricing][weekendPricing][enabled]'] !== undefined || body['pricing[dynamicPricing][lastMinuteDiscount][enabled]'] !== undefined) {
            console.log('Found dynamic pricing fields in FormData');
            // Better handling of boolean conversion from string values
            const weekendEnabled = body['pricing[dynamicPricing][weekendPricing][enabled]'] === 'true' ||
                body['pricing[dynamicPricing][weekendPricing][enabled]'] === true;
            const lastMinuteEnabled = body['pricing[dynamicPricing][lastMinuteDiscount][enabled]'] === 'true' ||
                body['pricing[dynamicPricing][lastMinuteDiscount][enabled]'] === true;
            parsedPricing.dynamicPricing = {
                weekendPricing: {
                    enabled: weekendEnabled,
                    type: body['pricing[dynamicPricing][weekendPricing][type]'] || 'percentage',
                    value: parseFloat(body['pricing[dynamicPricing][weekendPricing][value]']) || 0
                },
                lastMinuteDiscount: {
                    enabled: lastMinuteEnabled,
                    type: body['pricing[dynamicPricing][lastMinuteDiscount][type]'] || 'percentage',
                    value: parseFloat(body['pricing[dynamicPricing][lastMinuteDiscount][value]']) || 0,
                    daysBeforeEvent: parseInt(body['pricing[dynamicPricing][lastMinuteDiscount][daysBeforeEvent]']) || 7
                }
            };
            console.log('Parsed dynamic pricing:', JSON.stringify(parsedPricing.dynamicPricing, null, 2));
        }
        else {
            console.log('No dynamic pricing fields found in FormData');
            // Ensure dynamicPricing object exists if not set from FormData
            if (!parsedPricing.dynamicPricing) {
                parsedPricing.dynamicPricing = {
                    weekendPricing: { enabled: false, type: 'percentage', value: 0 },
                    lastMinuteDiscount: { enabled: false, type: 'percentage', value: 0, daysBeforeEvent: 7 }
                };
                console.log('Using default dynamic pricing structure');
            }
        }
        // Parse packages from FormData
        // This assumes packages are sent as pricing[packages][0][name], pricing[packages][0][price] etc.
        const packagesFromData = [];
        let packageIndex = 0;
        // First, check if we have any package-related fields
        const hasPackageFields = Object.keys(body).some(key => key.startsWith('pricing[packages]'));
        console.log('Has package fields in FormData:', hasPackageFields);
        while (body[`pricing[packages][${packageIndex}][name]`] !== undefined) {
            console.log(`Processing package at index ${packageIndex}`);
            const pkg = {
                id: body[`pricing[packages][${packageIndex}][id]`] || (0, uuid_1.v4)(),
                name: body[`pricing[packages][${packageIndex}][name]`] || '',
                description: body[`pricing[packages][${packageIndex}][description]`] || '',
                price: parseFloat(body[`pricing[packages][${packageIndex}][price]`]) || 0,
                items: []
            };
            let itemIndex = 0;
            while (body[`pricing[packages][${packageIndex}][items][${itemIndex}]`] !== undefined) {
                const itemValue = body[`pricing[packages][${packageIndex}][items][${itemIndex}]`];
                if (itemValue && itemValue.trim() !== '') { // Only add non-empty items
                    pkg.items.push(itemValue);
                }
                itemIndex++;
            }
            console.log(`Package ${packageIndex} has ${pkg.items.length} items`);
            packagesFromData.push(pkg);
            packageIndex++;
        }
        console.log(`Found ${packagesFromData.length} packages in FormData`);
        // Ensure parsedPricing.packages is always initialized
        if (!parsedPricing.packages) {
            parsedPricing.packages = [];
        }
        if (packagesFromData.length > 0) {
            parsedPricing.packages = packagesFromData;
            console.log('Using packages from FormData');
        }
        else if (hasPackageFields) {
            // If we have package fields but couldn't parse any complete packages,
            // it might mean the client is sending an empty array to clear packages
            parsedPricing.packages = [];
            console.log('Clearing packages (empty array found in FormData)');
        }
        else {
            // No package fields at all, keep existing packages if any
            console.log('No package fields found, keeping existing packages:', existingVenue.pricing.packages ? existingVenue.pricing.packages.length : 0);
            parsedPricing.packages = existingVenue.pricing.packages || [];
        }
        console.log('Final packages count:', parsedPricing.packages ? parsedPricing.packages.length : 0);
        // If packagesFromData is empty, and packages existed, we keep the existing ones
        console.log('About to handle amenities');
        let parsedAmenities;
        if (Array.isArray(body.amenities)) {
            parsedAmenities = body.amenities;
        }
        else if (body['amenities[]']) {
            parsedAmenities = Array.isArray(body['amenities[]']) ? body['amenities[]'] : [body['amenities[]']];
        }
        else {
            try {
                parsedAmenities = body.amenities ? JSON.parse(body.amenities) : existingVenue.amenities;
            }
            catch (error) {
                console.error('Error parsing amenities, using existing:', error);
                parsedAmenities = existingVenue.amenities;
            }
        }
        console.log('parsedAmenities:', parsedAmenities);
        console.log('About to parse contactInfo');
        let parsedContactInfo;
        try {
            parsedContactInfo = body.contactInfo ? JSON.parse(body.contactInfo) : existingVenue.contactInfo;
        }
        catch (error) {
            console.error('Error parsing contactInfo:', error);
            parsedContactInfo = {
                phone: body['contactInfo[phone]'] || existingVenue.contactInfo.phone,
                email: body['contactInfo[email]'] || existingVenue.contactInfo.email,
                website: body['contactInfo[website]'] || existingVenue.contactInfo.website
            };
            console.log('Using manually constructed contactInfo:', parsedContactInfo);
        }
        const primaryImageIdentifier = body.primaryImage; // Filename for new, URL for existing
        const existingImageUrlsToKeep = body.existingImageUrls ? (Array.isArray(body.existingImageUrls) ? body.existingImageUrls : [body.existingImageUrls]) : [];
        const backendBaseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
        let finalImages = [];
        // 1. Process existing images: keep, update, or mark for deletion
        const imagesToDeleteFromStorage = [];
        if (existingVenue.images && existingVenue.images.length > 0) {
            existingVenue.images.forEach((img) => {
                const fullExistingUrl = img.url.startsWith('http') ? img.url : `${backendBaseUrl}${img.url}`;
                // Check if this existing image is in the list of URLs to keep
                if (existingImageUrlsToKeep.includes(fullExistingUrl) || existingImageUrlsToKeep.includes(img.url)) {
                    finalImages.push({
                        ...img, // Spread the plain object properties
                        url: img.url.startsWith('/') ? img.url : `/uploads/venues/${path_1.default.basename(img.url)}`, // Ensure relative URL for DB
                        isPrimary: false, // Reset, will be determined later
                    });
                }
                else {
                    // This image was not in existingImageUrlsToKeep, so mark its file for deletion
                    imagesToDeleteFromStorage.push(img.url);
                }
            });
        }
        // 2. Process new uploaded images
        const newUploadedImages = [];
        if (files && files.length > 0) {
            files.forEach((file) => {
                const uniqueFilename = `${(0, uuid_1.v4)()}-${file.originalname.replace(/\s+/g, '_')}`;
                const relativeUrl = `/uploads/venues/${uniqueFilename}`;
                newUploadedImages.push({
                    id: (0, uuid_1.v4)(),
                    url: relativeUrl, // Store relative path in DB
                    alt: name || 'Venue image',
                    isPrimary: false,
                    originalFilenameForMatching: file.originalname, // Temporary for matching primaryImageIdentifier
                });
            });
            finalImages = finalImages.concat(newUploadedImages);
        }
        // 3. Set primary image
        let primaryWasSet = false;
        if (primaryImageIdentifier && finalImages.length > 0) {
            finalImages = finalImages.map(img => {
                const fullImgUrl = img.url.startsWith('http') ? img.url : `${backendBaseUrl}${img.url}`;
                // Check new images by original filename, or existing by URL (relative or full)
                const isMatch = img.originalFilenameForMatching === primaryImageIdentifier ||
                    img.url === primaryImageIdentifier ||
                    fullImgUrl === primaryImageIdentifier;
                if (isMatch && !primaryWasSet) {
                    img.isPrimary = true;
                    primaryWasSet = true;
                }
                else {
                    img.isPrimary = false;
                }
                delete img.originalFilenameForMatching; // Clean up temporary property
                return img;
            });
        }
        // If no primary was set (e.g., identifier didn't match, or no identifier provided) AND there are images, make the first one primary.
        if (!primaryWasSet && finalImages.length > 0) {
            // Ensure all are false first, then set the first one
            finalImages = finalImages.map(img => ({ ...img, isPrimary: false }));
            finalImages[0].isPrimary = true;
        }
        else if (finalImages.length > 0) {
            // Ensure only one is primary if multiple somehow got set (defensive)
            let foundOnePrimary = false;
            finalImages = finalImages.map(img => {
                if (img.isPrimary) {
                    if (foundOnePrimary)
                        img.isPrimary = false;
                    else
                        foundOnePrimary = true;
                }
                return img;
            });
            // If, after all, none is primary (e.g. identified primary was removed and not re-assigned), set first.
            if (!foundOnePrimary && finalImages.length > 0) {
                finalImages = finalImages.map(img => ({ ...img, isPrimary: false }));
                finalImages[0].isPrimary = true;
            }
        }
        // 4. Delete image files that were removed
        imagesToDeleteFromStorage.forEach(imageUrlToDelete => {
            try {
                const imagePath = path_1.default.join(uploadsDir, path_1.default.basename(imageUrlToDelete));
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlinkSync(imagePath);
                }
            }
            catch (err) {
                console.error(`Failed to delete image file from storage: ${imageUrlToDelete}`, err);
                // Non-critical, log and continue
            }
        });
        // Save new files *after* processing existing ones to avoid deleting a just-uploaded file if names clash (unlikely with uuid)
        if (files && files.length > 0) {
            newUploadedImages.forEach(newImgData => {
                const fileData = files.find(f => f.originalname === newImgData.originalFilenameForMatching);
                if (fileData) {
                    const uniqueFsName = path_1.default.basename(newImgData.url); // get the uuid part from relativeUrl
                    const filePath = path_1.default.join(uploadsDir, uniqueFsName);
                    fs_1.default.writeFileSync(filePath, fileData.buffer);
                }
            });
        }
        const updatePayload = {
            name,
            description,
            location: parsedLocation,
            type: parsedType,
            capacity: parsedCapacity,
            pricing: parsedPricing,
            amenities: parsedAmenities,
            contactInfo: parsedContactInfo,
            images: finalImages.map(img => ({ id: img.id, url: img.url, alt: img.alt, isPrimary: img.isPrimary })), // Ensure clean objects
        };
        // Log the final pricing data being sent to the database
        console.log('Final pricing data for update:', JSON.stringify(updatePayload.pricing, null, 2));
        // Log if packages exist and their count
        console.log('Packages being saved:', updatePayload.pricing?.packages ?
            `${updatePayload.pricing.packages.length} packages` :
            'No packages');
        // Create a targeted update operation instead of updating the whole document
        // This provides more control over nested fields
        const updateOperation = {
            $set: {
                'name': updatePayload.name,
                'description': updatePayload.description,
                'location': updatePayload.location,
                'type': updatePayload.type,
                'capacity': updatePayload.capacity,
                'amenities': updatePayload.amenities,
                'contactInfo': updatePayload.contactInfo,
                'images': updatePayload.images,
            }
        };
        // Add pricing fields if they exist
        if (updatePayload.pricing) {
            console.log("Pricing update received:", JSON.stringify(updatePayload.pricing, null, 2));
            console.log("Original pricing:", JSON.stringify(existingVenue.pricing, null, 2));
            // Ensure basePrice is explicitly updated
            if (updatePayload.pricing.basePrice !== undefined) {
                updateOperation.$set['pricing.basePrice'] = Number(updatePayload.pricing.basePrice);
                console.log("Setting basePrice to:", updateOperation.$set['pricing.basePrice']);
            }
            if (updatePayload.pricing.currency) {
                updateOperation.$set['pricing.currency'] = updatePayload.pricing.currency;
            }
            if (updatePayload.pricing.pricingType) {
                updateOperation.$set['pricing.pricingType'] = updatePayload.pricing.pricingType;
            }
            if (updatePayload.pricing.dynamicPricing) {
                updateOperation.$set['pricing.dynamicPricing'] = updatePayload.pricing.dynamicPricing;
            }
            if (updatePayload.pricing.packages) {
                // Directly save the packages array
                updateOperation.$set['pricing.packages'] = [...updatePayload.pricing.packages];
                console.log('Setting packages directly:', JSON.stringify(updateOperation.$set['pricing.packages'], null, 2));
            }
            console.log("Updated pricing object:", JSON.stringify(updateOperation.$set['pricing'], null, 2));
        }
        // Log the update operation
        console.log('Update operation:', JSON.stringify(updateOperation, null, 2));
        // APPROACH 1: Using findByIdAndUpdate (which might have issues with nested objects)
        console.log('APPROACH 1: attempting findByIdAndUpdate');
        const updatedVenueDoc = await Venue_1.default.findByIdAndUpdate(venueId, updateOperation, { new: true, runValidators: true });
        // Log the result after database update
        console.log('Updated venue pricing after DB update (Approach 1):', updatedVenueDoc ?
            JSON.stringify(updatedVenueDoc.toObject().pricing, null, 2) :
            'No venue document returned');
        // APPROACH 2: Manual find and save (more reliable for nested objects)
        console.log('APPROACH 2: attempting manual find and save');
        try {
            const venueToUpdate = await Venue_1.default.findById(venueId);
            if (venueToUpdate) {
                // Apply direct property updates to ensure nested objects are properly updated
                if (updatePayload.name)
                    venueToUpdate.name = updatePayload.name;
                if (updatePayload.description)
                    venueToUpdate.description = updatePayload.description;
                if (updatePayload.location)
                    venueToUpdate.location = updatePayload.location;
                if (updatePayload.type)
                    venueToUpdate.type = updatePayload.type;
                if (updatePayload.capacity)
                    venueToUpdate.capacity = updatePayload.capacity;
                if (updatePayload.amenities)
                    venueToUpdate.amenities = updatePayload.amenities;
                if (updatePayload.contactInfo)
                    venueToUpdate.contactInfo = updatePayload.contactInfo;
                if (updatePayload.images)
                    venueToUpdate.images = updatePayload.images;
                if (updatePayload.pricing) {
                    console.log("Pricing update received:", JSON.stringify(updatePayload.pricing, null, 2));
                    console.log("Original pricing:", JSON.stringify(venueToUpdate.pricing, null, 2));
                    // Ensure basePrice is explicitly updated
                    if (updatePayload.pricing.basePrice !== undefined) {
                        venueToUpdate.pricing.basePrice = Number(updatePayload.pricing.basePrice);
                        console.log("Setting basePrice to:", venueToUpdate.pricing.basePrice);
                    }
                    if (updatePayload.pricing.currency) {
                        venueToUpdate.pricing.currency = updatePayload.pricing.currency;
                    }
                    if (updatePayload.pricing.pricingType) {
                        venueToUpdate.pricing.pricingType = updatePayload.pricing.pricingType;
                    }
                    if (updatePayload.pricing.dynamicPricing) {
                        venueToUpdate.pricing.dynamicPricing = updatePayload.pricing.dynamicPricing;
                    }
                    if (updatePayload.pricing.packages) {
                        // Directly save the packages array
                        venueToUpdate.pricing.packages = [...updatePayload.pricing.packages];
                        console.log('Setting packages directly:', JSON.stringify(venueToUpdate.pricing.packages, null, 2));
                    }
                    console.log("Updated pricing object:", JSON.stringify(venueToUpdate.pricing, null, 2));
                }
                // Save the venue document
                const savedVenue = await venueToUpdate.save();
                console.log('Venue saved successfully with approach 2:', savedVenue ?
                    JSON.stringify(savedVenue.toObject().pricing, null, 2) :
                    'Save failed');
                // Override the response venue with the one from approach 2
                if (savedVenue) {
                    return res.status(200).json({
                        success: true,
                        data: savedVenue.toObject(),
                        message: 'Venue updated successfully (approach 2)'
                    });
                }
            }
        }
        catch (error) {
            console.error('Error with approach 2:', error);
        }
        // APPROACH 3: Direct MongoDB update targeting packages specifically
        console.log('APPROACH 3: attempting direct update to packages field');
        try {
            if (updatePayload.pricing && updatePayload.pricing.packages) {
                const directUpdateResult = await Venue_1.default.updateOne({ _id: venueId }, { $set: { "pricing.packages": updatePayload.pricing.packages } });
                console.log('Direct packages update result:', directUpdateResult);
                // Verify the update by fetching the document again
                const verifyVenue = await Venue_1.default.findById(venueId);
                if (verifyVenue) {
                    console.log('Packages after direct update:', JSON.stringify(verifyVenue.pricing.packages, null, 2));
                    // If we got here and the other approaches failed, use this result
                    if (!updatedVenueDoc) {
                        return res.status(200).json({
                            success: true,
                            data: verifyVenue.toObject(),
                            message: 'Venue updated successfully (approach 3)'
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error('Error with approach 3:', error);
        }
        if (!updatedVenueDoc) {
            return res.status(404).json({ success: false, error: 'Venue not found after update attempt' });
        }
        // Convert to plain object and ensure full URLs for response
        const responseVenue = updatedVenueDoc.toObject();
        if (responseVenue.images && responseVenue.images.length > 0) {
            responseVenue.images = responseVenue.images.map((image) => {
                if (image.url && !image.url.startsWith('http')) {
                    return { ...image, url: `${backendBaseUrl}${image.url}` };
                }
                return image;
            });
        }
        const apiResponse = {
            success: true,
            data: responseVenue,
            message: 'Venue updated successfully'
        };
        res.status(200).json(apiResponse);
    }
    catch (error) {
        console.error('Error updating venue:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: error.message,
                details: error.errors
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update venue',
            message: error.message || 'An unexpected error occurred'
        });
    }
};
exports.updateVenue = updateVenue;
// Delete a venue
const deleteVenue = async (req, res) => {
    try {
        const deletedVenue = await Venue_1.default.findByIdAndDelete(req.params.id);
        if (!deletedVenue) {
            const response = {
                success: false,
                error: 'Venue not found',
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            message: 'Venue deleted successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to delete venue',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.deleteVenue = deleteVenue;
// Search venues by filters
const searchVenues = async (req, res) => {
    try {
        const { location, minCapacity, maxCapacity, amenities, type, minPrice, maxPrice } = req.query;
        const query = {};
        if (location) {
            query['location.city'] = { $regex: location, $options: 'i' };
        }
        if (minCapacity) {
            query['capacity.max'] = { $gte: Number(minCapacity) };
        }
        if (maxCapacity) {
            query['capacity.min'] = { $lte: Number(maxCapacity) };
        }
        if (amenities) {
            query.amenities = { $in: amenities.split(',') };
        }
        if (type) {
            query.type = { $in: type.split(',') };
        }
        if (minPrice) {
            query['pricing.basePrice'] = { $gte: Number(minPrice) };
        }
        if (maxPrice) {
            if (query['pricing.basePrice']) {
                query['pricing.basePrice'].$lte = Number(maxPrice);
            }
            else {
                query['pricing.basePrice'] = { $lte: Number(maxPrice) };
            }
        }
        const venues = await Venue_1.default.find(query);
        const response = {
            success: true,
            data: venues,
            message: 'Venues retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Failed to search venues',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.searchVenues = searchVenues;
// Create a venue as a host
const createVenueAsHost = async (req, res) => {
    try {
        const hostId = req.user.id;
        const files = req.files;
        const body = req.body;
        // --- Parse stringified JSON fields ---
        let parsedLocation;
        if (body.location) {
            if (typeof body.location === 'string') {
                try {
                    parsedLocation = JSON.parse(body.location);
                }
                catch (error) {
                    console.error('Error parsing location string:', error);
                    // Fall through to individual field handling
                }
            }
            else if (typeof body.location === 'object') {
                // Already an object, use directly
                parsedLocation = body.location;
            }
            // If parsing failed or not attempted, try to build from individual fields
            if (!parsedLocation) {
                parsedLocation = {
                    address: body['location[address]'] || '',
                    city: body['location[city]'] || '',
                    state: body['location[state]'] || '',
                    zipCode: body['location[zipCode]'] || '',
                    country: body['location[country]'] || '',
                    coordinates: {
                        latitude: parseFloat(body['location[coordinates][latitude]']) || 0,
                        longitude: parseFloat(body['location[coordinates][longitude]']) || 0
                    }
                };
            }
        }
        let parsedType;
        if (body.type) {
            if (typeof body.type === 'string') {
                try {
                    parsedType = JSON.parse(body.type);
                }
                catch (error) {
                    console.error('Error parsing type string:', error);
                    // Fall through to Array check
                }
            }
            else if (Array.isArray(body.type)) {
                // Already an array, use directly
                parsedType = body.type;
            }
            // If parsing failed or body.type is not a string or array
            if (!parsedType) {
                // Try to extract from form data fields
                if (body['type[]']) {
                    parsedType = Array.isArray(body['type[]']) ? body['type[]'] : [body['type[]']];
                }
                else {
                    parsedType = [];
                }
            }
        }
        let parsedCapacity;
        if (body.capacity) {
            if (typeof body.capacity === 'string') {
                try {
                    parsedCapacity = JSON.parse(body.capacity);
                }
                catch (error) {
                    console.error('Error parsing capacity string:', error);
                    // Fall through to individual field handling
                }
            }
            else if (typeof body.capacity === 'object') {
                // Already an object, use directly
                parsedCapacity = body.capacity;
            }
            // If parsing failed or not attempted, try to build from individual fields
            if (!parsedCapacity) {
                parsedCapacity = {
                    min: parseInt(body['capacity[min]']) || 0,
                    max: parseInt(body['capacity[max]']) || 0
                };
            }
        }
        let parsedPricing = {
            basePrice: 0,
            currency: 'USD',
            packages: [] // Initialize packages as an empty array
        };
        // Try to parse pricing from a single JSON string first (less common for FormData)
        if (body.pricing) {
            if (typeof body.pricing === 'string') {
                try {
                    parsedPricing = JSON.parse(body.pricing);
                    // Ensure packages is an array if parsedPricing.packages is undefined
                    if (!parsedPricing.packages) {
                        parsedPricing.packages = [];
                    }
                }
                catch (error) {
                    console.error('Error parsing body.pricing JSON, will attempt to read individual fields.', error);
                    // If JSON.parse fails, individual fields will be checked next.
                    // Initialize packages here to ensure it's an array if body.pricing parsing failed early
                    parsedPricing.packages = [];
                }
            }
            else if (typeof body.pricing === 'object') {
                // Already an object, use directly
                parsedPricing = body.pricing;
                // Ensure packages is an array
                if (!parsedPricing.packages) {
                    parsedPricing.packages = [];
                }
            }
        }
        let parsedAmenities;
        if (body.amenities) {
            if (typeof body.amenities === 'string') {
                try {
                    parsedAmenities = JSON.parse(body.amenities);
                }
                catch (error) {
                    console.error('Error parsing amenities string:', error);
                }
            }
            else if (Array.isArray(body.amenities)) {
                // Already an array, use directly
                parsedAmenities = body.amenities;
            }
            // If parsing failed or body.amenities is not a string or array
            if (!parsedAmenities) {
                // Try to extract from form data fields
                if (body['amenities[]']) {
                    parsedAmenities = Array.isArray(body['amenities[]']) ? body['amenities[]'] : [body['amenities[]']];
                }
                else {
                    parsedAmenities = [];
                }
            }
        }
        let parsedContactInfo;
        if (body.contactInfo) {
            if (typeof body.contactInfo === 'string') {
                try {
                    parsedContactInfo = JSON.parse(body.contactInfo);
                }
                catch (error) {
                    console.error('Error parsing contactInfo string:', error);
                    // Fall through to individual field handling
                }
            }
            else if (typeof body.contactInfo === 'object') {
                // Already an object, use directly
                parsedContactInfo = body.contactInfo;
            }
            // If parsing failed or not attempted, try to build from individual fields
            if (!parsedContactInfo) {
                parsedContactInfo = {
                    email: body['contactInfo[email]'] || '',
                    phone: body['contactInfo[phone]'] || '',
                    website: body['contactInfo[website]'] || ''
                };
            }
        }
        const primaryImageIndex = body.primaryImageIndex ? parseInt(body.primaryImageIndex, 10) : 0;
        // --- Process uploaded images ---
        const imagesData = [];
        if (files && files.length > 0) {
            files.forEach((file, index) => {
                // Generate a unique filename to prevent overwrites
                const uniqueFilename = `${(0, uuid_1.v4)()}-${file.originalname}`;
                const filePath = path_1.default.join(uploadsDir, uniqueFilename);
                // Save the file from buffer (multer memory storage)
                fs_1.default.writeFileSync(filePath, file.buffer);
                // Construct the URL for the image - this will be an absolute URL
                const backendBaseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
                const imageUrl = `${backendBaseUrl}/uploads/venues/${uniqueFilename}`;
                imagesData.push({
                    id: (0, uuid_1.v4)(), // Or generate as needed by your Image type
                    url: imageUrl,
                    alt: body.name || 'Venue image', // Use venue name as alt text or a default
                    isPrimary: index === primaryImageIndex,
                });
            });
        }
        const newVenueData = {
            name: body.name,
            description: body.description,
            hostId,
            location: parsedLocation,
            type: parsedType,
            capacity: parsedCapacity,
            pricing: parsedPricing,
            amenities: parsedAmenities,
            contactInfo: parsedContactInfo,
            images: imagesData,
            // Default other fields if necessary
            availability: [],
            reviews: [],
        };
        // Log the final pricing data being saved
        console.log('Final pricing data for create:', JSON.stringify(newVenueData.pricing, null, 2));
        // Log if packages exist and their count
        console.log('Packages being saved:', newVenueData.pricing?.packages ?
            `${newVenueData.pricing.packages.length} packages` :
            'No packages');
        // Make sure packages are properly set before saving
        if (newVenueData.pricing && Array.isArray(newVenueData.pricing.packages)) {
            console.log('Explicitly ensuring packages array:', newVenueData.pricing.packages);
        }
        const newVenue = new Venue_1.default(newVenueData);
        const savedVenue = await newVenue.save();
        // Log the result after database save
        console.log('Saved venue pricing after DB save:', savedVenue ?
            JSON.stringify(savedVenue.toObject().pricing, null, 2) :
            'No venue document returned');
        // Verify packages were saved
        if (savedVenue && (!savedVenue.pricing.packages || savedVenue.pricing.packages.length === 0) &&
            newVenueData.pricing && newVenueData.pricing.packages && newVenueData.pricing.packages.length > 0) {
            console.log('Packages not saved! Attempting direct update...');
            // Direct update as fallback
            try {
                const directUpdateResult = await Venue_1.default.updateOne({ _id: savedVenue._id }, { $set: { "pricing.packages": newVenueData.pricing.packages } });
                console.log('Direct packages update result:', directUpdateResult);
                // Fetch the updated document
                const updatedVenue = await Venue_1.default.findById(savedVenue._id);
                if (updatedVenue) {
                    savedVenue.pricing.packages = updatedVenue.pricing.packages;
                    console.log('Packages after direct update:', JSON.stringify(updatedVenue.pricing.packages, null, 2));
                }
            }
            catch (error) {
                console.error('Failed direct package update:', error);
            }
        }
        await Host_1.default.findByIdAndUpdate(hostId, { $push: { venues: savedVenue._id } });
        const response = {
            success: true,
            data: savedVenue.toObject(),
            message: 'Venue created successfully by host'
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating venue as host:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: error.message,
                details: error.errors // Send Mongoose validation error details
            });
        }
        if (error.message && error.message.includes('Image files only')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid file type',
                message: 'Only image files (jpeg, jpg, png, gif, webp) are allowed.'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create venue',
            message: error.message || 'An unexpected error occurred'
        });
    }
};
exports.createVenueAsHost = createVenueAsHost;
// Dedicated function for updating packages
const updatePackages = async (req, res) => {
    try {
        console.log('updatePackages called with body:', JSON.stringify(req.body, null, 2));
        const venueId = req.params.id;
        const hostId = req.user.id;
        const { packages } = req.body;
        // Verify venue exists and belongs to this host
        const existingVenueDoc = await Venue_1.default.findById(venueId);
        if (!existingVenueDoc) {
            return res.status(404).json({ success: false, error: 'Venue not found' });
        }
        if (existingVenueDoc.hostId?.toString() !== hostId) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You do not own this venue.'
            });
        }
        console.log('Received packages:', JSON.stringify(packages, null, 2));
        if (!packages || !Array.isArray(packages)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid packages data. Expected an array.'
            });
        }
        // Directly update with raw MongoDB command
        const updateResult = await Venue_1.default.collection.updateOne({ _id: new mongoose_1.default.Types.ObjectId(venueId) }, { $set: { "pricing.packages": packages } });
        console.log('Direct MongoDB update result:', updateResult);
        // Fetch the updated document
        const updatedVenue = await Venue_1.default.findById(venueId);
        if (!updatedVenue) {
            return res.status(500).json({
                success: false,
                error: 'Venue update verified failed'
            });
        }
        console.log('Venue packages after update:', updatedVenue.pricing.packages);
        const backendBaseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
        const venueObject = updatedVenue.toObject();
        // Format image URLs
        if (venueObject.images && venueObject.images.length > 0) {
            venueObject.images = venueObject.images.map((image) => {
                if (image.url && !image.url.startsWith('http')) {
                    return { ...image, url: `${backendBaseUrl}${image.url}` };
                }
                return image;
            });
        }
        const response = {
            success: true,
            data: venueObject,
            message: 'Venue packages updated successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating venue packages:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update venue packages',
            message: error.message || 'An unexpected error occurred'
        });
    }
};
exports.updatePackages = updatePackages;
// Dedicated function for updating dynamic pricing
const updateDynamicPricing = async (req, res) => {
    try {
        console.log('updateDynamicPricing called with body:', JSON.stringify(req.body, null, 2));
        const venueId = req.params.id;
        const hostId = req.user.id;
        const { dynamicPricing } = req.body;
        // Verify venue exists and belongs to this host
        const existingVenueDoc = await Venue_1.default.findById(venueId);
        if (!existingVenueDoc) {
            return res.status(404).json({ success: false, error: 'Venue not found' });
        }
        if (existingVenueDoc.hostId?.toString() !== hostId) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You do not own this venue.'
            });
        }
        console.log('Received dynamicPricing:', JSON.stringify(dynamicPricing, null, 2));
        if (!dynamicPricing || typeof dynamicPricing !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Invalid dynamic pricing data. Expected an object.'
            });
        }
        // Format and validate the dynamic pricing data
        const formattedDynamicPricing = {
            weekendPricing: {
                enabled: !!dynamicPricing.weekendPricing?.enabled,
                type: dynamicPricing.weekendPricing?.type || 'percentage',
                value: parseFloat(dynamicPricing.weekendPricing?.value) || 0
            },
            lastMinuteDiscount: {
                enabled: !!dynamicPricing.lastMinuteDiscount?.enabled,
                type: dynamicPricing.lastMinuteDiscount?.type || 'percentage',
                value: parseFloat(dynamicPricing.lastMinuteDiscount?.value) || 0,
                daysBeforeEvent: parseInt(dynamicPricing.lastMinuteDiscount?.daysBeforeEvent) || 7
            }
        };
        console.log('Formatted dynamicPricing:', JSON.stringify(formattedDynamicPricing, null, 2));
        // Directly update with raw MongoDB command
        const updateResult = await Venue_1.default.collection.updateOne({ _id: new mongoose_1.default.Types.ObjectId(venueId) }, { $set: { "pricing.dynamicPricing": formattedDynamicPricing } });
        console.log('Direct MongoDB update result:', updateResult);
        // Fetch the updated document
        const updatedVenue = await Venue_1.default.findById(venueId);
        if (!updatedVenue) {
            return res.status(500).json({
                success: false,
                error: 'Venue update verification failed'
            });
        }
        console.log('Venue dynamicPricing after update:', updatedVenue.pricing.dynamicPricing);
        const backendBaseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
        const venueObject = updatedVenue.toObject();
        // Format image URLs
        if (venueObject.images && venueObject.images.length > 0) {
            venueObject.images = venueObject.images.map((image) => {
                if (image.url && !image.url.startsWith('http')) {
                    return { ...image, url: `${backendBaseUrl}${image.url}` };
                }
                return image;
            });
        }
        const response = {
            success: true,
            data: venueObject,
            message: 'Venue dynamic pricing updated successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating venue dynamic pricing:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update venue dynamic pricing',
            message: error.message || 'An unexpected error occurred'
        });
    }
};
exports.updateDynamicPricing = updateDynamicPricing;
// Dedicated function for updating base price
const updateBasePrice = async (req, res) => {
    try {
        console.log('updateBasePrice called with body:', JSON.stringify(req.body, null, 2));
        const venueId = req.params.id;
        const hostId = req.user.id;
        const { basePrice } = req.body;
        if (basePrice === undefined || isNaN(Number(basePrice))) {
            return res.status(400).json({
                success: false,
                error: 'Invalid basePrice. Expected a number.'
            });
        }
        // Verify venue exists and belongs to this host
        const existingVenueDoc = await Venue_1.default.findById(venueId);
        if (!existingVenueDoc) {
            return res.status(404).json({ success: false, error: 'Venue not found' });
        }
        if (existingVenueDoc.hostId?.toString() !== hostId) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You do not own this venue.'
            });
        }
        console.log(`Updating basePrice for venue ${venueId} to: ${basePrice}`);
        // Directly update with raw MongoDB command
        const updateResult = await Venue_1.default.collection.updateOne({ _id: new mongoose_1.default.Types.ObjectId(venueId) }, { $set: { "pricing.basePrice": Number(basePrice) } });
        console.log('Direct MongoDB update result:', updateResult);
        // Fetch the updated document
        const updatedVenue = await Venue_1.default.findById(venueId);
        if (!updatedVenue) {
            return res.status(500).json({
                success: false,
                error: 'Venue update verification failed'
            });
        }
        console.log('Venue basePrice after update:', updatedVenue.pricing.basePrice);
        const backendBaseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
        const venueObject = updatedVenue.toObject();
        // Format image URLs
        if (venueObject.images && venueObject.images.length > 0) {
            venueObject.images = venueObject.images.map((image) => {
                if (image.url && !image.url.startsWith('http')) {
                    return { ...image, url: `${backendBaseUrl}${image.url}` };
                }
                return image;
            });
        }
        const response = {
            success: true,
            data: venueObject,
            message: 'Venue base price updated successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating venue base price:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update venue base price',
            message: error.message || 'An unexpected error occurred'
        });
    }
};
exports.updateBasePrice = updateBasePrice;
