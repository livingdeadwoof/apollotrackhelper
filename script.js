document.addEventListener('DOMContentLoaded', () => {
    const statusMessage = document.getElementById('status-message');

    statusMessage.textContent = "App loaded. Initializing map...";

    // Initialize the map
    const map = L.map('map').setView([0, 0], 2); // Default view, will be overridden by user location

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let currentLocationMarker = null; // Marker for current location
    let accuracyCircle = null;       // Circle for location accuracy
    let pathCoordinates = [];        // Array to store previous locations for the path
    let pathPolyline = null;         // Polyline to draw the path

    // Check if the browser supports Geolocation API
    if ("geolocation" in navigator) {
        statusMessage.textContent = "Geolocation supported. Requesting position...";

        // Options for watchPosition
        const watchOptions = {
            enableHighAccuracy: true, // Request high accuracy (GPS if available)
            timeout: 10000,           // Increased timeout to 10 seconds
            maximumAge: 0             // Don't use a cached position
        };

        // Watch the user's position
        navigator.geolocation.watchPosition(
            (position) => {
                statusMessage.textContent = "Location received! Updating map...";
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy; // Accuracy in meters
                const currentLatLng = [lat, lng];

                // Update status message
                statusMessage.textContent = `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)} (Accuracy: ±${accuracy.toFixed(0)}m)`;

                // Update map view to current location
                map.setView(currentLatLng, 16); // Zoom level 16 is good for street view

                // Update or create current location marker
                if (currentLocationMarker) {
                    currentLocationMarker.setLatLng(currentLatLng);
                } else {
                    currentLocationMarker = L.marker(currentLatLng).addTo(map)
                        .bindPopup("You are here!")
                        .openPopup();
                }

                // Update or create accuracy circle
                if (accuracyCircle) {
                    accuracyCircle.setLatLng(currentLatLng).setRadius(accuracy);
                } else {
                    accuracyCircle = L.circle(currentLatLng, { radius: accuracy, color: 'blue', fillColor: '#30f', fillOpacity: 0.2 }).addTo(map);
                }

                // Add current coordinates to path
                pathCoordinates.push(currentLatLng);

                // Update or create path polyline
                if (pathPolyline) {
                    pathPolyline.setLatLngs(pathCoordinates);
                } else {
                    pathPolyline = L.polyline(pathCoordinates, { color: 'red', weight: 4, opacity: 0.7 }).addTo(map);
                }

                // Optional: Trim path to prevent it from getting too long
                if (pathCoordinates.length > 50) {
                    pathCoordinates = pathCoordinates.slice(-50);
                    pathPolyline.setLatLngs(pathCoordinates);
                }

            },
            (error) => {
                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Error: Location access denied. Please enable location services for your browser.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Error: Location information is unavailable. Check your device's GPS/Wi-Fi.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Error: The request to get user location timed out. Try again or check signal.";
                        break;
                    default:
                        errorMessage = `Error: An unknown error occurred: ${error.message}`;
                }
                statusMessage.textContent = errorMessage;
                console.error("Geolocation Error:", error);
            },
            watchOptions
        );
    } else {
        statusMessage.textContent = "Error: Geolocation is not supported by your browser.";
        console.error("Geolocation is not supported by this browser.");
    }
});
