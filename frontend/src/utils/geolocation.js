/**
 * Returns a promise that resolves to { latitude, longitude, accuracy }.
 * Rejects if geolocation is unavailable or the user denies permission.
 */
export const getLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      reject,
      { enableHighAccuracy: true }
    );
  });
