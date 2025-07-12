document.addEventListener('DOMContentLoaded', () => {
    const statusMessage = document.getElementById('status-message');

    statusMessage.textContent = "App loaded. Initializing map..."; 

    try {
        // Initialize the map
        const map = L.map('map').setView([0, 0], 2); // Default view, will be overridden by user location
        statusMessage.textContent = "Map object created. Adding tiles..."; // NEW status update

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        statusMessage.textContent = "Map tiles added. Checking geolocation support..."; // NEW status update

        let currentLocationMarker = null;
        let accuracyCircle = null;
        let pathCoordinates = [];
        let pathPolyline = null;

        // Check if the browser supports Geolocation API
        if ("geolocation" in navigator) {
            statusMessage.textContent = "Geolocation supported. Requesting position...";

            const watchOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };

            navigator.geolocation.watchPosition(
                (position) => {
                    statusMessage.textContent = "Location received! Updating map...";
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const accuracy = position.coords.accuracy;
                    const currentLatLng = [lat, lng];

                    statusMessage.textContent = `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)} (Accuracy: ±${accuracy.toFixed(0)}m)`;

                    map.setView(currentLatLng, 16);

                    if (currentLocationMarker) {
                        currentLocationMarker.setLatLng(currentLatLng);
                    } else {
                        currentLocationMarker = L.marker(currentLatLng).addTo(map)
                            .bindPopup("You are here!")
                            .openPopup();
                    }

                    if (accuracyCircle) {
                        accuracyCircle.setLatLng(currentLatLng).setRadius(accuracy);
                    } else {
                        accuracyCircle = L.circle(currentLatLng, { radius: accuracy, color: 'blue', fillColor: '#30f', fillOpacity: 0.2 }).addTo(map);
                    }

                    pathCoordinates.push(currentLatLng);

                    if (pathPolyline) {
                        pathPolyline.setLatLngs(pathCoordinates);
                    } else {
                        pathPolyline = L.polyline(pathCoordinates, { color: 'red', weight: 4, opacity: 0.7 }).addTo(map);
                    }

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
    } catch (e) {
        statusMessage.textContent = `CRITICAL ERROR: Failed to initialize map. Details: ${e.message}. Check console for more.`; // NEW: Error message from try-catch
        console.error("CRITICAL MAP INITIALIZATION ERROR:", e);
    }
});
