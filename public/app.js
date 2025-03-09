// Will contain our JavaScript code
// Global variables
let map;
let members = [];
let groups = [];
let locations = [];
let markers = {};

// Define initMap globally
window.initMap = function () {
    const map = new google.maps.Map(document.getElementById('map-container'), {
      center: { lat: 48.2082, lng: 16.3738 }, // Default to Vienna
      zoom: 8,
    });
  };
  

function initApp() {
  // Load initial data
  fetchMembers();
  fetchGroups();
  fetchLocations();

  // Set up event listeners
  document.getElementById('add-member').addEventListener('click', showAddMemberModal);
  document.getElementById('add-group').addEventListener('click', showAddGroupModal);
  document.getElementById('add-location').addEventListener('click', showAddLocationModal);
  document.getElementById('auto-assign').addEventListener('click', autoAssignMembers);
}
// Member Functions
async function fetchMembers() {
    try {
      const response = await fetch('/api/members');
      members = await response.json();
      displayMembers();
      plotMembersOnMap();
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  }
  
  function displayMembers() {
    const membersList = document.getElementById('members-list');
    membersList.innerHTML = '';
    
    members.forEach(member => {
      const memberItem = document.createElement('div');
      memberItem.className = 'list-item';
      memberItem.innerHTML = `
        <span>${member.name}</span>
        <div class="item-actions">
          <button onclick="editMember('${member._id}')">Edit</button>
          <button onclick="deleteMember('${member._id}')">Delete</button>
        </div>
      `;
      membersList.appendChild(memberItem);
    });
  }
  
  function plotMembersOnMap() {
    // Clear existing member markers
    Object.keys(markers).forEach(id => {
      if (markers[id].type === 'member') {
        markers[id].marker.setMap(null);
        delete markers[id];
      }
    });
    
    // Add member markers
    members.forEach(member => {
      const marker = new google.maps.Marker({
        position: member.location,
        map: map,
        title: member.name,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
      });
      
      markers[member._id] = {
        marker: marker,
        type: 'member'
      };
      
      marker.addListener('click', () => {
        showMemberInfo(member);
      });
    });
  }
  
  function showAddMemberModal() {
    // Implement modal for adding a new member
    // This will include a form to input member details
  }
  
  async function createMember(memberData) {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      });
      
      const newMember = await response.json();
      members.push(newMember);
      displayMembers();
      plotMembersOnMap();
      
      // Close modal
    } catch (err) {
      console.error('Error creating member:', err);
    }
  }
  
  async function editMember(memberId) {
    // Implement edit member functionality
  }
  
  async function deleteMember(memberId) {
    if (confirm('Are you sure you want to delete this member?')) {
      try {
        await fetch(`/api/members/${memberId}`, {
          method: 'DELETE'
        });
        
        members = members.filter(member => member._id !== memberId);
        displayMembers();
        
        // Remove marker
        if (markers[memberId]) {
          markers[memberId].marker.setMap(null);
          delete markers[memberId];
        }
      } catch (err) {
        console.error('Error deleting member:', err);
      }
    }
  }
  
  // Group Functions
async function fetchGroups() {
    try {
      const response = await fetch('/api/groups');
      groups = await response.json();
      displayGroups();
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  }
  
  function displayGroups() {
    const groupsList = document.getElementById('groups-list');
    groupsList.innerHTML = '';
    
    groups.forEach(group => {
      const groupItem = document.createElement('div');
      groupItem.className = 'list-item';
      groupItem.innerHTML = `
        <span>${group.name}</span>
        <div class="item-actions">
          <button onclick="editGroup('${group._id}')">Edit</button>
          <button onclick="deleteGroup('${group._id}')">Delete</button>
          <button onclick="showGroup('${group._id}')">Show</button>
        </div>
      `;
      groupsList.appendChild(groupItem);
    });
  }
  
  function showAddGroupModal() {
    // Implement modal for adding a new group
    // This will include a form for group name, color, and filters
  }
  
  async function createGroup(groupData) {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupData)
      });
      
      const newGroup = await response.json();
      groups.push(newGroup);
      displayGroups();
      
      // Close modal
    } catch (err) {
      console.error('Error creating group:', err);
    }
  }
  
  async function editGroup(groupId) {
    // Implement edit group functionality
  }
  
  async function deleteGroup(groupId) {
    if (confirm('Are you sure you want to delete this group?')) {
      try {
        await fetch(`/api/groups/${groupId}`, {
          method: 'DELETE'
        });
        
        groups = groups.filter(group => group._id !== groupId);
        displayGroups();
        fetchMembers(); // Refresh members as group associations changed
      } catch (err) {
        console.error('Error deleting group:', err);
      }
    }
  }
  
  async function showGroup(groupId) {
    const group = groups.find(g => g._id === groupId);
    
    // Highlight this group's members on the map
    members.forEach(member => {
      if (member.groupIds.includes(groupId)) {
        if (markers[member._id]) {
          markers[member._id].marker.setIcon({
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          });
        }
      } else {
        if (markers[member._id]) {
          markers[member._id].marker.setIcon({
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          });
        }
      }
    });
  }
  
  async function autoAssignMembers() {
    try {
      // For each group, run auto-assign
      for (const group of groups) {
        await fetch(`/api/groups/${group._id}/auto-assign`, {
          method: 'POST'
        });
      }
      
      // Refresh data
      fetchGroups();
      fetchMembers();
    } catch (err) {
      console.error('Error auto-assigning members:', err);
    }
  }
  // Location Functions
async function fetchLocations() {
    try {
      const response = await fetch('/api/locations');
      locations = await response.json();
      displayLocations();
      plotLocationsOnMap();
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  }
  
  function displayLocations() {
    const locationsList = document.getElementById('locations-list');
    locationsList.innerHTML = '';
    
    locations.forEach(location => {
      const locationItem = document.createElement('div');
      locationItem.className = 'list-item';
      locationItem.innerHTML = `
        <span>${location.name}</span>
        <div class="item-actions">
          <button onclick="editLocation('${location._id}')">Edit</button>
          <button onclick="deleteLocation('${location._id}')">Delete</button>
          <button onclick="calculateTravelTimes('${location._id}')">Travel Times</button>
        </div>
      `;
      locationsList.appendChild(locationItem);
    });
  }
  
  function plotLocationsOnMap() {
    // Clear existing location markers
    Object.keys(markers).forEach(id => {
      if (markers[id].type === 'location') {
        markers[id].marker.setMap(null);
        delete markers[id];
      }
    });
    
    // Add location markers
    locations.forEach(location => {
      const marker = new google.maps.Marker({
        position: location.location,
        map: map,
        title: location.name,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      });
      
      markers[location._id] = {
        marker: marker,
        type: 'location'
      };
      
      marker.addListener('click', () => {
        showLocationInfo(location);
      });
    });
  }
  
  function showAddLocationModal() {
    // Implement modal for adding a new location
  }
  
  async function createLocation(locationData) {
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(locationData)
      });
      
      const newLocation = await response.json();
      locations.push(newLocation);
      displayLocations();
      plotLocationsOnMap();
      
      // Close modal
    } catch (err) {
      console.error('Error creating location:', err);
    }
  }
  
  async function editLocation(locationId) {
    // Implement edit location functionality
  }
  
  async function deleteLocation(locationId) {
    if (confirm('Are you sure you want to delete this location?')) {
      try {
        await fetch(`/api/locations/${locationId}`, {
          method: 'DELETE'
        });
        
        locations = locations.filter(location => location._id !== locationId);
        displayLocations();
        
        // Remove marker
        if (markers[locationId]) {
          markers[locationId].marker.setMap(null);
          delete markers[locationId];
        }
      } catch (err) {
        console.error('Error deleting location:', err);
      }
    }
  }
  
  // Travel Time Functions
async function calculateTravelTimes(locationId) {
    try {
      // Get all member IDs
      const memberIds = members.map(member => member._id);
      
      // Calculate travel times
      const response = await fetch('/api/travel/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberIds, locationId })
      });
      
      const travelTimes = await response.json();
      displayTravelTimes(travelTimes);
      visualizeTravelTimesOnMap(travelTimes, locationId);
    } catch (err) {
      console.error('Error calculating travel times:', err);
    }
  }
  
  function displayTravelTimes(travelTimes) {
    const travelTimesContainer = document.getElementById('travel-times');
    travelTimesContainer.innerHTML = '<h3>Travel Times</h3>';
    
    if (travelTimes.length === 0) {
      travelTimesContainer.innerHTML += '<p>No travel times available.</p>';
      return;
    }
    
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Member</th>
          <th>Distance</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody id="travel-times-body">
      </tbody>
    `;
    
    const tbody = table.querySelector('#travel-times-body');
    
    travelTimes.forEach(time => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${time.memberName}</td>
        <td>${time.distance}</td>
        <td>${time.duration}</td>
      `;
      tbody.appendChild(row);
    });
    
    travelTimesContainer.appendChild(table);
  }
  
  function visualizeTravelTimesOnMap(travelTimes, locationId) {
    // Reset all member markers to default
    members.forEach(member => {
      if (markers[member._id]) {
        markers[member._id].marker.setIcon({
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
      }
    });
    
    // Find the selected location
    const location = locations.find(loc => loc._id === locationId);
    
    // Create paths from members to location
    travelTimes.forEach(time => {
      const member = members.find(m => m._id === time.memberId);
      
      if (member && location) {
        // Draw a line from member to location
        const path = new google.maps.Polyline({
          path: [member.location, location.location],
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 0.5,
          strokeWeight: 2
        });
        
        path.setMap(map);
        
        // Store the path to clear it later
        if (!markers[member._id].paths) {
          markers[member._id].paths = [];
        }
        markers[member._id].paths.push(path);
        
        // Add info window with travel time
        const infoWindow = new google.maps.InfoWindow({
          content: `<div><strong>${member.name}</strong><br>Distance: ${time.distance}<br>Travel time: ${time.duration}</div>`
        });
        
        markers[member._id].marker.addListener('click', () => {
          infoWindow.open(map, markers[member._id].marker);
        });
      }
    });
  }
  
  const europeanCountries = [
    "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus",
    "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus",
    "Czech Republic (Czechia)", "Denmark", "Estonia", "Finland", "France",
    "Georgia", "Germany", "Greece", "Hungary", "Iceland", "Ireland",
    "Italy", "Kazakhstan", "Kosovo", "Latvia", "Liechtenstein",
    "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco",
    "Montenegro", "Netherlands", "North Macedonia", "Norway",
    "Poland", "Portugal", "Romania", "Russia", "San Marino",
    "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden",
    "Switzerland", "Turkey", "Ukraine", "United Kingdom (UK)",
    "Vatican City (Holy See)"
  ];
  
  document.addEventListener('DOMContentLoaded', () => {
    // List of European countries
    const europeanCountries = [
      "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus",
      "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus",
      "Czech Republic (Czechia)", "Denmark", "Estonia", "Finland", "France",
      "Georgia", "Germany", "Greece", "Hungary", "Iceland", "Ireland",
      "Italy", "Kazakhstan", "Kosovo", "Latvia", "Liechtenstein",
      "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco",
      "Montenegro", "Netherlands", "North Macedonia", "Norway",
      "Poland", "Portugal", "Romania", "Russia", "San Marino",
      "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden",
      "Switzerland", "Turkey", "Ukraine", "United Kingdom (UK)",
      "Vatican City (Holy See)"
    ];
  
    // Populate the dropdown menu
    const countrySelect = document.getElementById('country-select');
    europeanCountries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });
  
    // Handle dropdown selection
    countrySelect.addEventListener('change', () => {
      const selectedCountry = countrySelect.value;
      console.log(`Selected Country: ${selectedCountry}`);
      centerMapOnCountry(selectedCountry); // Center map based on selection
    });
  
    // Function to center map on selected country
    function centerMapOnCountry(country) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: country }, (results, status) => {
        if (status === 'OK') {
          const location = results[0].geometry.location;
          map.setCenter(location);
          map.setZoom(6); // Adjust zoom level as needed
          console.log(`Map centered on ${country}:`, location.toString());
        } else {
          console.error(`Geocode failed for ${country}: ${status}`);
        }
      });
    }
  });
  
  document.addEventListener('DOMContentLoaded', () => {
    let members = []; // Array to store member data
    let map; // Reference to Google Map
    let marker = null; // Marker for member location
  
    // Initialize map
    function initMap() {
      map = new google.maps.Map(document.getElementById('map-container'), {
        center: { lat: 48.2082, lng: 16.3738 }, // Default to Vienna (example)
        zoom: 8,
        styles: []
      });
  
      // Initialize Places Autocomplete
      const addressInput = document.getElementById('address-search');
      const autocomplete = new google.maps.places.Autocomplete(addressInput);
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          if (marker) marker.setMap(null); // Remove previous marker
          marker = new google.maps.Marker({
            position: place.geometry.location,
            map,
            title: place.formatted_address
          });
          map.setCenter(place.geometry.location);
          map.setZoom(14);
          console.log(`Selected location: ${place.formatted_address}`);
        }
      });
    }
  
    // Add Member Modal Logic
    const addMemberButton = document.getElementById('add-member');
    const addMemberModal = document.getElementById('add-member-modal');
    
  const modalOverlay=document.querySelector("#modal-overlay")
  function openModal(){
     addMemberModal.style.display=modalOverlay.style.display='block'
  }
  
  function closeModal(){
  addMemberModal.classList.remove("hidden")
  
  
    // Add Member Modal Logic
    const addMemberButton = document.getElementById('add-member');
    const addMemberModal = document.getElementById('add-member-modal');
    
    addMemberButton.addEventListener('click', () => {
      addMemberModal.style.display = 'block';
    });
  
    const cancelAddMemberButton = document.getElementById('cancel-add-member');
    
    cancelAddMemberButton.addEventListener('click', () => {
      addMemberModal.style.display = 'none';
    });
  
    const saveMemberButton = document.getElementById('save-member');
    
    saveMemberButton.addEventListener('click', () => {
      const name = document.getElementById('member-name').value.trim();
      
      if (!name || !marker) {
        alert('Please enter a name and select a location.');
        return;
      }
  
      const memberData = {
        name,
        location: { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() },
        elder: document.getElementById('elder').checked,
        servent: document.getElementById('servent').checked,
        spouse: document.getElementById('spouse').checked,
        kid: document.getElementById('kid').checked,
        familyHead: document.getElementById('family-head').checked
      };
  
      members.push(memberData); // Save member data to array
      console.log(`Saved member:`, memberData);
  
      // Reset modal fields
      addMemberModal.style.display = 'none';
      
      document.getElementById('member-name').value = '';
      
      ['elder', 'servent', 'spouse', 'kid', 'family-head'].forEach(id => {
        document.getElementById(id).checked = false;
      });
      
      if (marker) marker.setMap(null); 
    });
  
    
  // Show Members List Logic
  const showMembersButton = document.getElementById("show-members");
  const membersListContainer=document.querySelector("#members-list-container")
  showMembersButton.addEventListener("click",()=>{
     membersListContainer.classList.toggle("hidden")
  })
  });
  