const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Calculate travel times from all members to a specific location
router.post('/calculate', async (req, res) => {
  try {
    const { memberIds, locationId } = req.body;
    const members = await Member.find({ _id: { $in: memberIds } });
    const location = await Location.findById(locationId);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Process in batches due to API limits
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < members.length; i += batchSize) {
      const batchMembers = members.slice(i, i + batchSize);
      
      // Prepare destinations array for Routes API
      const destinations = batchMembers.map(member => ({
        waypoint: {
          location: {
            latLng: {
              latitude: member.location.lat,
              longitude: member.location.lng
            }
          }
        }
      }));
      
      // Prepare origin for Routes API
      const origin = {
        waypoint: {
          location: {
            latLng: {
              latitude: location.location.lat,
              longitude: location.location.lng
            }
          }
        }
      };
      
      const response = await axios.post('https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix', {
        origins: [origin],
        destinations: destinations,
        travelMode: "DRIVE"
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status'
        }
      });
      
      // Process the response
      response.data.forEach((route, index) => {
        if (route.status === 'OK') {
          const member = batchMembers[route.destinationIndex];
          results.push({
            memberId: member._id,
            memberName: member.name,
            locationId: location._id,
            locationName: location.name,
            distance: `${(route.distanceMeters / 1000).toFixed(1)} km`,
            duration: formatDuration(route.duration),
            durationValue: parseDuration(route.duration)
          });
        }
      });
    }
    
    // Sort by duration
    results.sort((a, b) => a.durationValue - b.durationValue);
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function formatDuration(duration) {
  // Format duration from "123s" to human-readable format
  const seconds = parseInt(duration.replace('s', ''));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let result = '';
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  if (remainingSeconds > 0) result += `${remainingSeconds}s`;
  
  return result.trim();
}

function parseDuration(duration) {
  // Convert duration string to seconds for sorting
  return parseInt(duration.replace('s', ''));
}

module.exports = router;
